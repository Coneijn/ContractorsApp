// src/app/api/webhooks/MasterOpenClaw/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, TaskStatus, PropertyStatus, EstimateStatus, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  // Validación de seguridad vía Header usando OPENCLAW_ADMIN_SECRET
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.OPENCLAW_ADMIN_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 1. Extraemos el payload estructurado para el administrador usando su número de WhatsApp
    const {
      whatsappNumber,      // Número de WhatsApp del administrador que ejecuta la acción
      propertyId,          // ID de la propiedad (requerido para la mayoría de acciones)
      target,              // 'TASK', 'PROPERTY', 'INVOICE', 'ESTIMATE', 'NEW_TASK'
      taskId,              // Requerido si el target es 'TASK'
      newStatus,           // Nuevo estado según corresponda (TaskStatus, PropertyStatus, EstimateStatus, etc.)
      subcontractorId,     // Para asignar tareas o finanzas a un contratista específico
      description,         // Descripción para nuevas tareas o notas
      amount,              // Monto a pagar o acordado (para InvoicePayment / Estimate)
      workDescription,     // Descripción del trabajo para facturas o presupuestos
      originalMessage      // Mensaje o contexto original para los logs
    } = body;

    // Validación básica de campos mínimos con el número de teléfono
    if (!whatsappNumber || !target) {
      return NextResponse.json(
        { error: "Faltan datos requeridos (whatsappNumber, target)" },
        { status: 400 }
      );
    }

    // 2. Verificar que el usuario administrador exista y tenga rol permitido usando su whatsappNumber
    const adminUser = await prisma.user.findUnique({
      where: { whatsappNumber: whatsappNumber },
    });

    if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'OPS_MANAGER')) {
      return NextResponse.json(
        { error: `Usuario con número ${whatsappNumber} no autorizado o no encontrado como Administrador` },
        { status: 403 }
      );
    }

    const actorName = adminUser.name;

    let actionPerformed = "";
    let actionDescription = "";
    let targetPropertyId = propertyId;

    // 3. Ejecutar la modificación según el objetivo administrativo (Target)
    if (target === 'TASK') {
      if (!taskId) {
        return NextResponse.json({ error: "taskId es requerido cuando el target es TASK" }, { status: 400 });
      }

      const updateData: any = {};
      if (newStatus) updateData.status = newStatus as TaskStatus;
      if (subcontractorId) updateData.subcontractorId = subcontractorId;

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: updateData,
        include: { property: true }
      });

      targetPropertyId = updatedTask.propertyId;

      actionPerformed = `ADMIN_TASK_UPDATED_${newStatus || 'ASSIGNMENT'}`;
      actionDescription = `Admin ${actorName} actualizó la tarea ${taskId}. Mensaje: "${originalMessage || 'N/A'}"`;

    } else if (target === 'PROPERTY') {
      if (!propertyId || !newStatus) {
        return NextResponse.json({ error: "propertyId y newStatus son requeridos para actualizar propiedades" }, { status: 400 });
      }

      await prisma.property.update({
        where: { id: propertyId },
        data: { status: newStatus as PropertyStatus }
      });

      actionPerformed = `ADMIN_PROPERTY_UPDATED_TO_${newStatus}`;
      actionDescription = `Admin ${actorName} actualizó el estado de la propiedad a ${newStatus}.`;

    } else if (target === 'NEW_TASK') {
      if (!propertyId || !description) {
        return NextResponse.json({ error: "propertyId y description son requeridos para crear una nueva tarea" }, { status: 400 });
      }

      await prisma.task.create({
        data: {
          propertyId: propertyId,
          subcontractorId: subcontractorId || null,
          description: description,
          status: 'PENDING'
        }
      });

      // Aseguramos que la propiedad pase a RENOVATING si se le asigna chamba activa
      await prisma.property.update({
        where: { id: propertyId },
        data: { status: 'RENOVATING' }
      });

      actionPerformed = `ADMIN_NEW_TASK_CREATED`;
      actionDescription = `Admin ${actorName} creó una nueva tarea: "${description}"`;

    } else if (target === 'INVOICE') {
      // Control Financiero: setear montos a pagar por la tarea/servicio realizado
      if (!propertyId || !subcontractorId || amount === undefined) {
        return NextResponse.json(
          { error: "propertyId, subcontractorId y amount son requeridos para gestionar pagos/facturas" }, 
          { status: 400 }
        );
      }

      await prisma.invoicePayment.create({
        data: {
          propertyId: propertyId,
          subcontractorId: subcontractorId,
          workDescription: workDescription || "Servicio registrado por administración",
          agreedAmount: amount,
          requestedAmount: amount,
          status: PaymentStatus.PENDING
        }
      });

      actionPerformed = `ADMIN_INVOICE_CREATED`;
      actionDescription = `Admin ${actorName} registró un monto a pagar de $${amount} para el contratista.`;

    } else if (target === 'ESTIMATE') {
      if (!propertyId || !subcontractorId || !newStatus) {
        return NextResponse.json(
          { error: "propertyId, subcontractorId y newStatus (EstimateStatus) son requeridos para presupuestos" }, 
          { status: 400 }
        );
      }

      // Buscar o actualizar el presupuesto del contratista en la propiedad
      await prisma.estimate.create({
        data: {
          propertyId: propertyId,
          subcontractorId: subcontractorId,
          amount: amount || 0,
          status: newStatus as EstimateStatus,
          workDescription: workDescription || "Presupuesto gestionado por administración"
        }
      });

      actionPerformed = `ADMIN_ESTIMATE_STATUS_${newStatus}`;
      actionDescription = `Admin ${actorName} registró/actualizó el estado del presupuesto a ${newStatus}.`;

    } else {
      return NextResponse.json(
        { error: "Target no válido. Debe ser 'TASK', 'PROPERTY', 'NEW_TASK', 'INVOICE' o 'ESTIMATE'" },
        { status: 400 }
      );
    }

    // 4. Registrar la acción en el Activity Log usando actorType 'USER' por ser un administrador
    if (targetPropertyId) {
      await prisma.activityLog.create({
        data: {
          propertyId: targetPropertyId,
          actorType: "USER", 
          actorName: actorName,
          action: actionPerformed,
          description: actionDescription,
        }
      });
    }

    // 5. Respuesta HTTP 200 confirmando el éxito de la operación administrativa
    return NextResponse.json({
      success: true,
      message: "Operación administrativa ejecutada y registrada correctamente"
    });

  } catch (error) {
    console.error("Error al procesar la solicitud en MasterOpenClaw:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar el webhook administrativo" },
      { status: 500 }
    );
  }
}