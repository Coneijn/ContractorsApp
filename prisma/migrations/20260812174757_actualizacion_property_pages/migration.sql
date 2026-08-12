-- CreateEnum
CREATE TYPE "CompType" AS ENUM ('SALE', 'RENT');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "avm" DECIMAL(10,2),
ADD COLUMN     "baths" DOUBLE PRECISION,
ADD COLUMN     "beds" DOUBLE PRECISION,
ADD COLUMN     "buyerName" TEXT DEFAULT 'Volunteer Homes, LLC',
ADD COLUMN     "closeDate" TIMESTAMP(3),
ADD COLUMN     "county" TEXT,
ADD COLUMN     "estRent" DECIMAL(10,2),
ADD COLUMN     "isRaisingCapital" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "leaseTerm" TEXT,
ADD COLUMN     "loanAmount" DECIMAL(10,2),
ADD COLUMN     "loanCashToClose" DECIMAL(10,2),
ADD COLUMN     "loanHoldback" DECIMAL(10,2),
ADD COLUMN     "loanLender" TEXT,
ADD COLUMN     "loanMaturity" TIMESTAMP(3),
ADD COLUMN     "loanMonthly" DECIMAL(10,2),
ADD COLUMN     "loanRate" TEXT,
ADD COLUMN     "lotSize" INTEGER,
ADD COLUMN     "parcelId" TEXT,
ADD COLUMN     "propertyType" TEXT,
ADD COLUMN     "purchasePrice" DECIMAL(10,2),
ADD COLUMN     "sellerName" TEXT,
ADD COLUMN     "sqft" INTEGER,
ADD COLUMN     "strategy" TEXT,
ADD COLUMN     "subdivision" TEXT,
ADD COLUMN     "tenantName" TEXT,
ADD COLUMN     "yearBuilt" INTEGER;

-- CreateTable
CREATE TABLE "condition_notes" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "condition_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparables" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" "CompType" NOT NULL,
    "address" TEXT NOT NULL,
    "specs" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "status" TEXT,
    "distance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comparables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "condition_notes_propertyId_idx" ON "condition_notes"("propertyId");

-- CreateIndex
CREATE INDEX "comparables_propertyId_idx" ON "comparables"("propertyId");

-- AddForeignKey
ALTER TABLE "condition_notes" ADD CONSTRAINT "condition_notes_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparables" ADD CONSTRAINT "comparables_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
