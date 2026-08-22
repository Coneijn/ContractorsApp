// src/app/api/webhooks/openclaw/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, TaskStatus, PropertyStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Extraemos el payload estructurado que envía OpenClaw
    const { 
      whatsappNumber, 
      propertyId, 
      target,       // 'TASK', 'PROPERTY' o 'NEW_TASK'
      taskId,       // Requerido si target es 'TASK'
      newStatus,    // Ej. 'COMPLETED', 'IN_PROGRESS' (Requerido para TASK y PROPERTY)
      description,  // Requerido si target es 'NEW_TASK'
      originalMessage // Opcional: el mensaje del contratista para los logs
    } = body;

    // Validación de campos mínimos requeridos por la base de datos
    if (!whatsappNumber || !propertyId || !target) {
      return NextResponse.json(
        { error: "Faltan datos requeridos (whatsappNumber, propertyId, target)" }, 
        { status: 400 }
      );
    }
    if ((target === 'TASK' || target === 'PROPERTY') && !newStatus) {
      return NextResponse.json(
        { error: "newStatus es requerido para actualizar tareas o propiedades" }, 
        { status: 400 }
      );
    }

    // 2. Identificar al contratista que originó la acción
    const subcontractor = await prisma.subcontractor.findUnique({
      where: { whatsappNumber: whatsappNumber },
    });

    if (!subcontractor) {
      return NextResponse.json(
        { error: `Contratista con número ${whatsappNumber} no encontrado en el sistema` }, 
        { status: 404 }
      );
    }

    let actionPerformed = "";
    let actionDescription = "";

    // 3. Ejecutar la modificación en la base de datos según el objetivo (Target)
    if (target === 'TASK') {
      if (!taskId) {
        return NextResponse.json({ error: "taskId es requerido cuando el target es TASK" }, { status: 400 });
      }
      
      await prisma.task.update({
        where: { id: taskId },
        data: { status: newStatus as TaskStatus }
      });

      // Si la tarea se completa, completamos la propiedad automáticamente para enviarla a Past Projects
      if (newStatus === 'COMPLETED') {
        await prisma.property.update({
          where: { id: propertyId },
          data: { status: 'COMPLETED' }
        });
      } else if (newStatus === 'IN_PROGRESS' || newStatus === 'PENDING') {
        await prisma.property.update({
          where: { id: propertyId },
          data: { status: 'RENOVATING' }
        });
      }

      actionPerformed = `TASK_UPDATED_TO_${newStatus}`;
      actionDescription = `Tarea ${taskId} actualizada vía OpenClaw. Mensaje original: "${originalMessage || 'N/A'}"`;
      
    } else if (target === 'PROPERTY') {
      await prisma.property.update({
        where: { id: propertyId },
        data: { status: newStatus as PropertyStatus }
      });
      actionPerformed = `PROPERTY_UPDATED_TO_${newStatus}`;
      actionDescription = `Propiedad actualizada vía OpenClaw. Mensaje original: "${originalMessage || 'N/A'}"`;
      
    } else if (target === 'NEW_TASK') {
      // Extraemos la descripción para la nueva asignación
      const taskDescription = description || originalMessage || "Nueva tarea asignada vía WhatsApp";
      
      await prisma.task.create({
        data: {
          propertyId: propertyId,
          subcontractorId: subcontractor.id,
          description: taskDescription,
          status: 'PENDING'
        }
      });
      
      // Aseguramos que la propiedad pase a RENOVATING para que aparezca en el tablero activo
      await prisma.property.update({
        where: { id: propertyId },
        data: { status: 'RENOVATING' }
      });
      
      actionPerformed = `NEW_TASK_CREATED`;
      actionDescription = `Nueva asignación creada vía OpenClaw: "${taskDescription}"`;

    } else {
      return NextResponse.json({ error: "Target no válido. Debe ser 'TASK', 'PROPERTY' o 'NEW_TASK'" }, { status: 400 });
    }

   // 4. Registrar en el Activity Log usando los tipos definidos en tu esquema
    await prisma.activityLog.create({
      data: {
        propertyId: propertyId,
        actorType: "SUBCONTRACTOR", // Clasificado bajo el Enum ActorType
        actorName: subcontractor.name,
        action: actionPerformed,
        description: actionDescription,
      }
    });

    // ---> NOTIFICACIÓN A GHL (Sincronización Web -> GHL Vía API v2) <---
    if ((target === 'TASK' || target === 'NEW_TASK') && process.env.GHL_API_TOKEN) {
      // 1. Mapeo de Etapas (Stages) a IDs reales de GHL
      let ghlPipelineStageId = "";
      if (newStatus === 'PENDING' || target === 'NEW_TASK') ghlPipelineStageId = process.env.GHL_STAGE_PENDING_ESTIMATE_ID;
      else if (newStatus === 'IN_PROGRESS') ghlPipelineStageId = process.env.GHL_STAGE_IN_PROGRESS_ID;
      else if (newStatus === 'COMPLETED') ghlPipelineStageId = process.env.GHL_STAGE_PENDING_QA_ID;
      else if (newStatus === 'CANCELLED') ghlPipelineStageId = process.env.GHL_STAGE_LOST_ID;

      const appReferenceId = taskId || propertyId; // Mantenemos la lógica de extracción
      const ghlLocationId = process.env.GHL_LOCATION_ID;

      if (ghlPipelineStageId && appReferenceId && ghlLocationId) {
        try {
          // ==========================================
          // PASO 1: BUSCAR LA OPORTUNIDAD EN GHL
          // ==========================================
          const searchUrl = `https://services.leadconnectorhq.com/opportunities/search?location_id=${ghlLocationId}&q=${appReferenceId}`;
          
          const searchRes = await fetch(searchUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.GHL_API_TOKEN}`,
              'Version': '2021-07-28',
              'Accept': 'application/json'
            }
          });

          if (!searchRes.ok) throw new Error(`GHL Search Error: ${searchRes.statusText}`);
          const searchData = await searchRes.json();
          const opportunities = searchData.opportunities || [];

          if (opportunities.length === 0) {
            console.warn(`No se encontró ninguna oportunidad en GHL con el App Reference ID: ${appReferenceId}`);
          } else {
            // ==========================================
            // PASO 2: FILTRAR Y ACTUALIZAR
            // ==========================================
            const customFieldId = process.env.GHL_CUSTOM_FIELD_APP_REF_ID; 
            
            // TypeScript inferirá 'opp: any', pero lo tipamos por seguridad
            let targetOpportunity = opportunities.find((opp: any) => {
              if (!opp.customFields) return false;
              return opp.customFields.some((cf: any) => cf.id === customFieldId && cf.value === appReferenceId);
            });

            if (!targetOpportunity) targetOpportunity = opportunities[0];

            const ghlOpportunityId = targetOpportunity.id;

            const updateRes = await fetch(`https://services.leadconnectorhq.com/opportunities/${ghlOpportunityId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GHL_API_TOKEN}`,
                'Version': '2021-07-28'
              },
              body: JSON.stringify({
                pipelineStageId: ghlPipelineStageId
              })
            });

            if (!updateRes.ok) {
              const errorDetails = await updateRes.json();
              console.error("GHL API Update Error:", errorDetails);
            }
          }
        } catch (err) {
          console.error("Error al notificar a GHL (API):", err);
        }
      } else {
        console.warn("Faltan variables para sincronizar GHL (Stage, Reference ID o Location ID)");
      }
    }

    // 5. Respuesta HTTP 200 directa para confirmar a OpenClaw que el trabajo se hizo
    return NextResponse.json({
       success: true,
       message: "Base de datos actualizada correctamente"
     });

  } catch (error) {
    console.error("Error al procesar la actualización desde OpenClaw:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al modificar la base de datos" }, 
      { status: 500 }
    );
  }
}