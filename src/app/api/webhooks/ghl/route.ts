// Archivo: app/api/webhooks/ghl/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Extracción de identificador y stage (soporta customData y raíz con typo de GHL)
    const customData = body.customData || {};
    const appReferenceId = customData.appReferenceId || body.appReferenceId;
    
    // GHL a menudo envía 'pipleline_stage' (con doble 'l') en el objeto raíz
    const rawStage = customData.ghlStage || body.pipleline_stage || body.pipeline_stage || body.ghlStage;

    // 2. Extracción de campos adicionales útiles del payload
    const opportunityName = body.opportunity_name;
    const ghlOpportunityId = body.id;
    const description = customData.description || body.description || opportunityName;
    const contractorName = body.full_name || `${body.first_name || ''} ${body.last_name || ''}`.trim();
    const contractorPhone = body.phone;

    if (!appReferenceId) {
      return NextResponse.json({ 
        error: "Falta appReferenceId (Requerido para actualizar la tarea)",
        received: { 
          hasAppReferenceId: false,
          opportunityId: ghlOpportunityId,
          opportunityName 
        }
      }, { status: 400 });
    }

    // 3. Mapeo de Stages de GHL a TaskStatus local
    let localStatus: TaskStatus | undefined;
    
    if (rawStage) {
      const stageLower = String(rawStage).toLowerCase();

      if (stageLower.includes('pending estimate') || stageLower.includes('assigned')) {
        localStatus = 'PENDING';
      } else if (stageLower.includes('in progress')) {
        localStatus = 'IN_PROGRESS';
      } else if (stageLower.includes('pending inspection') || stageLower.includes('invoice submitted') || stageLower.includes('won') || stageLower.includes('completed')) {
        localStatus = 'COMPLETED';
      } else if (stageLower.includes('lost') || stageLower.includes('cancelled') || stageLower.includes('canceled')) {
        localStatus = 'CANCELLED';
      }
    }

    // 4. Construcción de la data a actualizar
    const updateData: Record<string, any> = {};
    if (localStatus) updateData.status = localStatus;
    if (description) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: "No se encontraron datos válidos para actualizar (Stage no reconocido o sin cambios).",
        receivedStage: rawStage 
      }, { status: 400 });
    }

    // 5. Actualización de la Tarea en BD
    const updatedTask = await prisma.task.update({
      where: { id: appReferenceId },
      data: updateData
    });

    // 6. Sincronización del estado de la propiedad asociada
    if (localStatus && updatedTask.propertyId) {
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

    // 7. Registro en Audit Log
    if (updatedTask.propertyId) {
      await prisma.activityLog.create({
        data: {
          propertyId: updatedTask.propertyId,
          actorType: 'USER',
          actorName: contractorName ? `GHL: ${contractorName}` : 'GoHighLevel Integration',
          action: localStatus ? `GHL_SYNC_${localStatus}` : 'GHL_SYNC_UPDATE',
          description: `GHL actualizó la tarea. ${localStatus ? `Estado: ${localStatus} (Stage: ${rawStage}).` : ''} ${contractorPhone ? `Tel: ${contractorPhone}.` : ''}`.trim(),
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Base de datos y Activity Log actualizados desde GHL con éxito",
      updatedFields: Object.keys(updateData),
      taskId: updatedTask.id
    });

  } catch (error: any) {
    console.error("Error en Webhook inverso de GHL:", error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error?.message 
    }, { status: 500 });
  }
}