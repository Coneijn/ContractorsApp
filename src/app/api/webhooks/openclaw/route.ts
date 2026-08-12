// src/app/api/webhooks/openclaw/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Idealmente, importa el cliente de prisma desde tu carpeta lib/utils si ya lo tienes instanciado globalmente
// import prisma from '@/lib/prisma'; 
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // NOTA: Ajusta estas variables dependiendo de cómo te mande el payload el Webhook de GoHighLevel
    const phone = body.contact?.phone || body.phone;
    const message = body.message || body.body; 

    if (!phone || !message) {
      return NextResponse.json({ error: "Faltan datos en el payload (teléfono o mensaje)" }, { status: 400 });
    }

    // ==========================================
    // FILTRO 1: ¿QUIÉN? (Validación de Identidad)
    // ==========================================
    // Buscamos al contratista por su número de WhatsApp
    const subcontractor = await prisma.subcontractor.findUnique({
      where: { whatsappNumber: phone },
    });

    if (!subcontractor) {
      // No está en el directorio. 
      // Retornamos success: true para que GHL no falle, pero con el mensaje de rechazo.
      return NextResponse.json({
        success: true,
        replyMessage: "Hola, actualmente no figuras en nuestro directorio de contratistas. Por favor, contacta a Carol o a Ventas para darte de alta."
      });
    }

    // ==========================================
    // FILTRO 2: ¿DÓNDE? (Validación de Propiedad)
    // ==========================================
    // Aquí es donde OpenClaw (tu agente) brilla. Necesita cruzar el mensaje con las propiedades.
    
    // Obtenemos un listado rápido de propiedades activas para pasárselo al prompt de OpenClaw
    const activeProperties = await prisma.property.findMany({
      select: { id: true, address: true, status: true },
      where: { status: 'RENOVATING' } 
    });

    // 🧠 [AQUÍ IRÍA LA LLAMADA A LA API DE TU AGENTE IA / OPENCLAW]
    // const prompt = `Mensaje: ${message}. Propiedades: ${JSON.stringify(activeProperties)}...`;
    // const iaResponse = await fetchOpenClawData(prompt);
    // const { propertyId, actionTarget } = iaResponse;

    // SIMULACIÓN DE RESULTADO DE LA IA:
    const propertyId = null; // Cambiar esto por el ID que devuelva OpenClaw

    if (!propertyId) {
      return NextResponse.json({
        success: true,
        replyMessage: "No logré identificar de qué propiedad me hablas. ¿Podrías ser un poco más específico (ej. enviar la dirección o el código)?"
      });
    }

    // ==========================================
    // FILTRO 3: ¿QUÉ? (Validación Lógica y Escritura)
    // ==========================================
    // Si llegamos aquí: ¡El número es válido y sabemos de qué propiedad hablan!
    // OpenClaw ahora te dirá qué hacer (actualizar tarea, registrar gasto, etc.)

    // Por ahora, registramos la interacción exitosa en el Activity Log para mantener la auditoría
    await prisma.activityLog.create({
      data: {
        propertyId: propertyId,
        actorType: "SUBCONTRACTOR",
        actorName: subcontractor.name,
        action: "WHATSAPP_MESSAGE_PROCESSED",
        description: `Mensaje de WhatsApp procesado vía OpenClaw: "${message}"`,
      }
    });

    // Esta es la respuesta que GoHighLevel agarrará para enviársela de vuelta al contratista
    return NextResponse.json({
      success: true,
      replyMessage: "¡Entendido! He actualizado la base de datos con tu reporte."
    });

  } catch (error) {
    console.error("Error en Webhook OpenClaw:", error);
    // Devolvemos 500 si el servidor truena, para que los logs de GHL lo registren
    return NextResponse.json({ error: "Error interno del servidor al procesar el mensaje" }, { status: 500 });
  }
}