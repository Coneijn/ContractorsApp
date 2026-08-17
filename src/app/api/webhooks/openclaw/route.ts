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
      target,       // 'TASK' o 'PROPERTY'
      taskId,       // Requerido si target es 'TASK'
      newStatus,    // Ej. 'COMPLETED', 'IN_PROGRESS'
      originalMessage // Opcional: el mensaje del contratista para los logs
    } = body;

    // Validación de campos mínimos requeridos por la base de datos
    if (!whatsappNumber || !propertyId || !target || !newStatus) {
      return NextResponse.json(
        { error: "Faltan datos requeridos (whatsappNumber, propertyId, target, newStatus)" }, 
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

      actionPerformed = `TASK_UPDATED_TO_${newStatus}`;
      actionDescription = `Tarea ${taskId} actualizada vía OpenClaw. Mensaje original: "${originalMessage || 'N/A'}"`;
    
    } else if (target === 'PROPERTY') {
      await prisma.property.update({
        where: { id: propertyId },
        data: { status: newStatus as PropertyStatus }
      });

      actionPerformed = `PROPERTY_UPDATED_TO_${newStatus}`;
      actionDescription = `Propiedad actualizada vía OpenClaw. Mensaje original: "${originalMessage || 'N/A'}"`;
    
    } else {
      return NextResponse.json({ error: "Target no válido. Debe ser 'TASK' o 'PROPERTY'" }, { status: 400 });
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