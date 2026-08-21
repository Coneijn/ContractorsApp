"use server" // Esto le dice a Next.js que este c digo solo corre en el servidor
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

// Función para verificar el PIN de Admin y establecer la cookie
export async function verifyPin(pin: string) {
  const expectedPin = process.env.ADMIN_PIN || '123456';
  
  if (pin === expectedPin) {
    const cookieStore = await cookies();
    // Establecemos una cookie segura que expira en 24 horas
    cookieStore.set('admin_auth_pin', 'authenticated', { 
      secure: process.env.NODE_ENV === 'production', 
      httpOnly: true, 
      path: '/admin',
      maxAge: 60 * 60 * 24 // 24 horas
    });
    return true;
  }
  return false;
}

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
      purchasePrice: property.purchasePrice ? Number(property.purchasePrice) : null,
      avm: property.avm ? Number(property.avm) : null,
      estRent: property.estRent ? Number(property.estRent) : null,
      loanAmount: property.loanAmount ? Number(property.loanAmount) : null,
      loanMonthly: property.loanMonthly ? Number(property.loanMonthly) : null,
      loanHoldback: property.loanHoldback ? Number(property.loanHoldback) : null,
      loanCashToClose: property.loanCashToClose ? Number(property.loanCashToClose) : null,
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
    // Definimos los únicos estados que la base de datos permite para una Tarea
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

    // Obtenemos la tarea primero para tener el propertyId a la mano
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (validStatuses.includes(newStatus)) {
      if (task) {
        // 1. Actualiza el estado en la tabla Task
        await prisma.task.update({
          where: { id: taskId },
          data: { status: newStatus as any } 
        });

        // 2. Sincroniza el estado de la Propiedad autom ticamente
          if (newStatus === 'COMPLETED') {
            await prisma.property.update({
              where: { id: task.propertyId },
              data: { status: 'COMPLETED' }
            });
          } else if (newStatus === 'IN_PROGRESS' || newStatus === 'PENDING') {
            await prisma.property.update({
              where: { id: task.propertyId },
              data: { status: 'RENOVATING' }
            });
          }

          // ---> NOTIFICACIÓN A GHL DESDE EL DASHBOARD (Admin UI) <---
          if (process.env.GHL_INBOUND_WEBHOOK_URL) {
            let ghlStage = "";
            if (newStatus === 'PENDING') ghlStage = "1. Pending Estimate";
            else if (newStatus === 'IN_PROGRESS') ghlStage = "3. In Progress";
            else if (newStatus === 'COMPLETED') ghlStage = "4. Pending Inspection / QA";
            else if (newStatus === 'CANCELLED') ghlStage = "7. Lost (Cancelado)";

            if (ghlStage) {
              try {
                await fetch(process.env.GHL_INBOUND_WEBHOOK_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    appReferenceId: taskId,
                    stage: ghlStage,
                    source: 'admin_dashboard_ui'
                  })
                });
              } catch (err) {
                console.error("Error al notificar a GHL desde el dashboard:", err);
              }
            }
          }

        }
      } else {
        // Si es un estado personalizado ("QUEUED" o texto libre), lo guardamos en el ActivityLog
      // para no romper la base de datos.
      if (task) {
        await prisma.activityLog.create({
          data: {
            propertyId: task.propertyId,
            actorType: 'USER',
            actorName: 'Admin (Dashboard)', // Podrías cambiar esto dinámicamente si tienes Auth
            action: 'CUSTOM_STATUS_UPDATE',
            description: `Estatus personalizado asignado a la tarea: ${newStatus}`,
          }
        });
      }
    }
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

// Nueva función para procesar el formulario de Invoice/Estimate
export async function submitContractorForm(data: any, mode: 'invoice' | 'estimate') {
  try {
    // 1. Buscar o crear al contratista por teléfono (whatsappNumber es único según el schema)
    let subcontractor = await prisma.subcontractor.findUnique({
      where: { whatsappNumber: data.phone }
    });

    if (!subcontractor) {
      subcontractor = await prisma.subcontractor.create({
        data: {
          name: `${data.firstName} ${data.lastName}`.trim(),
          whatsappNumber: data.phone,
          email: data.email || null,
          hasW9: data.w9Status === 'yes',
        }
      });
    }

    // 2. Buscar o crear la propiedad por dirección (address es única)
    let property = await prisma.property.findUnique({
      where: { address: data.address }
    });

    if (!property) {
      property = await prisma.property.create({
        data: { address: data.address }
      });
    }

    // 3. Crear el registro en la tabla correspondiente según el modo
    if (mode === 'invoice') {
      await prisma.invoicePayment.create({
        data: {
          propertyId: property.id,
          subcontractorId: subcontractor.id,
          workDescription: data.workDescription,
          startDate: data.startDate ? new Date(data.startDate) : null,
          finishDate: data.finishDate ? new Date(data.finishDate) : null,
          agreedAmount: parseFloat(data.agreedAmount) || 0,
          requestedAmount: parseFloat(data.requestedAmount) || 0,
        }
      });
    } else {
      await prisma.estimate.create({
        data: {
          propertyId: property.id,
          subcontractorId: subcontractor.id,
          workDescription: data.workDescription,
          estimatedStartDate: data.estStartDate ? new Date(data.estStartDate) : null,
          amount: parseFloat(data.requestedAmount) || 0, // En estimate se usa el amount solicitado
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error guardando el formulario:", error);
    return { success: false, error: "Error en base de datos" };
    }
  }

  export async function createAssignment(propertyId: string, subcontractorId: string, description: string) {
    try {
      await prisma.task.create({
        data: { 
          propertyId, 
          subcontractorId: subcontractorId || null, 
          description, 
          status: 'PENDING' 
        }
      });
      
      // Actualizamos la propiedad a RENOVATING si estaba terminada o sin asignar
      await prisma.property.update({
        where: { id: propertyId },
        data: { status: 'RENOVATING' }
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error creando asignación:", error);
      return { success: false, error: "Error interno" };
    }
  }

export async function saveContractor(data: any) {
  try {
    if (data.id) {
      await prisma.subcontractor.update({
        where: { id: data.id },
        data: {
          name: data.name,
          whatsappNumber: data.phone,
          company: data.company || null,
          email: data.email || null,
          tradeSpecialty: data.specialty || null,
          hasW9: data.hasW9,
          status: data.status,
        }
      });
    } else {
      await prisma.subcontractor.create({
        data: {
          name: data.name,
          whatsappNumber: data.phone,
          company: data.company || null,
          email: data.email || null,
          tradeSpecialty: data.specialty || null,
          hasW9: data.hasW9,
          status: data.status,
        }
      });
    }
    return { success: true };
  } catch (error: any) {
    console.error("Error saving contractor:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "El número de WhatsApp ya está registrado." };
    }
    return { success: false, error: "Error interno al guardar en base de datos" };
  }
}

export async function saveProperty(data: { address: string; taskDesc?: string; contractorId?: string }) {
  try {
    const property = await prisma.property.create({
      data: {
        address: data.address,
        status: 'RENOVATING'
      }
    });

    // Si se agrego una descripcion de tarea, la creamos y vinculamos a la propiedad
    if (data.taskDesc) {
      await prisma.task.create({
        data: {
          propertyId: property.id,
          description: data.taskDesc,
          subcontractorId: data.contractorId || null,
          status: 'PENDING'
        }
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error saving property:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "La propiedad ya existe." };
    }
    return { success: false, error: "Error interno al guardar en base de datos" };
  }
}

export async function getPropertyFieldOptions() {
  try {
    // Consulta para obtener valores únicos de campos String
    const types = await prisma.property.findMany({
      select: { propertyType: true },
      distinct: ['propertyType']
    });
    
    const strategies = await prisma.property.findMany({
      select: { strategy: true },
      distinct: ['strategy']
    });

    return {
      propertyTypes: types.map(t => t.propertyType).filter(Boolean) as string[],
      strategies: strategies.map(s => s.strategy).filter(Boolean) as string[],
      statuses: ['RENOVATING', 'COMPLETED', 'SOLD'] // Desde PropertyStatus Enum
    };
  } catch (error) {
    console.error("Error fetching field options:", error);
    return { propertyTypes: [], strategies: [], statuses: [] };
  }
}

export async function updatePropertyData(id: string, formData: FormData) {
  try {
    // Parseador para números que pueden llevar decimales (Float/Decimal en BD)
    const parseNumber = (val: FormDataEntryValue | null) => {
      if (!val || val === '') return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    };

    // Parseador para enteros estrictos (Int en BD). Redondea para evitar error de Prisma.
    const parseIntNumber = (val: FormDataEntryValue | null) => {
      if (!val || val === '') return null;
      const num = Number(val);
      return isNaN(num) ? null : Math.round(num);
    };

    const updateData = {
      address: formData.get('address') as string,
      status: formData.get('status') as any,
      county: formData.get('county') as string,
      propertyType: formData.get('propertyType') as string,
      strategy: formData.get('strategy') as string,
      sellerName: formData.get('sellerName') as string,
      buyerName: formData.get('buyerName') as string,
      accessCodeOrLockbox: formData.get('accessCodeOrLockbox') as string,
      beds: parseNumber(formData.get('beds')),
      baths: parseNumber(formData.get('baths')),
      sqft: parseIntNumber(formData.get('sqft')),
      yearBuilt: parseIntNumber(formData.get('yearBuilt')),
      purchasePrice: parseNumber(formData.get('purchasePrice')),
      avm: parseNumber(formData.get('avm')),
      estRent: parseNumber(formData.get('estRent')),
      loanLender: formData.get('loanLender') as string,
      loanAmount: parseNumber(formData.get('loanAmount')),
      loanRate: formData.get('loanRate') as string,
      loanMonthly: parseNumber(formData.get('loanMonthly')),
    };

    // Limpiar nulos o indefinidos si prefieres no sobreescribir con null
    Object.keys(updateData).forEach(key => {
      if ((updateData as any)[key] === null && formData.get(key) === '') {
        (updateData as any)[key] = null;
      }
    });

    await prisma.property.update({
      where: { id },
      data: updateData
    });

    // Registrar en ActivityLog
    await prisma.activityLog.create({
      data: {
        propertyId: id,
        actorType: 'USER',
        actorName: 'Admin', // Idealmente sacar esto de la sesión del usuario autenticado
        action: 'PROPERTY_UPDATED',
        description: 'Updated property details via dashboard form.'
      }
    });

    revalidatePath(`/admin/property/${id}`);
    revalidatePath(`/admin/property/${id}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Error updating property:", error);
    return { success: false, error: 'Failed to update property' };
  }
}