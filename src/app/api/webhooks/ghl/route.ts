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
    
    // NUEVO: Capturar descripción y otros campos custom desde GHL
    const description = customData.description || body.description;

    if (!appReferenceId) {
      return NextResponse.json({ 
        error: "Falta appReferenceId (Requerido para actualizar la tarea)",
        received: { appReferenceId: !!appReferenceId }
      }, { status: 400 });
    }

    // Mapeo Inverso: Traducir los Stages de GHL a los Status locales
    let localStatus: TaskStatus | undefined;
    
    if (ghlStage) {
      if (ghlStage.includes('Pending Estimate') || ghlStage.includes('Assigned')) {
        localStatus = 'PENDING';
      } else if (ghlStage.includes('In Progress')) {
        localStatus = 'IN_PROGRESS';
      } else if (ghlStage.includes('Pending Inspection') || ghlStage.includes('Invoice Submitted') || ghlStage.includes('Won')) {
        localStatus = 'COMPLETED';
      } else if (ghlStage.includes('Lost')) {
        localStatus = 'CANCELLED';
      }
    }

    // NUEVO: Construir dinámicamente qué vamos a actualizar en Prisma
    const updateData: any = {};
    if (localStatus) updateData.status = localStatus;
    if (description) updateData.description = description;

    // Si no hay nada que actualizar (ni status válido ni descripción), abortar con error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: "No se encontraron datos válidos para actualizar (Stage no reconocido o sin descripción nueva).",
        receivedStage: ghlStage 
      }, { status: 400 });
    }

    // Actualizar la tarea en la base de datos
    const updatedTask = await prisma.task.update({
      where: { id: appReferenceId },
      data: updateData
    });

    // Actualizar Property solo si hubo un cambio de status
    if (localStatus) {
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

    // REGISTRO DE AUDITORÍA (AUDIT LOG)
    await prisma.activityLog.create({
      data: {
        propertyId: updatedTask.propertyId,
        actorType: 'USER', // Utilizamos 'USER' como clasificador genérico del sistema/integración[cite: 1]
        actorName: 'GoHighLevel Integration', // Identifica claramente que el cambio provino de GHL[cite: 1]
        action: localStatus ? `GHL_SYNC_${localStatus}` : 'GHL_SYNC_UPDATE',
        description: `GHL actualizó la tarea. ${localStatus ? `Estado: ${localStatus} (Stage: ${ghlStage}).` : ''} ${description ? 'Descripción actualizada.' : ''}`,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Base de datos y Activity Log actualizados desde GHL con éxito",
      updatedFields: Object.keys(updateData)
    });

  } catch (error) {
    console.error("Error en Webhook inverso de GHL:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}