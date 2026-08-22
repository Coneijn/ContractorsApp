// Archivo: app/api/webhooks/ghl/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Extraer desde customData con fallback al objeto raíz por compatibilidad
    const customData = body.customData || {};
    const appReferenceId = customData.appReferenceId || body.appReferenceId;
    const ghlStage = customData.ghlStage || body.ghlStage;

    if (!appReferenceId || !ghlStage) {
      return NextResponse.json({ 
        error: "Faltan datos requeridos (appReferenceId, ghlStage)",
        received: { appReferenceId: !!appReferenceId, ghlStage: !!ghlStage }
      }, { status: 400 });
    }

    // Mapeo Inverso: Traducir los Stages de GHL a los Status locales
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
      const updatedTask = await prisma.task.update({
        where: { id: appReferenceId },
        data: { status: localStatus }
      });

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

      // ---> NUEVO: REGISTRO DE AUDITORÍA (AUDIT LOG) <---
      await prisma.activityLog.create({
        data: {
          propertyId: updatedTask.propertyId,
          actorType: 'USER', // Utilizamos 'USER' como clasificador genérico del sistema/integración
          actorName: 'GoHighLevel Integration', // Identifica claramente que el cambio provino de GHL
          action: `GHL_SYNC_${localStatus}`,
          description: `GHL actualizó automáticamente el estado de la tarea a ${localStatus} (Stage: ${ghlStage}).`,
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Base de datos y Activity Log actualizados desde GHL con éxito" 
    });

  } catch (error) {
    console.error("Error en Webhook inverso de GHL:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}