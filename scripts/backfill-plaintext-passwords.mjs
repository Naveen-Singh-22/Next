import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function isBcryptHash(value) {
  return /^\$2[aby]?\$\d{2}\$/.test(value);
}

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, password: true } });
  let updatedCount = 0;

  for (const user of users) {
    if (!user.password || isBcryptHash(user.password)) {
      continue;
    }

    const hashed = await bcrypt.hash(user.password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    updatedCount += 1;
    console.log(`Migrated plaintext password for ${user.email}`);
  }

  console.log(`Password backfill complete. Updated ${updatedCount} account(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });