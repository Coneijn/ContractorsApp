import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const secret = req.headers.get('x-webhook-secret');
  if (!secret || secret !== process.env.OPENCLAW_ADMIN_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { propertyId, note } = await req.json().catch(() => ({}));
  if (typeof propertyId !== 'string' || typeof note !== 'string') {
    return NextResponse.json({ error: 'propertyId y note (string) son requeridos' }, { status: 400 });
  }

  try {
    const property = await prisma.property.update({
      where: { id: propertyId },
      data: { note },
      select: { id: true, note: true },
    });
    return NextResponse.json(property);
  } catch {
    return NextResponse.json({ error: 'Property no encontrada' }, { status: 404 });
  }
}
