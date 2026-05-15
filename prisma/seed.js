const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@thecaninehelp.local' },
    update: {},
    create: {
      email: 'admin@thecaninehelp.local',
      name: 'Admin User',
    },
  });

  const animals = [
    { name: 'Buddy', species: 'Dog', age: 3, adopted: false },
    { name: 'Milo', species: 'Cat', age: 2, adopted: true },
    { name: 'Luna', species: 'Dog', age: 1, adopted: false },
  ];

  for (const animal of animals) {
    await prisma.animal.upsert({
      where: {
        id: `${animal.name.toLowerCase()}-${animal.species.toLowerCase()}`,
      },
      update: animal,
      create: {
        id: `${animal.name.toLowerCase()}-${animal.species.toLowerCase()}`,
        ...animal,
      },
    });
  }

    // Import additional dashboard data from /data/*.json if available
    const fs = require('fs');
    const path = require('path');
    const dataDir = path.join(process.cwd(), 'data');

    // Donations
    try {
      const donationsPath = path.join(dataDir, 'donations.json');
      if (fs.existsSync(donationsPath)) {
        const donationsRaw = fs.readFileSync(donationsPath, 'utf-8');
        const donationsJson = JSON.parse(donationsRaw);
        const donations = donationsJson.donations || donationsJson;
        for (const d of donations) {
          await prisma.donation.upsert({
            where: { donationId: d.donationId ?? `DN-${d.id}` },
            update: {
              donorName: d.donorName,
              email: d.email,
              phone: d.phone,
              amount: d.amount,
              coverFees: !!d.coverFees,
            },
            create: {
              donationId: d.donationId ?? `DN-${d.id}`,
              donorName: d.donorName,
              email: d.email,
              phone: d.phone,
              amount: d.amount,
              coverFees: !!d.coverFees,
              createdAt: d.createdAt ? new Date(d.createdAt) : undefined,
            },
          });
        }
      }
    } catch (e) {
      console.error('Failed to seed donations', e);
    }

    // Vaccinations
    try {
      const vaccPath = path.join(dataDir, 'vaccinations.json');
      if (fs.existsSync(vaccPath)) {
        const vaccRaw = fs.readFileSync(vaccPath, 'utf-8');
        const vaccJson = JSON.parse(vaccRaw);
        const items = vaccJson.vaccinations || vaccJson;
        for (const v of items) {
          await prisma.vaccination.upsert({
            where: { id: v.id },
            update: {
              animalId: v.animalId,
              animalName: v.animalName,
              vaccineName: v.vaccineName,
              dose: v.dose,
              notes: v.notes,
              dateGiven: v.dateGiven ? new Date(v.dateGiven) : new Date(),
              nextDueDate: v.nextDueDate ? new Date(v.nextDueDate) : null,
            },
            create: {
              id: v.id,
              animalId: v.animalId,
              animalName: v.animalName,
              vaccineName: v.vaccineName,
              dose: v.dose,
              notes: v.notes,
              dateGiven: v.dateGiven ? new Date(v.dateGiven) : new Date(),
              nextDueDate: v.nextDueDate ? new Date(v.nextDueDate) : null,
            },
          });
        }
      }
    } catch (e) {
      console.error('Failed to seed vaccinations', e);
    }

    // Adoption applications
    try {
      const adpPath = path.join(dataDir, 'adoptions.json');
      if (fs.existsSync(adpPath)) {
        const raw = fs.readFileSync(adpPath, 'utf-8');
        const json = JSON.parse(raw);
        const apps = json.applications || json;
        for (const a of apps) {
          await prisma.adoptionApplication.upsert({
            where: { applicationId: a.applicationId ?? `ADP-${a.id}` },
            update: {
              applicantName: a.applicantName,
              email: a.email,
              phone: a.phone,
              city: a.city,
              housing: a.housing,
              petExperience: a.petExperience,
              whyAdopt: a.whyAdopt,
              animalId: a.animalId,
              animalName: a.animalName,
              animalCode: a.animalCode,
              status: a.status,
              adminNotes: a.adminNotes,
              timeline: a.timeline || null,
              createdAt: a.createdAt ? new Date(a.createdAt) : undefined,
            },
            create: {
              applicationId: a.applicationId ?? `ADP-${a.id}`,
              applicantName: a.applicantName,
              email: a.email,
              phone: a.phone,
              city: a.city,
              housing: a.housing,
              petExperience: a.petExperience,
              whyAdopt: a.whyAdopt,
              animalId: a.animalId,
              animalName: a.animalName,
              animalCode: a.animalCode,
              status: a.status,
              adminNotes: a.adminNotes,
              timeline: a.timeline || null,
              createdAt: a.createdAt ? new Date(a.createdAt) : undefined,
            },
          });
        }
      }
    } catch (e) {
      console.error('Failed to seed adoptions', e);
    }

    // Volunteer applications
    try {
      const volPath = path.join(dataDir, 'volunteer-applications.json');
      if (fs.existsSync(volPath)) {
        const raw = fs.readFileSync(volPath, 'utf-8');
        const json = JSON.parse(raw);
        const apps = json.applications || json;
        for (const v of apps) {
          await prisma.volunteerApplication.upsert({
            where: { applicationId: v.applicationId ?? `VL-${v.id}` },
            update: {
              fullName: v.fullName,
              email: v.email,
              phone: v.phone,
              city: v.city,
              interestArea: v.interestArea,
              availability: v.availability,
              status: v.status,
            },
            create: {
              applicationId: v.applicationId ?? `VL-${v.id}`,
              fullName: v.fullName,
              email: v.email,
              phone: v.phone,
              city: v.city,
              interestArea: v.interestArea,
              availability: v.availability,
              status: v.status,
              createdAt: v.createdAt ? new Date(v.createdAt) : undefined,
            },
          });
        }
      }
    } catch (e) {
      console.error('Failed to seed volunteer applications', e);
    }

    // Inquiries
    try {
      const inqPath = path.join(dataDir, 'inquiries.json');
      if (fs.existsSync(inqPath)) {
        const raw = fs.readFileSync(inqPath, 'utf-8');
        const json = JSON.parse(raw);
        const items = json.inquiries || json;
        for (const q of items) {
          await prisma.inquiry.upsert({
            where: { id: q.id },
            update: {
              type: q.type,
              referenceId: q.referenceId,
              title: q.title,
              preview: q.preview,
              status: q.status,
              createdAt: q.createdAt ? new Date(q.createdAt) : undefined,
              updatedAt: q.updatedAt ? new Date(q.updatedAt) : undefined,
            },
            create: {
              id: q.id,
              type: q.type,
              referenceId: q.referenceId,
              title: q.title,
              preview: q.preview,
              status: q.status,
              createdAt: q.createdAt ? new Date(q.createdAt) : undefined,
              updatedAt: q.updatedAt ? new Date(q.updatedAt) : undefined,
            },
          });
        }
      }
    } catch (e) {
      console.error('Failed to seed inquiries', e);
    }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed completed successfully.');
  })
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
