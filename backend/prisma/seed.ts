import { prisma } from "../src/config/prisma.js";

async function main() {
  console.log("[seed] nothing to seed yet — schema ready.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
