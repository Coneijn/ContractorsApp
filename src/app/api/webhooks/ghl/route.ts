// Archivo: app/api/webhooks/ghl/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, TaskStatus, PropertyStatus } from '@prisma/client';
import { GHL_CONTRACTOR_STAGE_MAP } from '@/lib/ghlMapping';

const prisma = new PrismaClient();

function mapGhlStageToTaskStatus(stage?: string): TaskStatus | undefined {
  if (!stage) return undefined;
  // Buscamos directamente el UUID en tu mapa maestro
  const mappedStatus = GHL_CONTRACTOR_STAGE_MAP[stage.trim()];
  return mappedStatus ? (mappedStatus as TaskStatus) : undefined;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Extraer identificadores y campos compatibles con el payload
    const customData = body.customData || {};
    const appReferenceId = customData.appReferenceId || body.appReferenceId;
    
    // Captura el stage desde customData, body directo o el campo typo de GHL 'pipleline_stage'
    const rawStage = customData.ghlStage || body.ghlStage || body.pipleline_stage || body.pipeline_stage;
    const description = customData.description || body.description || body.opportunity_name;

    if (!appReferenceId) {
      return NextResponse.json({
        error: "Falta appReferenceId (Requerido para actualizar la tarea)",
        received: { appReferenceId: !!appReferenceId }
      }, { status: 400 });
    }

    const localStatus = mapGhlStageToTaskStatus(rawStage);

    // Construir campos de actualización
    const updateData: { status?: TaskStatus; description?: string } = {};
    if (localStatus) updateData.status = localStatus;
    if (description) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        error: "No se encontraron datos válidos para actualizar (Stage no reconocido o sin descripción).",
        receivedStage: rawStage
      }, { status: 400 });
    }

    // Actualizar tarea en la base de datos
    const updatedTask = await prisma.task.update({
      where: { id: appReferenceId },
      data: updateData
    });

    // Sincronizar PropertyStatus según el TaskStatus
    if (localStatus) {
      let targetPropertyStatus: PropertyStatus | undefined;

      if (localStatus === TaskStatus.WON || localStatus === TaskStatus.INVOICE_SUBMITTED) {
        targetPropertyStatus = PropertyStatus.COMPLETED;
      } else if (
        localStatus === TaskStatus.IN_PROGRESS ||
        localStatus === TaskStatus.ASSIGNED_OR_TO_DO ||
        localStatus === TaskStatus.PENDING_ESTIMATE ||
        localStatus === TaskStatus.PENDING_INSPECTION_OR_QA
      ) {
        targetPropertyStatus = PropertyStatus.RENOVATING;
      }

      if (targetPropertyStatus) {
        await prisma.property.update({
          where: { id: updatedTask.propertyId },
          data: { status: targetPropertyStatus }
        });
      }
    }

    // Registro de auditoría
    await prisma.activityLog.create({
      data: {
        propertyId: updatedTask.propertyId,
        actorType: 'USER',
        actorName: 'GoHighLevel Integration',
        action: localStatus ? `GHL_SYNC_${localStatus}` : 'GHL_SYNC_UPDATE',
        description: `GHL actualizó la tarea. ${localStatus ? `Estado: ${localStatus} (Stage: ${rawStage}).` : ''} ${description ? 'Descripción actualizada.' : ''}`.trim(),
      }
    });

    return NextResponse.json({
      success: true,
      message: "Base de datos y Activity Log actualizados desde GHL con éxito",
      updatedFields: Object.keys(updateData)
    });

  } catch (error) {
    console.error("Error en Webhook de GHL:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}