"use server" // Esto le dice a Next.js que este código solo corre en el servidor

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Función para obtener las propiedades y sus contratistas asignados
export async function getActiveAssignments() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: 'RENOVATING' // Solo traemos las que están en obra
      },
      include: {
        tasks: {
          include: {
            subcontractor: true // Traemos también los datos del contratista asignado a cada tarea
          }
        }
      }
    });
    
    return properties;
  } catch (error) {
    console.error("Error jalando las asignaciones:", error);
    return [];
  }
}