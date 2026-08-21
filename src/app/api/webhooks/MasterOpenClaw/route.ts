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
      target,              
      taskId,              
      newStatus,           
      subcontractorId,     
      description,         
      amount,              
      workDescription,     
      originalMessage,
      dueDate,             
      propertyUpdates,     
      invoiceId,           
      estimateId,          
      agreementId,
      // NUEVOS CAMPOS:
      address,             // Requerido para crear propiedades
      name,                // Requerido para crear contratistas
      phone,               // Requerido para crear contratistas (mapea a whatsappNumber)
      email,               // Opcional para contratistas
      trades               // Opcional para contratistas (mapea a tradeSpecialty)
    } = body;

    if (!target) {
      return NextResponse.json({ error: "Falta el campo requerido: target" }, { status: 400 });
    }

    const actorName = "OpenClaw Admin Agent";
    let actionPerformed = "";
    let actionDescription = "";
    let targetPropertyId = propertyId;
    let createdSubcontractorId = null; // Para guardar el ID si creamos un contratista

    // 3. LÓGICA POR OBJETIVO (TARGET)
    if (target === 'CREATE_PROPERTY') {
      // ✅ Creación de Propiedades (Corrige el error 500 validando address)
      const propAddress = address || (propertyUpdates && propertyUpdates.address);
      
      if (!propAddress) {
        return NextResponse.json({ error: "Falta el campo requerido 'address' para crear la propiedad." }, { status: 400 });
      }

      const propertyData: any = { ...propertyUpdates, address: propAddress };
      if (newStatus) propertyData.status = newStatus as PropertyStatus;

      const newProperty = await prisma.property.create({
        data: propertyData
      });

      targetPropertyId = newProperty.id; 
      actionPerformed = `ADMIN_PROPERTY_CREATED`;
      actionDescription = `El agente creó una nueva propiedad: ${propAddress}.`;

    } else if (target === 'CREATE_SUBCONTRACTOR') {
      // ✅ Creación de Contratistas (Devolverá el ID generado)
      if (!name || !phone) {
        return NextResponse.json({ error: "Faltan campos requeridos ('name' o 'phone') para crear el contratista." }, { status: 400 });
      }

      const newSubcontractor = await prisma.subcontractor.create({
        data: {
          name: name,
          whatsappNumber: phone,
          email: email || null,
          tradeSpecialty: trades || null,
          status: 'ACTIVE'
        }
      });

      createdSubcontractorId = newSubcontractor.id;
      // Nota: No seteamos targetPropertyId porque el contratista es una entidad global, no pertenece a una propiedad específica en este punto.

    } else if (target === 'TASK') {
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

    // 4.   Auditor a con ActorType.USER como solicitaste
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

    // ---> NOTIFICACIÓN A GHL (Sincronización Web -> GHL) <---
    if ((target === 'TASK' || target === 'NEW_TASK') && process.env.GHL_INBOUND_WEBHOOK_URL) {
      let ghlStage = "";
      if (newStatus === 'PENDING' || target === 'NEW_TASK') ghlStage = "1. Pending Estimate";
      else if (newStatus === 'IN_PROGRESS') ghlStage = "3. In Progress";
      else if (newStatus === 'COMPLETED') ghlStage = "4. Pending Inspection / QA";
      else if (newStatus === 'CANCELLED') ghlStage = "7. Lost (Cancelado)";

      if (ghlStage) {
        try {
          await fetch(process.env.GHL_INBOUND_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appReferenceId: taskId || targetPropertyId, // App Reference ID
              stage: ghlStage,
              source: 'master_openclaw_webhook'
            })
          });
        } catch (err) {
          console.error("Error al notificar a GHL (Master):", err);
        }
      }
    }

    // Preparamos el payload de respuesta
    const responsePayload: any = { success: true, message: "Operación ejecutada" };
    
    // Adjuntamos IDs generados según el target para que Frank los pueda usar
    if (target === 'CREATE_PROPERTY' && targetPropertyId) {
      responsePayload.propertyId = targetPropertyId;
    }
    if (target === 'CREATE_SUBCONTRACTOR' && createdSubcontractorId) {
      responsePayload.subcontractorId = createdSubcontractorId;
    }

    return NextResponse.json(responsePayload);

  } catch (error) {
    console.error("Error Webhook:", error);
    return NextResponse.json({ error: "Error interno en POST" }, { status: 500 });
  }
}

// ==========================================
// NUEVO ENDPOINT GET PARA LECTURA (Cerebro IA)
// ==========================================
export async function GET(req: Request) {
  // 1. Validación de seguridad vía Header (igual que el POST)
  const secret = req.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.OPENCLAW_ADMIN_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    // Expandimos los tipos permitidos
    const type = searchParams.get('type'); 
    const query = searchParams.get('query') || '';

    if (!type) {
      return NextResponse.json({ error: "Falta el parámetro 'type'" }, { status: 400 });
    }

    let results: any = [];

    // 2. Buscador Dinámico Universal
    if (type === 'property') {
      results = await prisma.property.findMany({
        where: { address: { contains: query, mode: 'insensitive' } },
        take: 10
      });
    } else if (type === 'subcontractor') {
      results = await prisma.subcontractor.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10
      });
    } else if (type === 'invoice') {
      results = await prisma.invoicePayment.findMany({
        where: {
          OR: [
            { property: { address: { contains: query, mode: 'insensitive' } } },
            { subcontractor: { name: { contains: query, mode: 'insensitive' } } }
          ]
        },
        include: { property: { select: { address: true } }, subcontractor: { select: { name: true } } },
        take: 10
      });
    } else if (type === 'task') {
      // Búsqueda de tareas por dirección, nombre de contratista o descripción
      results = await prisma.task.findMany({
        where: {
          OR: [
            { property: { address: { contains: query, mode: 'insensitive' } } },
            { description: { contains: query, mode: 'insensitive' } },
            { subcontractor: { name: { contains: query, mode: 'insensitive' } } }
          ]
        },
        include: { property: { select: { address: true } }, subcontractor: { select: { name: true } } },
        take: 10
      });
    } else if (type === 'estimate') {
      // Búsqueda de presupuestos por dirección o nombre de contratista
      results = await prisma.estimate.findMany({
        where: {
          OR: [
            { property: { address: { contains: query, mode: 'insensitive' } } },
            { subcontractor: { name: { contains: query, mode: 'insensitive' } } }
          ]
        },
        include: { property: { select: { address: true } }, subcontractor: { select: { name: true } } },
        take: 10
      });
    } else if (type === 'agreement') {
      // Búsqueda de contratos por dirección o nombre de contratista
      results = await prisma.agreement.findMany({
        where: {
          OR: [
            { property: { address: { contains: query, mode: 'insensitive' } } },
            { subcontractor: { name: { contains: query, mode: 'insensitive' } } }
          ]
        },
        include: { property: { select: { address: true } }, subcontractor: { select: { name: true } } },
        take: 10
      });
    } else {
      return NextResponse.json({ error: "Tipo no válido. Usa: property, subcontractor, invoice, task, estimate, agreement." }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: results });

  } catch (error) {
    console.error("Error GET Webhook:", error);
    return NextResponse.json({ error: "Error interno al consultar datos" }, { status: 500 });
  }
}