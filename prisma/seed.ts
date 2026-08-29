import { prisma } from "../src/lib/prisma";
import { COACHES } from "../src/lib/coaches";

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
