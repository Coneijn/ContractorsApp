"use server" // Esto le dice a Next.js que este código solo corre en el servidor

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Función para obtener las propiedades y sus contratistas asignados
export async function getActiveAssignments() {
  try {
    const properties = await prisma.property.findMany({
      // Quitamos el 'where: status: RENOVATING' para poder traer también los Past Projects
      include: {
        tasks: {
          include: {
            subcontractor: true
          }
        },
        estimates: true,
        invoices: true
      }
    });
         
    // Convertimos los objetos Decimal a números para que Next.js los pueda serializar
    const plainProperties = properties.map((property) => ({
      ...property,
      estimates: property.estimates.map((est) => ({
        ...est,
        amount: est.amount ? Number(est.amount) : 0
      })),
      invoices: property.invoices.map((inv) => ({
        ...inv,
        agreedAmount: inv.agreedAmount ? Number(inv.agreedAmount) : 0,
        requestedAmount: inv.requestedAmount ? Number(inv.requestedAmount) : 0,
        amountPaid: inv.amountPaid ? Number(inv.amountPaid) : 0
      }))
    }));

    return plainProperties;

  } catch (error) {
    console.error("Error jalando las asignaciones:", error);
    return [];
  }
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus as any } // Escotilla de escape de TS para aceptar texto libre
    });
    return { success: true };
  } catch (error) {
    console.error("Error actualizando estatus:", error);
    return { success: false };
  }
}

// Nueva función para obtener la lista de contratistas (Roster)
export async function getContractors() {
  try {
    const contractors = await prisma.subcontractor.findMany({
      orderBy: { name: 'asc' } // Ordenamos alfabéticamente
    });
    return contractors;
  } catch (error) {
    console.error("Error jalando los contratistas:", error);
    return [];
  }
}

export async function getPropertyById(id: string) {
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        tasks: {
          include: { subcontractor: true },
          orderBy: { updatedAt: 'desc' }
        },
        estimates: true,
        agreements: true,
        invoices: true,
        media: { orderBy: { createdAt: 'desc' } },
        activityLogs: { orderBy: { createdAt: 'desc' } },
        conditionNotes: true, // Traemos la Crema
        comparables: true     // Traemos los Tacos
      }
    });

    if (!property) return null;

    // Convertimos TODOS los Decimals a números planos para el Client Component
    return {
      ...property,
      // Nuevos campos Decimal directos en Property
      purchasePrice: property.purchasePrice ? Number(property.purchasePrice) : null,
      avm: property.avm ? Number(property.avm) : null,
      estRent: property.estRent ? Number(property.estRent) : null,
      loanAmount: property.loanAmount ? Number(property.loanAmount) : null,
      loanMonthly: property.loanMonthly ? Number(property.loanMonthly) : null,
      loanHoldback: property.loanHoldback ? Number(property.loanHoldback) : null,
      loanCashToClose: property.loanCashToClose ? Number(property.loanCashToClose) : null,
      
      // Relaciones anidadas con Decimal
      comparables: property.comparables.map((c: any) => ({
        ...c,
        price: Number(c.price)
      })),
      estimates: property.estimates.map((e: any) => ({ 
        ...e, 
        amount: Number(e.amount) 
      })),
      invoices: property.invoices.map((i: any) => ({
        ...i,
        agreedAmount: Number(i.agreedAmount),
        requestedAmount: Number(i.requestedAmount),
        amountPaid: Number(i.amountPaid),
      }))
    };
  } catch (error) {
    console.error("Error obteniendo la propiedad:", error);
    return null;
  }
}