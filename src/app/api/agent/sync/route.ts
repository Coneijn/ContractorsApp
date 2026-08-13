// app/api/agent/sync/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  // Capa de Seguridad: Validar un token en los Headers
  const authHeader = req.headers.get('authorization');
  
  // Debes configurar un AGENT_SECRET en tu archivo .env (ej. una contraseña segura)
  if (authHeader !== `Bearer ${process.env.AGENT_SECRET}`) {
    return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 });
  }

  try {
    // Extraer solo los datos estrictamente necesarios para la IA
    const properties = await prisma.property.findMany({
      where: { status: 'RENOVATING' },
      select: { 
        id: true, 
        address: true, 
        accessCodeOrLockbox: true,
        tasks: { 
            where: { 
            status: { in: ['PENDING', 'IN_PROGRESS'] } // Solo tareas no terminadas
          },
          select: {
            id: true,
            description: true,
            subcontractorId: true
            }
        }
      }
    });

    const contractors = await prisma.subcontractor.findMany({
      where: { status: 'ACTIVE' },
      select: { 
        id: true, 
        name: true, 
        whatsappNumber: true, 
        tradeSpecialty: true 
      }
    });

    // Formato AI-Friendly (JSON limpio y estructurado)
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        activeProperties: properties,
        roster: contractors
      }
    });
  } catch (error) {
    console.error("Error sincronizando datos con el agente:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}