// prisma/seed.ts
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
  await prisma.conditionNote.deleteMany() 
  await prisma.comparable.deleteMany()    
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
    { key: 'dallan', name: 'Dallan', company: 'Independiente', whatsapp: '+16624205747', email: null, trade: 'N/A', status: 'INACTIVE' },
    { key: 'moises', name: 'Moisés', company: 'Independiente', whatsapp: '+19010000002', email: null, trade: 'General Renovation / Painting', status: 'ACTIVE' }
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

  // 2. Propiedades Activas y Completas con todos los datos detallados de los HTML
  await prisma.property.create({
    data: {
      address: '375 Sherburne',
      status: 'RENOVATING',
      propertyType: 'Single Family',
      beds: 3,
      baths: 2.5,
      sqft: 2678,
      yearBuilt: 1985,
      county: 'Shelby County, TN',
      strategy: 'Flip',
      isRaisingCapital: true,
      closeDate: new Date('2026-07-10T12:00:00Z'),
      purchasePrice: 225000.00,
      avm: 375000.00,
      loanLender: 'Kiavi Funding, Inc.',
      loanAmount: 248400.00,
      loanRate: '8.95%',
      loanHoldback: 41400.00,
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
      propertyType: 'Single Family',
      beds: 4,
      baths: 2.5,
      sqft: 2284,
      yearBuilt: 1978,
      county: 'Shelby County, TN',
      strategy: 'Lease Purchase',
      isRaisingCapital: true,
      closeDate: new Date('2026-07-15T12:00:00Z'),
      purchasePrice: 182000.00,
      sellerName: 'Therese Murray',
      loanLender: 'Kiavi Funding, Inc.',
      loanAmount: 225200.00,
      loanRate: '8.95%',
      loanMonthly: 1221.68,
      loanMaturity: new Date('2027-08-01T12:00:00Z'),
      loanHoldback: 61400.00,
      tasks: {
        create: [
          { description: 'Punch list touch-ups & driveway power wash in progress with Luis Felipe', subcontractorId: subMap['luisFelipe'], status: 'IN_PROGRESS' }
        ]
      }
    }
  })

  await prisma.property.create({
    data: {
      address: '8072 Bensford Ln',
      status: 'RENOVATING',
      propertyType: 'Single Family',
      beds: 3,
      baths: 2,
      sqft: 1322,
      yearBuilt: 1998,
      county: 'Shelby County, TN',
      strategy: 'Flip',
      isRaisingCapital: true,
      closeDate: new Date('2026-07-31T12:00:00Z'),
      purchasePrice: 140000.00,
      avm: 222000.00,
      sellerName: 'Rita C. Harris',
      loanLender: 'Kairos, LLC',
      loanAmount: 165000.00,
      loanRate: '10%',
      loanMaturity: new Date('2027-03-01T12:00:00Z'),
      loanHoldback: 25000.00,
      tasks: {
        create: [
          { description: 'Paint in/out, replace misc items, deep clean, fix lights, show-ready', subcontractorId: subMap['tania'], status: 'PENDING_ESTIMATE' }
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
      propertyType: 'Single Family',
      county: 'DeSoto County, MS',
      strategy: 'Flip',
      isRaisingCapital: true,
      closeDate: new Date('2026-08-03T12:00:00Z'),
      purchasePrice: 240000.00,
      sellerName: 'Rachel Baxter',
      loanLender: 'Kiavi Funding, Inc.',
      loanAmount: 249800.00,
      loanRate: '8.95%',
      loanMaturity: new Date('2027-09-01T12:00:00Z'),
      loanHoldback: 33800.00,
      tasks: {
        create: [
          { description: 'Final quote pending — after Sherburne wraps', subcontractorId: subMap['mario'], status: 'PENDING_ESTIMATE' }
        ]
      },
      conditionNotes: {
        create: [
          { category: 'Roof', description: 'Needs full replacement — visibly old', isCritical: true },
          { category: 'Carpet', description: 'Needs new carpet throughout', isCritical: false },
          { category: 'Fascia', description: 'Some fascia boards need repair', isCritical: false },
          { category: 'Ceilings', description: 'Damage from prior leaks — needs repair', isCritical: true },
          { category: 'Bathroom', description: 'One bathroom sink broken', isCritical: true }
        ]
      }
    }
  })

  await prisma.property.create({
    data: {
      address: '7099 Tranquill Creek Dr',
      status: 'RENOVATING',
      propertyType: 'Single Family',
      beds: 3,
      baths: 2,
      sqft: 1731,
      yearBuilt: 1985,
      county: 'Shelby County, TN',
      subdivision: 'Green Creek',
      parcelId: '093703 B00045',
      strategy: 'Rental',
      closeDate: new Date('2026-07-29T12:00:00Z'),
      purchasePrice: 150000.00,
      avm: 221000.00,
      estRent: 1820.00,
      sellerName: 'Linda Clifton f.k.a. Linda Augusta',
      loanLender: 'Susan Sledd',
      loanAmount: 185000.00,
      loanRate: '12%',
      loanMonthly: 1850.00,
      loanMaturity: new Date('2027-02-01T12:00:00Z'),
      tasks: {
        create: [
          { description: 'Bid received $7,670 · Aug 4, 2026 · awaiting Spencer approval', subcontractorId: subMap['tania'], status: 'PENDING_ESTIMATE' }
        ]
      },
      estimates: {
        create: [
          { subcontractorId: subMap['tania'], workDescription: 'Interior paint, trim/doors/baseboards, sink repair, clean & haul, lights, floor repair, exterior paint', amount: 7670.00, status: 'UNDER_REVIEW' }
        ]
      },
      conditionNotes: {
        create: [
          { category: 'Roof', description: 'Repair leak at master bathroom skylight', isCritical: true },
          { category: 'Flooring', description: 'Repair wood flooring in living room and bedrooms, replace carpet with matching wood flooring', isCritical: false }
        ]
      }
    }
  })

  await prisma.property.create({
    data: {
      address: '5353 Derron Ln',
      status: 'RENOVATING',
      propertyType: 'Single Family',
      county: 'Shelby County, TN',
      parcelId: '0704700002',
      strategy: 'Lease Purchase',
      closeDate: new Date('2026-07-13T12:00:00Z'),
      purchasePrice: 75000.00,
      sellerName: 'Michael & Phylicia Rahming',
      loanLender: 'Kairos, LLC',
      loanAmount: 150000.00,
      loanRate: '10%',
      loanMonthly: 1250.00,
      loanMaturity: new Date('2027-05-01T12:00:00Z'),
      loanHoldback: 45000.00,
      tasks: {
        create: [
          { description: 'Next after Burlingate · roof & subfloor rehab underway', subcontractorId: subMap['luisFelipe'], status: 'PENDING_ESTIMATE' }
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

  // 3. Propiedades Completadas y Vendidas (Past / Completed Projects)
  await prisma.property.create({
    data: {
      address: '1566 Arcadia St',
      status: 'COMPLETED',
      county: 'Shelby County, TN',
      updatedAt: new Date('2026-08-04T12:00:00Z'),
      tasks: {
        create: [
          { description: 'Paint, carpet removal, cabinet work', subcontractorId: subMap['tania'], status: 'WON', updatedAt: new Date('2026-08-04T12:00:00Z') }
        ]
      },
      estimates: {
        create: [
          { subcontractorId: subMap['moises'], workDescription: 'Full interior renovation: painting ($3,900), wallpaper removal ($1,200), sheetrock ($2,200), pressure washing ($200)', amount: 7500.00, status: 'REJECTED' }
        ]
      }
    }
  })

  await prisma.property.create({
    data: {
      address: '749 Clearview Cove',
      status: 'COMPLETED',
      propertyType: 'Single Family',
      beds: 3,
      baths: 2,
      sqft: 1879,
      yearBuilt: 2004,
      county: 'DeSoto County, MS',
      strategy: 'Rental',
      closeDate: new Date('2026-07-09T12:00:00Z'),
      purchasePrice: 180000.00,
      sellerName: 'David Young Owens',
      loanLender: 'NextGen Growth, LLC',
      loanAmount: 215000.00,
      loanRate: '12%',
      loanMonthly: 2115.00,
      loanMaturity: new Date('2026-12-01T12:00:00Z'),
      tenantName: 'Elvis Sierra & Osvaldo Canseco',
      leaseTerm: 'Owner Finance 30 Years',
      updatedAt: new Date('2026-07-31T12:00:00Z'),
      tasks: {
        create: [
          { description: 'Full rehab (paint, clean, show-ready) and owner finance sale executed', subcontractorId: subMap['tania'], status: 'WON', updatedAt: new Date('2026-07-31T12:00:00Z') }
        ]
      }
    }
  })

  await prisma.property.create({
    data: {
      address: '9059 Cairn Ridge Dr',
      status: 'COMPLETED',
      propertyType: 'Single Family',
      subdivision: 'Germantown',
      county: 'Shelby County, TN',
      updatedAt: new Date('2026-08-01T12:00:00Z'),
      tasks: {
        create: [
          { description: 'Flooring (remove carpet → LVP ~1,655sqft) + full interior paint', subcontractorId: subMap['mario'], status: 'WON', updatedAt: new Date('2026-01-01T12:00:00Z') },
          { description: 'Trim trees, mow, mulch, haul trash, dead tree removal', subcontractorId: subMap['johnny'], status: 'WON', updatedAt: new Date('2026-07-28T12:00:00Z') }
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

  // 4. Propiedades Solo con Cotizaciones Pendientes / Historial de Estimaciones
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

  // 5. Propiedades Adicionales Cerradas / En proceso (Stevenwoods, Tranquill, Bensford)
  await prisma.property.create({
    data: {
      address: '6851 Stevenwoods Ave',
      status: 'RENOVATING',
      propertyType: 'Single Family',
      subdivision: 'Meadows of Kindlewood',
      parcelId: '0704700002',
      county: 'Shelby County, TN',
      strategy: 'Flip',
      isRaisingCapital: true,
      closeDate: new Date('2026-07-31T12:00:00Z'),
      purchasePrice: 138000.00,
      sellerName: 'Estate of Roman J. Stewart (8 heirs)',
      loanLender: 'NextGen Growth, LLC',
      loanAmount: 172000.00,
      loanRate: '12%',
      loanMonthly: 1720.00,
      loanMaturity: new Date('2027-03-01T12:00:00Z'),
      tasks: {
        create: [
          { description: 'Full renovation scope sent to Tania for quoting', subcontractorId: subMap['tania'], status: 'PENDING_ESTIMATE' }
        ]
      },
      conditionNotes: {
        create: [
          { category: 'Bedrooms', description: 'High ceilings/arched window, cluttered, worn mattress, missing ceiling patch, wall marks', isCritical: false },
          { category: 'Flooring', description: 'Carpet stained/worn', isCritical: false },
          { category: 'Laundry', description: 'Exposed ducting, rough wall openings, debris', isCritical: true },
          { category: 'Bathroom', description: 'Usable but dirty, stained sink/vanity, scuffed walls', isCritical: false }
        ]
      }
    }
  })

  // 6. Propiedades Sin Asignar (Unassigned)
  const unassignedProperties = [
    { address: '7274 McVay Rd, Germantown', desc: '$66,500 budget · roof, paint, floors, baths, fixtures', type: 'Single Family', beds: 3, baths: 3, sqft: 1958, yearBuilt: 1949, county: 'Shelby County, TN', price: 225000.00, avm: 366000.00, rent: 1960.00 },
    { address: '3994 Auburn Rd', desc: 'Rehab budget TBD', type: 'Single Family · Ranch', beds: 3, baths: 2, sqft: 1923, yearBuilt: 1964, county: 'Shelby County, TN', avm: 173000.00, rent: 1390.00 },
    { address: '6475 Collinwood Rd', desc: 'Closing Aug 17 · scope TBD', type: 'Single Family · Brick Veneer', beds: 3, baths: 2, sqft: 1474, yearBuilt: 1989, county: 'DeSoto County, MS', price: 110000.00, avm: 210000.00, rent: 1610.00 },
    { address: '8809 Lakeshore Dr', desc: 'Walkthrough pending', type: 'Single Family', county: 'DeSoto County, MS' },
    { address: '2673 McVay Rd', desc: 'Closing Aug 28 · scope TBD', type: 'Single Family · Brick', beds: 4, baths: 2.5, sqft: 2615, yearBuilt: 1975, county: 'Shelby County, TN', price: 225000.00, avm: 349000.00, rent: 2460.00, raising: true }
  ]

  for (const unassigned of unassignedProperties) {
    await prisma.property.create({
      data: {
        address: unassigned.address,
        status: 'RENOVATING',
        propertyType: unassigned.type,
        beds: unassigned.beds,
        baths: unassigned.baths,
        sqft: unassigned.sqft,
        yearBuilt: unassigned.yearBuilt,
        county: unassigned.county,
        purchasePrice: unassigned.price ? unassigned.price : null,
        avm: unassigned.avm ? unassigned.avm : null,
        estRent: unassigned.rent ? unassigned.rent : null,
        isRaisingCapital: unassigned.raising ? unassigned.raising : false,
        tasks: {
          create: [
            { description: unassigned.desc, status: 'UNASSIGNED' }
          ]
        }
      }
    })
  }

  console.log('✔ Base de datos poblada exitosamente integrando absolutamente todos los datos recopilados de los HTML y el Dashboard.')
}

main()
  .catch((e) => {
    console.error('✘ Error al ejecutar el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })