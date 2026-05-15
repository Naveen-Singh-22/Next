import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function main() {
  console.log("Starting backfill of new Animal fields...");

  // Load original data fixtures to populate additional fields
  const animalsFixturePath = path.join(__dirname, "../data/animals.json");
  let animalFixtures = [];
  if (fs.existsSync(animalsFixturePath)) {
    const data = JSON.parse(fs.readFileSync(animalsFixturePath, "utf-8"));
    animalFixtures = data.animals || data;
  }
  console.log(`Loaded ${animalFixtures.length} animal fixtures`);

  // Build a map of fixture data keyed by name for quick lookup
  const fixtureMap = {};
  animalFixtures.forEach((fixture) => {
    fixtureMap[fixture.name] = fixture;
  });

  // Get all animals from DB
  const animals = await prisma.animal.findMany();
  console.log(`Found ${animals.length} animals in DB to backfill`);

  for (const animal of animals) {
    const fixture = fixtureMap[animal.name] || {};

    // Generate animalCode: lowercase name + species (e.g., "buddy-dog")
    const animalCode = `${animal.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-${animal.species.toLowerCase()}`;

    // Extract fields from fixture or use sensible defaults
    const updateData = {
      animalCode,
      breed: fixture.breed || null,
      gender: fixture.gender || null,
      healthStatus: fixture.healthStatus || "healthy",
      notes: fixture.notes || null,
      photoUrls: fixture.photoUrls || [],
      status: fixture.status || "available",
      vaccinationState: fixture.vaccinationState || "up-to-date",
    };

    console.log(`Backfilling ${animal.name}:`, updateData);

    await prisma.animal.update({
      where: { id: animal.id },
      data: updateData,
    });
  }

  console.log("✓ Backfill complete!");

  // Verify
  const updated = await prisma.animal.findMany();
  updated.forEach((a) => {
    console.log(`  ${a.name}: code=${a.animalCode}, breed=${a.breed}, status=${a.status}`);
  });
}

main()
  .catch((e) => {
    console.error("Backfill failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
