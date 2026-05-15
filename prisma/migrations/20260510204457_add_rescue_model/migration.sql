-- CreateTable
CREATE TABLE "RescueRequest" (
    "id" SERIAL NOT NULL,
    "reportId" TEXT,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT DEFAULT 'new',
    "priority" TEXT DEFAULT 'medium',
    "reporterName" TEXT,
    "reporterPhone" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "RescueRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RescueRequest_reportId_key" ON "RescueRequest"("reportId");
