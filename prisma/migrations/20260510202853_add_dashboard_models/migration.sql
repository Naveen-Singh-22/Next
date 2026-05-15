-- CreateTable
CREATE TABLE "Donation" (
    "id" SERIAL NOT NULL,
    "donationId" TEXT,
    "donorName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "amount" INTEGER NOT NULL,
    "coverFees" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vaccination" (
    "id" SERIAL NOT NULL,
    "animalId" INTEGER NOT NULL,
    "animalName" TEXT NOT NULL,
    "vaccineName" TEXT NOT NULL,
    "dose" TEXT,
    "dateGiven" TIMESTAMP(3) NOT NULL,
    "nextDueDate" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "Vaccination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdoptionApplication" (
    "id" SERIAL NOT NULL,
    "applicationId" TEXT,
    "applicantName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "housing" TEXT,
    "petExperience" TEXT,
    "whyAdopt" TEXT,
    "animalId" INTEGER,
    "animalName" TEXT,
    "animalCode" TEXT,
    "status" TEXT,
    "adminNotes" TEXT,
    "timeline" JSONB,
    "createdAt" TIMESTAMP(3),

    CONSTRAINT "AdoptionApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerApplication" (
    "id" SERIAL NOT NULL,
    "applicationId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "interestArea" TEXT,
    "availability" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3),

    CONSTRAINT "VolunteerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "referenceId" INTEGER,
    "title" TEXT NOT NULL,
    "preview" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Donation_donationId_key" ON "Donation"("donationId");

-- CreateIndex
CREATE UNIQUE INDEX "AdoptionApplication_applicationId_key" ON "AdoptionApplication"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerApplication_applicationId_key" ON "VolunteerApplication"("applicationId");
