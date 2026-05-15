-- AlterTable
ALTER TABLE "Animal" ADD COLUMN     "animalCode" TEXT,
ADD COLUMN     "breed" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "healthStatus" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "status" TEXT,
ADD COLUMN     "vaccinationState" TEXT;
