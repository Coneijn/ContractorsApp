/*
  Warnings:

  - You are about to drop the column `amountDue` on the `invoices_payments` table. All the data in the column will be lost.
  - Added the required column `agreedAmount` to the `invoices_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestedAmount` to the `invoices_payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "estimates" ADD COLUMN     "estimatedStartDate" TIMESTAMP(3),
ADD COLUMN     "workDescription" TEXT;

-- AlterTable
ALTER TABLE "invoices_payments" DROP COLUMN "amountDue",
ADD COLUMN     "agreedAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "finishDate" TIMESTAMP(3),
ADD COLUMN     "requestedAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "workDescription" TEXT;

-- AlterTable
ALTER TABLE "subcontractors" ADD COLUMN     "company" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "hasW9" BOOLEAN NOT NULL DEFAULT false;
