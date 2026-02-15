/**
 * Optional demo seed: populates sample members, a life plan, communications, chores, expenditures, and an invoice.
 * Run after main seed: npm run db:seed && npm run db:seed:demo
 * Or in GitHub Actions: add a step that runs this when SEED_DEMO_DATA=true.
 * Idempotent: if demo member already exists, skips (so safe to run twice).
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const DEMO_MEMBER_EMAIL = "demo@sovereign-life-plan.local";

async function main() {
  const existing = await prisma.member.findUnique({ where: { email: DEMO_MEMBER_EMAIL } });
  if (existing) {
    console.log("Demo data already present (member " + DEMO_MEMBER_EMAIL + " exists). Skipping.");
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: "admin@sovereign-life-plan.local" } });
  if (!user) {
    console.log("Run main seed first (npm run db:seed). No default user found.");
    return;
  }

  const plans = await prisma.subscriptionPlan.findMany({ where: { slug: { in: ["sovereign-personal", "sovereign-business"] } }, orderBy: { sortOrder: "asc" } });
  const personalPlan = plans.find((p) => p.slug === "sovereign-personal") || plans[0];
  if (!personalPlan) {
    console.log("No subscription plan found. Run main seed first.");
    return;
  }

  const hash = await bcrypt.hash("demo1234", 10);
  const member = await prisma.member.create({
    data: {
      email: DEMO_MEMBER_EMAIL,
      passwordHash: hash,
      firstName: "Demo",
      lastName: "Member",
      company: "Demo Co",
      phone: "555-0100",
    },
  });
  await prisma.memberCategory.create({ data: { memberId: member.id, category: "Personal" } });
  console.log("Created demo member:", member.email);

  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  await prisma.subscription.create({
    data: {
      memberId: member.id,
      subscriptionPlanId: personalPlan.id,
      status: "active",
      currentPeriodEnd: periodEnd,
    },
  });
  console.log("Created subscription for demo member.");

  const subject = await prisma.subjectBusiness.create({
    data: {
      userId: user.id,
      memberId: member.id,
      name: "Demo Life Plan",
      verb: "Build",
      noun: "life",
      object: "plan",
      objective: "Clarity and focus",
    },
  });
  const purpose = await prisma.areaOfPurpose.create({
    data: {
      subjectBusinessId: subject.id,
      name: "Health & energy",
      verb: "Maintain",
      noun: "health",
      object: "daily habits",
      objective: "Sustain energy",
    },
  });
  const responsibility = await prisma.areaOfResponsibility.create({
    data: {
      areaOfPurposeId: purpose.id,
      name: "Daily movement",
      verb: "Complete",
      noun: "movement",
      object: "routine",
      objective: "30 min daily",
    },
  });
  await prisma.physicalMovement.create({
    data: {
      areaOfResponsibilityId: responsibility.id,
      verb: "Walk",
      noun: "steps",
      object: "10k",
      objective: "Hit step goal",
      results: null,
    },
  });
  console.log("Created demo life plan (subject → purpose → responsibility → movement).");

  await prisma.communication.create({
    data: { memberId: member.id, type: "call", subject: "Welcome call", notes: "Intro and onboarding." },
  });
  await prisma.communication.create({
    data: { memberId: member.id, type: "email", subject: "Life plan link", notes: "Sent portal login and plan link." },
  });
  console.log("Created 2 communications.");

  await prisma.chore.create({ data: { title: "Review demo member", description: "Check portal and plan display" } });
  await prisma.chore.create({ data: { title: "Update docs", description: "After demo data is verified" } });
  console.log("Created 2 chores.");

  await prisma.expenditure.create({
    data: {
      memberId: member.id,
      description: "Demo expense",
      amountCents: 5000,
      date: new Date(),
      notes: "Sample expenditure",
    },
  });
  console.log("Created 1 expenditure.");

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const invoice = await prisma.invoice.create({
    data: {
      memberId: member.id,
      invoiceNumber: "DEMO-001",
      amountCents: 2500,
      dueDate,
      status: "open",
    },
  });
  await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      amountCents: 1000,
      currencyType: "fiat",
      currencyCode: "USD",
      paymentProvider: "manual",
      providerPaymentId: "demo-payment-1",
    },
  });
  console.log("Created 1 invoice with 1 partial payment.");

  console.log("Demo seed done. Log in to portal as " + DEMO_MEMBER_EMAIL + " / demo1234 to see the plan.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
