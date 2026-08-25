/*
  Warnings:

  - The values [PENDING,COMPLETED,CANCELLED] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('PENDING_ESTIMATE', 'ASSIGNED_OR_TO_DO', 'IN_PROGRESS', 'PENDING_INSPECTION_OR_QA', 'INVOICE_SUBMITTED', 'UNASSIGNED', 'WON', 'LOST', 'OTHER');
ALTER TABLE "tasks" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "tasks" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "TaskStatus_old";
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'UNASSIGNED';
COMMIT;

-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'UNASSIGNED';
