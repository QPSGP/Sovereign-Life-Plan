const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const defaultPlans = [
  { name: "Basic", slug: "basic", amountCents: 1900, interval: "monthly", sortOrder: 1 },
  { name: "Standard", slug: "standard", amountCents: 4900, interval: "monthly", sortOrder: 2 },
  { name: "Premium", slug: "premium", amountCents: 9900, interval: "monthly", sortOrder: 3 },
  { name: "Sovereign", slug: "sovereign", amountCents: 19900, interval: "monthly", sortOrder: 4 },
];

async function main() {
  for (const plan of defaultPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: { name: plan.name, amountCents: plan.amountCents, interval: plan.interval, sortOrder: plan.sortOrder },
      create: plan,
    });
  }
  console.log("Seeded subscription plans:", defaultPlans.map((p) => p.slug).join(", "));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
