-- AlterTable
ALTER TABLE "media" ADD COLUMN     "fileType" TEXT NOT NULL DEFAULT 'image';

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "clAltaFiled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "clBuyerFound" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "clClosed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "clLoanDocsFiled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "clPsaSigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "clRehabComplete" BOOLEAN NOT NULL DEFAULT false;
