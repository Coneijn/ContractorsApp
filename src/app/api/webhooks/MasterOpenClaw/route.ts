import { NextResponse } from 'next/server';
import { 
  PrismaClient, 
  TaskStatus, 
  PropertyStatus, 
  EstimateStatus, 
  PaymentStatus, 
  AgreementStatus,
  ActorType 
} from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  // 1. Validación de seguridad vía Header usando OPENCLAW_ADMIN_SECRET
  const secret = req.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.OPENCLAW_ADMIN_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 2. Extraemos el payload extendido con los nuevos campos necesarios
    const {
      propertyId,          
      target,              // 'TASK', 'PROPERTY', 'INVOICE', 'ESTIMATE', 'NEW_TASK', 'AGREEMENT'
      taskId,              
      newStatus,           
      subcontractorId,     
      description,         
      amount,              
      workDescription,     
      originalMessage,
      dueDate,             // NUEVO: Para actualizar fechas de tareas (ISO string)
      propertyUpdates,     // NUEVO: Objeto para actualizar lockbox, préstamos, etc.
      invoiceId,           // NUEVO: Para actualizar pagos existentes
      estimateId,          // NUEVO: Para aprobar/rechazar presupuestos existentes
      agreementId          // NUEVO: Para actualizar estado de contratos
    } = body;

    if (!target) {
      return NextResponse.json({ error: "Falta el campo requerido: target" }, { status: 400 });
    }

    const actorName = "OpenClaw Admin Agent";
    let actionPerformed = "";
    let actionDescription = "";
    let targetPropertyId = propertyId;

    // 3. LÓGICA POR OBJETIVO (TARGET)
    if (target === 'TASK') {
      // ✅ Gestión completa de Tareas
      if (!taskId) return NextResponse.json({ error: "taskId es requerido para TASK" }, { status: 400 });

      const updateData: any = {};
      if (newStatus) updateData.status = newStatus as TaskStatus;
      if (subcontractorId) updateData.subcontractorId = subcontractorId;
      if (dueDate) updateData.dueDate = new Date(dueDate); // Actualizar vencimiento

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: updateData
      });
      
      targetPropertyId = updatedTask.propertyId;
      actionPerformed = `ADMIN_TASK_UPDATED_${newStatus || 'MODIFIED'}`;
      actionDescription = `El agente actualizó la tarea ${taskId}. ${dueDate ? `Nueva fecha: ${dueDate}.` : ''} Contexto: "${originalMessage || 'N/A'}"`;

    } else if (target === 'PROPERTY') {
      // ✅ Actualización de Propiedades (Códigos, estados, finanzas)
      if (!propertyId) return NextResponse.json({ error: "propertyId es requerido para PROPERTY" }, { status: 400 });

      const propertyData: any = { ...propertyUpdates }; // Extrae datos financieros o de lockbox
      if (newStatus) propertyData.status = newStatus as PropertyStatus;

      await prisma.property.update({
        where: { id: propertyId },
        data: propertyData
      });

      actionPerformed = `ADMIN_PROPERTY_UPDATED`;
      actionDescription = `El agente actualizó detalles de la propiedad. ${newStatus ? `Estado a ${newStatus}.` : 'Campos operativos/financieros modificados.'}`;

    } else if (target === 'NEW_TASK') {
      // ✅ Creación de Tareas
      if (!propertyId || !description) return NextResponse.json({ error: "propertyId y description son requeridos" }, { status: 400 });

      await prisma.task.create({
        data: {
          propertyId: propertyId,
          subcontractorId: subcontractorId || null,
          description: description,
          status: 'PENDING',
          dueDate: dueDate ? new Date(dueDate) : null
        }
      });

      await prisma.property.update({ where: { id: propertyId }, data: { status: 'RENOVATING' } });

      actionPerformed = `ADMIN_NEW_TASK_CREATED`;
      actionDescription = `El agente asignó una nueva tarea: "${description}"`;

    } else if (target === 'INVOICE') {
      // ✅ Control Financiero y de Pagos (Crear o Actualizar)
      if (invoiceId) {
        // Actualizar factura existente
        const updateData: any = {};
        if (amount !== undefined) {
          updateData.agreedAmount = amount;
          updateData.requestedAmount = amount;
        }
        if (newStatus) updateData.status = newStatus as PaymentStatus;

        const updatedInvoice = await prisma.invoicePayment.update({
          where: { id: invoiceId },
          data: updateData
        });
        targetPropertyId = updatedInvoice.propertyId;
        actionPerformed = `ADMIN_INVOICE_UPDATED`;
        actionDescription = `El agente actualizó la factura ${invoiceId}.`;
      } else {
        // Crear nueva factura
        if (!propertyId || !subcontractorId || amount === undefined) {
          return NextResponse.json({ error: "propertyId, subcontractorId y amount son requeridos" }, { status: 400 });
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
        actionDescription = `El agente registró un monto a pagar de $${amount}.`;
      }

    } else if (target === 'ESTIMATE') {
      // ✅ Gestión de Presupuestos (Aprobar, Rechazar, Crear)
      if (estimateId && newStatus) {
        // Actualizar estado de presupuesto existente (Aprobar/Rechazar)
        const updatedEst = await prisma.estimate.update({
          where: { id: estimateId },
          data: { status: newStatus as EstimateStatus }
        });
        targetPropertyId = updatedEst.propertyId;
        actionPerformed = `ADMIN_ESTIMATE_${newStatus}`;
        actionDescription = `El agente actualizó el presupuesto ${estimateId} a ${newStatus}.`;
      } else {
        // Crear nuevo presupuesto
        if (!propertyId || !subcontractorId || !newStatus) return NextResponse.json({ error: "Faltan datos para crear ESTIMATE" }, { status: 400 });
        await prisma.estimate.create({
          data: {
            propertyId, subcontractorId, amount: amount || 0,
            status: newStatus as EstimateStatus,
            workDescription: workDescription || "Presupuesto de agente"
          }
        });
        actionPerformed = `ADMIN_ESTIMATE_CREATED`;
        actionDescription = `El agente registró un presupuesto en estado ${newStatus}.`;
      }

    } else if (target === 'AGREEMENT') {
      // ✅ Gestión de Acuerdos (Firmar/Validar contratos)
      if (!agreementId || !newStatus) return NextResponse.json({ error: "agreementId y newStatus requeridos" }, { status: 400 });

      const updatedAgreement = await prisma.agreement.update({
        where: { id: agreementId },
        data: { 
          status: newStatus as AgreementStatus,
          signedAt: newStatus === 'SIGNED' ? new Date() : null
        }
      });
      
      targetPropertyId = updatedAgreement.propertyId;
      actionPerformed = `ADMIN_AGREEMENT_${newStatus}`;
      actionDescription = `El agente marcó el contrato ${agreementId} como ${newStatus}.`;

    } else {
      return NextResponse.json({ error: "Target no válido." }, { status: 400 });
    }

    // 4. ✅ Auditoría con ActorType.USER como solicitaste
    if (targetPropertyId) {
      await prisma.activityLog.create({
        data: {
          propertyId: targetPropertyId,
          actorType: ActorType.USER,  // <-- Se registra como USER (administrador)
          actorName: actorName,
          action: actionPerformed,
          description: actionDescription,
        }
      });
    }

    return NextResponse.json({ success: true, message: "Operación ejecutada" });

  } catch (error) {
    console.error("Error Webhook:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}