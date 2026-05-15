/*
  Warnings:

  - A unique constraint covering the columns `[animalCode]` on the table `Animal` will be added. If there are existing duplicate values, this will fail.
  - Made the column `fullName` on table `AdminUser` required. This step will fail if there are existing NULL values in that column.
  - Made the column `animalCode` on table `Animal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `breed` on table `Animal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gender` on table `Animal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `healthStatus` on table `Animal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `notes` on table `Animal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `Animal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vaccinationState` on table `Animal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `intId` on table `Animal` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ALTER COLUMN "fullName" SET NOT NULL;

-- AlterTable
ALTER TABLE "Animal" ALTER COLUMN "animalCode" SET NOT NULL,
ALTER COLUMN "breed" SET NOT NULL,
ALTER COLUMN "gender" SET NOT NULL,
ALTER COLUMN "healthStatus" SET NOT NULL,
ALTER COLUMN "notes" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "vaccinationState" SET NOT NULL,
ALTER COLUMN "intId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Animal_animalCode_key" ON "Animal"("animalCode");
