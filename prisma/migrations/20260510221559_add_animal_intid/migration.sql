/*
  Warnings:

  - A unique constraint covering the columns `[intId]` on the table `Animal` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Animal" ADD COLUMN     "intId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Animal_intId_key" ON "Animal"("intId");
