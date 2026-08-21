// Archivo: app/api/webhooks/ghl/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // GHL deberá enviarnos en su Webhook el ID de la tarea y en qué etapa cayó
    const { appReferenceId, ghlStage } = body;

    if (!appReferenceId || !ghlStage) {
      return NextResponse.json({ error: "Faltan datos requeridos (appReferenceId, ghlStage)" }, { status: 400 });
    }

    // Mapeo Inverso: Traducir los 7 Stages de GHL a los 4 Status de tu base de datos
    let localStatus: TaskStatus | null = null;
    
    if (ghlStage.includes('Pending Estimate') || ghlStage.includes('Assigned')) {
      localStatus = 'PENDING';
    } else if (ghlStage.includes('In Progress')) {
      localStatus = 'IN_PROGRESS';
    } else if (ghlStage.includes('Pending Inspection') || ghlStage.includes('Invoice Submitted') || ghlStage.includes('Won')) {
      localStatus = 'COMPLETED';
    } else if (ghlStage.includes('Lost')) {
      localStatus = 'CANCELLED';
    }

    if (localStatus) {
      // OJO: Hacemos la actualización directa en Prisma. 
      // ¡NO LLAMAMOS A NINGÚN OTRO ENDPOINT AQUÍ PARA EVITAR CICLOS INFINITOS!
      const updatedTask = await prisma.task.update({
        where: { id: appReferenceId },
        data: { status: localStatus }
      });

      // Sincronizar también el estado de la propiedad como lo hace OpenClaw
      if (localStatus === 'COMPLETED') {
        await prisma.property.update({ 
          where: { id: updatedTask.propertyId }, 
          data: { status: 'COMPLETED' } 
        });
      } else if (localStatus === 'IN_PROGRESS' || localStatus === 'PENDING') {
        await prisma.property.update({ 
          where: { id: updatedTask.propertyId }, 
          data: { status: 'RENOVATING' } 
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Base de datos actualizada desde GHL con éxito" 
    });

  } catch (error) {
    console.error("Error en Webhook inverso de GHL:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}