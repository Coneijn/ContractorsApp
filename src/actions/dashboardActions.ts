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
    
    return properties;
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