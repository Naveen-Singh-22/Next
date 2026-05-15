import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting backfill of Animal intId...");

  // Get all animals without intId
  const animals = await prisma.animal.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  // Assign sequential intIds
  for (let i = 0; i < animals.length; i++) {
    const intId = i + 1; // Start from 1
    const animalId = animals[i].id;
    await prisma.animal.update({
      where: { id: animalId },
      data: { intId },
    });
    console.log(`  ${animals[i].name}: intId=${intId}`);
  }

  // Verify
  const updated = await prisma.animal.findMany({
    select: { id: true, name: true, intId: true },
  });
  console.log("\n✓ Backfill complete!");
  console.log("Verification:", updated);
}

main()
  .catch((e) => {
    console.error("Backfill failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
