import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Limpiando base de datos e iniciando la siembra desde myfrank.ai...')

  // 1. Limpieza en orden inverso de dependencias para evitar errores de Foreign Keys
  await prisma.activityLog.deleteMany()
  await prisma.media.deleteMany()
  await prisma.invoicePayment.deleteMany()
  await prisma.agreement.deleteMany()
  await prisma.estimate.deleteMany()
  await prisma.task.deleteMany()
  await prisma.property.deleteMany()
  await prisma.subcontractor.deleteMany()

  // 2. Crear Subcontratistas
  const mario = await prisma.subcontractor.create({
    data: {
      name: 'Mario',
      company: '4JL Remodeling',
      whatsappNumber: '+19018211502', // Buenas prácticas: formato E.164 para WhatsApp
      hasW9: false,
      status: 'ACTIVE',
    },
  })

  const tania = await prisma.subcontractor.create({
    data: {
      name: 'Tania',
      company: 'Independiente',
      whatsappNumber: '+17064614750',
      hasW9: false,
      status: 'ACTIVE',
    },
  })

  const luisFelipe = await prisma.subcontractor.create({
    data: {
      name: 'Luis Felipe Hernandez',
      company: 'Felipe Remodeling',
      whatsappNumber: '+13522849537',
      hasW9: false,
      status: 'ACTIVE',
    },
  })

  // 3. Crear Propiedades con sus Tareas asociadas
  
  // Propiedad 1: 375 Sherburne (En progreso con Mario)
  await prisma.property.create({
    data: {
      address: '375 Sherburne',
      status: 'RENOVATING',
      tasks: {
        create: {
          description: 'Interior complete Aug 4 · exterior TBD',
          subcontractorId: mario.id,
          status: 'IN_PROGRESS',
        },
      },
    },
  })

  // Propiedad 2: 8072 Bensford Ln (Programada con Tania)
  await prisma.property.create({
    data: {
      address: '8072 Bensford Ln',
      status: 'RENOVATING',
      tasks: {
        create: {
          description: '$4,500 · paint in/out, clean, lights, show-ready',
          subcontractorId: tania.id,
          status: 'PENDING',
        },
      },
    },
  })

  // Propiedad 3: 7274 McVay Rd (Sin Asignar)
  await prisma.property.create({
    data: {
      address: '7274 McVay Rd, Germantown',
      status: 'RENOVATING',
      tasks: {
        create: {
          description: '$66,500 budget · roof, paint, floors, baths, fixtures',
          status: 'PENDING',
          // Sin subcontractorId asignado
        },
      },
    },
  })

  console.log('✅ Base de datos poblada con éxito con los datos de Frank.')
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })