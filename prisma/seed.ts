// seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Limpiando base de datos e iniciando la siembra profunda...')

  await prisma.activityLog.deleteMany()
  await prisma.media.deleteMany()
  await prisma.invoicePayment.deleteMany()
  await prisma.agreement.deleteMany()
  await prisma.estimate.deleteMany()
  await prisma.task.deleteMany()
  await prisma.property.deleteMany()
  await prisma.subcontractor.deleteMany()

  // 1. Crear Contratistas (Aprobados y No Aprobados)
  const subcontractorsData = [
    { key: 'mario', name: 'Mario', company: '4JL Remodeling', whatsapp: '+19018211502', email: null, trade: 'Remodeling', status: 'ACTIVE' },
    { key: 'tania', name: 'Tania', company: 'Independiente', whatsapp: '+17064614750', email: null, trade: 'Painting & Rehab', status: 'ACTIVE' },
    { key: 'luisFelipe', name: 'Luis Felipe Hernandez', company: 'Felipe Remodeling M&Solution LLC', whatsapp: '+13522849537', email: null, trade: 'Remodeling', status: 'ACTIVE' },
    { key: 'alfredo', name: 'Alfredo Meza', company: 'Independiente', whatsapp: '+10000000001', email: null, trade: 'General', status: 'INACTIVE' },
    { key: 'jose', name: 'José Villasmin', company: 'Independiente', whatsapp: '+19015087651', email: null, trade: 'General', status: 'INACTIVE' },
    { key: 'johnny', name: 'Johnny', company: 'VSL Landscape', whatsapp: '+19014984442', email: null, trade: 'Lawn Mowing · Landscaping', status: 'ACTIVE' },
    { key: 'bill', name: 'Bill Jackson', company: 'Midtown Hardwood, LLC', whatsapp: '+19014614787', email: 'midtownhardwood2044@gmail.com', trade: 'Hardwood Floors', status: 'ACTIVE' },
    { key: 'delmar', name: 'Delmar Castro', company: 'Independiente', whatsapp: '+19016481313', email: null, trade: 'Painting · Ceramic Flooring', status: 'ACTIVE' },
    { key: 'mauricio', name: 'Mauricio Gonzalez', company: 'Independiente', whatsapp: '+19013152572', email: null, trade: 'Floor Installation', status: 'ACTIVE' },
    { key: 'martha', name: 'Martha Cruz', company: 'Independiente', whatsapp: '+19018334472', email: null, trade: 'Painting', status: 'ACTIVE' },
    { key: 'alan', name: 'Alan Perez', company: 'Independiente', whatsapp: '+19015905906', email: null, trade: 'Roofing · Siding · Cladding', status: 'ACTIVE' },
    { key: 'rony', name: 'Rony', company: 'Independiente', whatsapp: '+19014560481', email: null, trade: 'Painting · Other services (TBD)', status: 'ACTIVE' },
    { key: 'hector', name: 'Hector Agustin', company: 'Independiente', whatsapp: '+19015906373', email: null, trade: 'Full Remodeling · Floors · Roofing', status: 'ACTIVE' },
    { key: 'wilmer', name: 'Wilmer Maldonado', company: 'Independiente', whatsapp: '+19012709696', email: null, trade: 'Flooring · Painting · Ceramics · Trim Carpentry · Roofing', status: 'ACTIVE' },
    { key: 'guevara', name: 'Guevara', company: 'Independiente', whatsapp: '+19018717105', email: null, trade: 'General Contractor (trades TBD)', status: 'ACTIVE' },
    { key: 'miguel', name: 'Miguel Arias', company: 'Independiente', whatsapp: '+19017416693', email: null, trade: 'Lawn Mowing · Landscaping', status: 'ACTIVE' },
    { key: 'sonia', name: 'Sonia Yanez', company: 'Independiente', whatsapp: '+19016909819', email: null, trade: 'Painting · Flooring · Glass', status: 'ACTIVE' },
    { key: 'edgar', name: 'Edgar Gomez', company: 'Independiente', whatsapp: '+19016510780', email: null, trade: 'Painting · Ceramic · Wood Repair · Siding · Drywall', status: 'ACTIVE' },
    { key: 'eduardo', name: 'Eduardo', company: 'Independiente', whatsapp: '+19015763718', email: null, trade: 'Full Remodel', status: 'INACTIVE' },
    { key: 'dallan', name: 'Dallan', company: 'Independiente', whatsapp: '+16624205747', email: null, trade: 'N/A', status: 'INACTIVE' }
  ]

  const subMap: Record<string, string> = {}
  for (const sub of subcontractorsData) {
    const createdSub = await prisma.subcontractor.create({
      data: {
        name: sub.name,
        company: sub.company,
        whatsappNumber: sub.whatsapp,
        email: sub.email,
        tradeSpecialty: sub.trade,
        hasW9: false,
        status: sub.status as 'ACTIVE' | 'INACTIVE',
      },
    })
    subMap[sub.key] = createdSub.id
  }

  // 2. Propiedades Activas (Asignaciones en curso y programadas)
  await prisma.property.create({
    data: {
      address: '375 Sherburne',
      status: 'RENOVATING',
      tasks: {
        create: [
          { description: 'Interior complete Aug 4 · exterior TBD', subcontractorId: subMap['mario'], status: 'IN_PROGRESS' }
        ]
      }
    }
  })

  await prisma.property.create({
    data: {
      address: '2175 Burlingate Dr',
      status: 'RENOVATING',
      tasks: {
        create: [
          { description: 'Finishing this week · cabinets + quarter round molding pending', subcontractorId: subMap['luisFelipe'], status: 'IN_PROGRESS' }
        ]
      }
    }
  })

  await prisma.property.create({
    data: {
      address: '8072 Bensford Ln',
      status: 'RENOVATING',
      tasks: {
        create: [
          { description: 'Paint in/out, replace misc items, deep clean, fix lights, show-ready', subcontractorId: subMap['tania'], status: 'PENDING' }
        ]
      },
      estimates: {
        create: [
          { subcontractorId: subMap['tania'], workDescription: 'Paint in/out, replace misc items, deep clean, fix lights, show-ready', amount: 4500.00, status: 'APPROVED' }
        ]
      }
    }
  })

  await prisma.property.create({
    data: {
      address: '10026 Loftin Dr',
      status: 'RENOVATING',
      tasks: {
        create: [
          { description: 'Final quote pending — after Sherburne wraps', subcontractorId: subMap['mario'], status: 'PENDING' }
        ]
      }
    }
  })

  await prisma.property.create({
    data: {
      address: '7099 Tranquill Creek Dr',
      status: 'RENOVATING',
      tasks: {
        create: [
          { description: 'Bid received $7,670 · Aug 4, 2026 · awaiting Spencer approval', subcontractorId: subMap['tania'], status: 'PENDING' }
        ]
      },
      estimates: {
        create: [
          { subcontractorId: subMap['tania'], workDescription: 'Full bid', amount: 7670.00, status: 'UNDER_REVIEW' }
        ]
      }
    }
  })

  await prisma.property.create({
    data: {
      address: '5353 Derron Ln',
      status: 'RENOVATING',
      tasks: {
        create: [
          { description: 'Next after Burlingate · final quote needed', subcontractorId: subMap['luisFelipe'], status: 'PENDING' }
        ]
      },
      estimates: {
        create: [
          { subcontractorId: subMap['mario'], workDescription: 'Exterior: repair siding, power wash, paint, caulking (labor only)', amount: 6500.00, status: 'UNDER_REVIEW' },
          { subcontractorId: subMap['alfredo'], workDescription: 'Exterior: siding, soffit, power wash, paint, gutters (labor only)', amount: 6000.00, status: 'UNDER_REVIEW' },
          { subcontractorId: subMap['jose'], workDescription: 'Exterior: demo siding/fascia, reinstall siding + caulk + paint, full power wash', amount: 7000.00, status: 'UNDER_REVIEW' }
        ]
      }
    }
  })

  // 3. Propiedades Completadas (Past Projects)
  await prisma.property.create({
    data: {
      address: '1566 Arcadia St',
      status: 'COMPLETED',
      updatedAt: new Date('2026-08-04T12:00:00Z'), // Forzando Aug 4, 2026
      tasks: {
        create: [
          { description: 'Paint, carpet removal, cabinet work', subcontractorId: subMap['tania'], status: 'COMPLETED', updatedAt: new Date('2026-08-04T12:00:00Z') }
        ]
      }
    }
  })

  await prisma.property.create({
    data: {
      address: '749 Clearview Cove',
      status: 'COMPLETED',
      updatedAt: new Date('2026-01-01T12:00:00Z'), // Forzando 2026
      tasks: {
        create: [
          { description: 'Full rehab (paint, clean, show-ready)', subcontractorId: subMap['tania'], status: 'COMPLETED', updatedAt: new Date('2026-01-01T12:00:00Z') }
        ]
      }
    }
  })

  await prisma.property.create({
    data: {
      address: '9059 Cairn Ridge Dr',
      status: 'COMPLETED',
      updatedAt: new Date('2026-01-01T12:00:00Z'), // Forzando 2026 a nivel propiedad
      tasks: {
        create: [
          { description: 'Flooring (remove carpet → LVP ~1,655sqft) + full interior paint', subcontractorId: subMap['mario'], status: 'COMPLETED', updatedAt: new Date('2026-01-01T12:00:00Z') }, // 2026
          { description: 'Trim trees, mow, mulch, haul trash, dead tree removal', subcontractorId: subMap['johnny'], status: 'COMPLETED', updatedAt: new Date('2026-07-28T12:00:00Z') }  // Jul 28, 2026
        ]
      },
      invoices: {
        create: [
          { subcontractorId: subMap['mario'], workDescription: 'Flooring and paint', agreedAmount: 16257.00, requestedAmount: 16257.00, status: 'PAID' },
          { subcontractorId: subMap['johnny'], workDescription: 'Landscaping', agreedAmount: 1400.00, requestedAmount: 1400.00, status: 'PAID' }
        ]
      },
      estimates: {
        create: [
          { subcontractorId: subMap['luisFelipe'], workDescription: 'Interior paint + vinyl flooring (1st & 2nd floor)', amount: 16074.00, status: 'REJECTED' },
          { subcontractorId: subMap['alfredo'], workDescription: 'Interior paint: ceilings, walls, doors, windows, base/crown + kitchen cabinets (labor only)', amount: 8700.00, status: 'REJECTED' },
          { subcontractorId: subMap['bill'], workDescription: 'Hardwood floor install 1,360sqft (River King Brighton Birch), demo, adhesive, quarter round, transitions, cleanup', amount: 17444.00, status: 'REJECTED' }
        ]
      }
    }
  })

  // 4. Propiedades Solo con Cotizaciones Pendientes (No activas, pero con historial de estimaciones)
  await prisma.property.create({
    data: {
      address: '5011 Ridge Tree Dr',
      status: 'RENOVATING',
      estimates: {
        create: [
          { subcontractorId: subMap['alfredo'], workDescription: 'Interior paint + staining (15 doors, 15 windows, trim) + flooring (material + labor)', amount: 23500.00, status: 'UNDER_REVIEW' },
          { subcontractorId: subMap['jose'], workDescription: 'Demo, flooring, drywall, paint interior, exterior caulk + paint', amount: 14300.00, status: 'UNDER_REVIEW' },
          { subcontractorId: subMap['eduardo'], workDescription: 'Full remodel: paint in/out, flooring, drywall repairs, electric, plumbing, HVAC covers, cleanup (labor + materials)', amount: 9500.00, status: 'UNDER_REVIEW' }
        ]
      }
    }
  })

  // 5. Propiedades Sin Asignar (Unassigned)
  const unassignedProperties = [
    { address: '6851 Stevenwoods Ave', desc: '11-item scope · bids pending' },
    { address: '7274 McVay Rd, Germantown', desc: '$66,500 budget · roof, paint, floors, baths, fixtures' },
    { address: '3994 Auburn Rd', desc: 'Rehab budget TBD' },
    { address: '6475 Collinwood Rd', desc: 'Closing Aug 17 · scope TBD' },
    { address: '8809 Lakeshore Dr', desc: 'Walkthrough pending' },
    { address: '2673 McVay Rd', desc: 'Closing Aug 28 · scope TBD' }
  ]

  for (const unassigned of unassignedProperties) {
    await prisma.property.create({
      data: {
        address: unassigned.address,
        status: 'RENOVATING',
        tasks: {
          create: [
            { description: unassigned.desc, status: 'PENDING' }
          ]
        }
      }
    })
  }

  console.log('✅ Base de datos poblada exitosamente integrando Tasks, Estimates e Invoices.')
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })