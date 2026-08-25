import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportSeed() {
  console.log('🔄 Extrayendo datos de la base de datos...');

  // 1. Tablas independientes / Core
  const users = await prisma.user.findMany();
  const subcontractors = await prisma.subcontractor.findMany();
  const properties = await prisma.property.findMany();

  // 2. Tablas dependientes de Property / Subcontractor
  const conditionNotes = await prisma.conditionNote.findMany();
  const comparables = await prisma.comparable.findMany();
  const tasks = await prisma.task.findMany();
  const media = await prisma.media.findMany();
  const estimates = await prisma.estimate.findMany();
  const agreements = await prisma.agreement.findMany();
  const invoices = await prisma.invoicePayment.findMany();
  const activityLogs = await prisma.activityLog.findMany();

  const fileContent = `import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Limpiando base de datos...');
  
  // Limpieza en orden inverso para evitar conflictos de Foreign Keys
  await prisma.activityLog.deleteMany();
  await prisma.invoicePayment.deleteMany();
  await prisma.agreement.deleteMany();
  await prisma.estimate.deleteMany();
  await prisma.media.deleteMany();
  await prisma.task.deleteMany();
  await prisma.comparable.deleteMany();
  await prisma.conditionNote.deleteMany();
  await prisma.property.deleteMany();
  await prisma.subcontractor.deleteMany();
  await prisma.user.deleteMany();

  console.log('🌱 Insertando datos respaldados...');

  // 1. Usuarios
  await prisma.user.createMany({
    data: ${JSON.stringify(users, null, 2)},
  });

  // 2. Subcontratistas
  await prisma.subcontractor.createMany({
    data: ${JSON.stringify(subcontractors, null, 2)},
  });

  // 3. Propiedades
  await prisma.property.createMany({
    data: ${JSON.stringify(properties, null, 2)},
  });

  // 4. Condition Notes
  await prisma.conditionNote.createMany({
    data: ${JSON.stringify(conditionNotes, null, 2)},
  });

  // 5. Comparables
  await prisma.comparable.createMany({
    data: ${JSON.stringify(comparables, null, 2)},
  });

  // 6. Tasks
  await prisma.task.createMany({
    data: ${JSON.stringify(tasks, null, 2)},
  });

  // 7. Media
  await prisma.media.createMany({
    data: ${JSON.stringify(media, null, 2)},
  });

  // 8. Estimates
  await prisma.estimate.createMany({
    data: ${JSON.stringify(estimates, null, 2)},
  });

  // 9. Agreements
  await prisma.agreement.createMany({
    data: ${JSON.stringify(agreements, null, 2)},
  });

  // 10. Invoices
  await prisma.invoicePayment.createMany({
    data: ${JSON.stringify(invoices, null, 2)},
  });

  // 11. Activity Logs
  await prisma.activityLog.createMany({
    data: ${JSON.stringify(activityLogs, null, 2)},
  });

  console.log('✅ Base de datos restaurada exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

  const outputPath = path.join(process.cwd(), 'prisma', 'seed.ts');
  fs.writeFileSync(outputPath, fileContent, 'utf-8');

  console.log(`✅ Archivo seed generado correctamente en: ${outputPath}`);
}

exportSeed()
  .catch((e) => {
    console.error('❌ Error durante la exportación:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });