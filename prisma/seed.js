const { PrismaClient } = require("@prisma/client");
const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const dataDir = path.join(process.cwd(), "data");

function readJson(fileName) {
  const filePath = path.join(dataDir, fileName);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function toDate(value) {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toNullableString(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isBcryptHash(value) {
  return typeof value === "string" && /^\$2[aby]?\$\d{2}\$/.test(value);
}

async function normalizePassword(password) {
  if (!password) {
    return password;
  }

  if (isBcryptHash(password)) {
    return password;
  }

  return bcrypt.hash(password, 10);
}

function normalizeAnimalVaccinationState(value) {
  if (value === "up_to_date") return "up-to-date";
  if (value === "due_soon" || value === "overdue") return value;
  return "up-to-date";
}

function slugifyAnimal(name, species) {
  return `${String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${String(species).trim().toLowerCase()}`.replace(/^-+|-+$/g, "");
}

function rescueDescription(report) {
  return JSON.stringify({
    fullName: report.fullName,
    email: report.email,
    phone: report.phone,
    species: report.species,
    breed: report.breed,
    healthConditions: report.healthConditions,
    notes: report.notes,
    lastSeenAddress: report.lastSeenAddress,
    location: report.location,
    animalImageDataUrl: report.animalImageDataUrl,
    adminChecklist: report.adminChecklist,
    lastAdminUpdateAt: report.lastAdminUpdateAt,
    reporterNotifiedAt: report.reporterNotifiedAt,
  });
}

async function upsertUsers() {
  const payload = readJson("users.json");
  const users = payload?.users ?? [];

  for (const user of users) {
    const email = String(user.email).trim().toLowerCase();
    const password = await normalizePassword(user.password);

    await prisma.user.upsert({
      where: { email },
      update: {
        fullName: user.name ?? user.fullName ?? email,
        password,
        role: user.role ?? "donor",
        createdAt: toDate(user.createdAt) ?? undefined,
        emailVerified: Boolean(user.emailVerified ?? true),
        emailVerifiedAt: toDate(user.emailVerifiedAt) ?? undefined,
      },
      create: {
        email,
        fullName: user.name ?? user.fullName ?? email,
        password,
        role: user.role ?? "donor",
        createdAt: toDate(user.createdAt) ?? undefined,
        emailVerified: Boolean(user.emailVerified ?? true),
        emailVerifiedAt: toDate(user.emailVerifiedAt) ?? undefined,
      },
    });
  }
}

async function upsertAnimals() {
  const payload = readJson("animals.json");
  const animals = payload?.animals ?? [];

  for (const animal of animals) {
    const animalCode = animal.animalCode || `AN-${animal.id}`;
    const id = slugifyAnimal(animal.name, animal.species);

    await prisma.animal.upsert({
      where: { animalCode },
      update: {
        id,
        intId: Number(animal.id),
        name: animal.name,
        species: animal.species,
        age: animal.age ?? null,
        adopted: animal.status === "adopted",
        breed: animal.breed ?? "",
        gender: animal.gender ?? "male",
        healthStatus: animal.healthStatus,
        notes: animal.notes ?? "",
        photoUrls: Array.isArray(animal.photoUrls) ? animal.photoUrls : [],
        status: animal.status ?? "admitted",
        vaccinationState: normalizeAnimalVaccinationState(animal.vaccinationStatus),
      },
      create: {
        id,
        intId: Number(animal.id),
        animalCode,
        name: animal.name,
        species: animal.species,
        age: animal.age ?? null,
        adopted: animal.status === "adopted",
        breed: animal.breed ?? "",
        gender: animal.gender ?? "male",
        healthStatus: animal.healthStatus,
        notes: animal.notes ?? "",
        photoUrls: Array.isArray(animal.photoUrls) ? animal.photoUrls : [],
        status: animal.status ?? "admitted",
        vaccinationState: normalizeAnimalVaccinationState(animal.vaccinationStatus),
      },
    });
  }
}

async function upsertAdoptions() {
  const payload = readJson("adoptions.json");
  const applications = payload?.applications ?? [];

  for (const application of applications) {
    const applicationId = application.applicationId || `ADP-${application.id}`;

    await prisma.adoptionApplication.upsert({
      where: { applicationId },
      update: {
        applicantName: application.applicantName,
        email: application.email,
        phone: application.phone ?? null,
        city: application.city ?? null,
        housing: application.housing ?? null,
        petExperience: application.petExperience ?? null,
        whyAdopt: application.whyAdopt ?? null,
        animalId: application.animalId ?? null,
        animalName: application.animalName ?? null,
        animalCode: application.animalCode ?? null,
        status: application.status ?? "applied",
        adminNotes: application.adminNotes ?? null,
        timeline: application.timeline ?? null,
        createdAt: toDate(application.createdAt) ?? undefined,
      },
      create: {
        applicationId,
        applicantName: application.applicantName,
        email: application.email,
        phone: application.phone ?? null,
        city: application.city ?? null,
        housing: application.housing ?? null,
        petExperience: application.petExperience ?? null,
        whyAdopt: application.whyAdopt ?? null,
        animalId: application.animalId ?? null,
        animalName: application.animalName ?? null,
        animalCode: application.animalCode ?? null,
        status: application.status ?? "applied",
        adminNotes: application.adminNotes ?? null,
        timeline: application.timeline ?? null,
        createdAt: toDate(application.createdAt) ?? undefined,
      },
    });
  }
}

async function upsertAdoptionRequests() {
  const payload = readJson("adoption-requests.json");
  const adoptionRequests = payload?.adoptionRequests ?? [];

  for (const request of adoptionRequests) {
    const requestId = request.requestId || `AR-${request.id}`;

    await prisma.adoptionRequest.upsert({
      where: { requestId },
      update: {
        animalSlug: request.animalSlug,
        animalName: request.animalName,
        animalSpecies: request.animalSpecies,
        animalImage: request.animalImage,
        applicantName: request.applicantName,
        applicantEmail: request.applicantEmail,
        applicantPhone: request.applicantPhone,
        city: request.city,
        homeType: request.homeType,
        message: request.message,
        status: request.status,
        createdAt: toDate(request.createdAt) ?? undefined,
      },
      create: {
        requestId,
        animalSlug: request.animalSlug,
        animalName: request.animalName,
        animalSpecies: request.animalSpecies,
        animalImage: request.animalImage,
        applicantName: request.applicantName,
        applicantEmail: request.applicantEmail,
        applicantPhone: request.applicantPhone,
        city: request.city,
        homeType: request.homeType,
        message: request.message,
        status: request.status,
        createdAt: toDate(request.createdAt) ?? undefined,
      },
    });
  }
}

async function upsertVolunteerApplications() {
  const payload = readJson("volunteer-applications.json");
  const applications = payload?.applications ?? [];

  for (const application of applications) {
    const applicationId = application.applicationId || `VL-${application.id}`;

    await prisma.volunteerApplication.upsert({
      where: { applicationId },
      update: {
        fullName: application.fullName,
        email: application.email,
        phone: application.phone ?? null,
        city: application.city ?? null,
        interestArea: application.interestArea ?? null,
        availability: application.availability ?? null,
        status: application.status ?? "pending",
        createdAt: toDate(application.createdAt) ?? undefined,
      },
      create: {
        applicationId,
        fullName: application.fullName,
        email: application.email,
        phone: application.phone ?? null,
        city: application.city ?? null,
        interestArea: application.interestArea ?? null,
        availability: application.availability ?? null,
        status: application.status ?? "pending",
        createdAt: toDate(application.createdAt) ?? undefined,
      },
    });
  }
}

async function upsertDonations() {
  const payload = readJson("donations.json");
  const donations = payload?.donations ?? [];

  for (const donation of donations) {
    const donationId = donation.donationId || `DN-${donation.id}`;

    await prisma.donation.upsert({
      where: { donationId },
      update: {
        donorName: donation.donorName,
        email: donation.email ?? null,
        phone: donation.phone ?? null,
        amount: Number(donation.amount),
        coverFees: Boolean(donation.coverFees),
        createdAt: toDate(donation.createdAt) ?? undefined,
      },
      create: {
        donationId,
        donorName: donation.donorName,
        email: donation.email ?? null,
        phone: donation.phone ?? null,
        amount: Number(donation.amount),
        coverFees: Boolean(donation.coverFees),
        createdAt: toDate(donation.createdAt) ?? undefined,
      },
    });
  }
}

async function upsertVaccinations() {
  const payload = readJson("vaccinations.json");
  const vaccinations = payload?.vaccinations ?? [];

  for (const vaccination of vaccinations) {
    const id = Number(vaccination.id);

    await prisma.vaccination.upsert({
      where: { id },
      update: {
        animalId: Number(vaccination.animalId),
        animalName: vaccination.animalName,
        vaccineName: vaccination.vaccineName,
        dose: toNullableString(vaccination.dose),
        dateGiven: toDate(vaccination.dateGiven) ?? new Date(),
        nextDueDate: toDate(vaccination.nextDueDate) ?? null,
        notes: toNullableString(vaccination.notes),
      },
      create: {
        id,
        animalId: Number(vaccination.animalId),
        animalName: vaccination.animalName,
        vaccineName: vaccination.vaccineName,
        dose: toNullableString(vaccination.dose),
        dateGiven: toDate(vaccination.dateGiven) ?? new Date(),
        nextDueDate: toDate(vaccination.nextDueDate) ?? null,
        notes: toNullableString(vaccination.notes),
      },
    });
  }
}

async function upsertRescueReports() {
  const payload = readJson("rescue-reports.json");
  const rescueReports = payload?.rescueReports ?? [];

  for (const report of rescueReports) {
    const reportId = report.reportId || `RS-${report.id}`;
    const location = report.lastSeenAddress || (report.location ? `${report.location.latitude},${report.location.longitude}` : "");

    await prisma.rescueRequest.upsert({
      where: { reportId },
      update: {
        location,
        description: rescueDescription(report),
        status: report.caseStatus ?? "reported",
        priority: report.urgency ?? "standard",
        reporterName: report.fullName,
        reporterPhone: report.phone,
        createdAt: toDate(report.createdAt) ?? undefined,
        updatedAt: toDate(report.lastAdminUpdateAt) ?? undefined,
      },
      create: {
        reportId,
        location,
        description: rescueDescription(report),
        status: report.caseStatus ?? "reported",
        priority: report.urgency ?? "standard",
        reporterName: report.fullName,
        reporterPhone: report.phone,
        createdAt: toDate(report.createdAt) ?? undefined,
        updatedAt: toDate(report.lastAdminUpdateAt) ?? undefined,
      },
    });
  }
}

async function upsertInquiries() {
  const payload = readJson("inquiries.json");
  const inquiries = payload?.inquiries ?? [];

  for (const inquiry of inquiries) {
    const id = Number(inquiry.id);

    await prisma.inquiry.upsert({
      where: { id },
      update: {
        type: inquiry.type,
        referenceId: inquiry.referenceId ?? null,
        title: inquiry.title,
        preview: inquiry.preview ?? null,
        status: inquiry.status ?? "new",
        createdAt: toDate(inquiry.createdAt) ?? undefined,
        updatedAt: toDate(inquiry.updatedAt) ?? undefined,
      },
      create: {
        id,
        type: inquiry.type,
        referenceId: inquiry.referenceId ?? null,
        title: inquiry.title,
        preview: inquiry.preview ?? null,
        status: inquiry.status ?? "new",
        createdAt: toDate(inquiry.createdAt) ?? undefined,
        updatedAt: toDate(inquiry.updatedAt) ?? undefined,
      },
    });
  }
}

async function main() {
  await upsertUsers();
  await upsertAnimals();
  await upsertAdoptions();
  await upsertAdoptionRequests();
  await upsertVolunteerApplications();
  await upsertDonations();
  await upsertVaccinations();
  await upsertRescueReports();
  await upsertInquiries();

  console.log("Seed completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
