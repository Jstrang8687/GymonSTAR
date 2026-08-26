import { PrismaClient } from "@prisma/client";
import { COACHES } from "../src/lib/coaches";

const prisma = new PrismaClient();

async function main() {
  for (const coach of COACHES) {
    await prisma.coach.upsert({
      where: { slug: coach.slug },
      update: coach,
      create: coach,
    });
  }
  console.log(`Seeded ${COACHES.length} coaches.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
