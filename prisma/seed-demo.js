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
      firstName: "Sam",
      lastName: "Rivera",
      title: "Principal",
      company: "Rivera Advisory LLC",
      street: "100 Main St, Suite 200",
      city: "Austin",
      state: "TX",
      zip: "78701",
      country: "USA",
      phone: "555-0100",
      notes: "Fact data – demo member.",
    },
  });
  await prisma.memberCategory.create({ data: { memberId: member.id, category: "Personal" } });
  console.log("Created demo member (fact data):", member.email);

  const businessPlan = plans.find((p) => p.slug === "sovereign-business");
  const hash2 = await bcrypt.hash("fact4567", 10);
  const member2 = await prisma.member.create({
    data: {
      email: "jordan.lee@example.slp.local",
      passwordHash: hash2,
      firstName: "Jordan",
      lastName: "Lee",
      title: "Director",
      company: "Northgate Partners",
      street: "4500 Oak Blvd",
      city: "Dallas",
      state: "TX",
      zip: "75201",
      country: "USA",
      phone: "555-0200",
      notes: "Fact data – second demo member.",
    },
  });
  await prisma.memberCategory.create({ data: { memberId: member2.id, category: "Agency" } });
  await prisma.memberCategory.create({ data: { memberId: member2.id, category: "MMPE4" } });
  console.log("Created second member (fact data):", member2.email);

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
  await prisma.subscription.create({
    data: {
      memberId: member2.id,
      subscriptionPlanId: businessPlan ? businessPlan.id : personalPlan.id,
      status: "active",
      currentPeriodEnd: periodEnd,
    },
  });
  console.log("Created subscriptions for both members.");

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
      results: "Averaged 9.2k last week.",
      done: true,
      doneAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });
  const purpose2 = await prisma.areaOfPurpose.create({
    data: {
      subjectBusinessId: subject.id,
      name: "Family & relationships",
      verb: "Nurture",
      noun: "connections",
      object: "quality time",
      objective: "Weekly check-ins",
    },
  });
  const responsibility2 = await prisma.areaOfResponsibility.create({
    data: {
      areaOfPurposeId: purpose2.id,
      name: "Family dinner",
      verb: "Host",
      noun: "dinner",
      object: "Sunday evening",
      objective: "Once per week",
    },
  });
  const movement1b = await prisma.physicalMovement.create({
    data: {
      areaOfResponsibilityId: responsibility2.id,
      verb: "Block",
      noun: "calendar",
      object: "Sunday 5–7pm",
      objective: "No other commitments",
      results: null,
    },
  });
  await prisma.physicalMovement.update({ where: { id: movement1b.id }, data: { done: true, doneAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } });
  console.log("Created demo life plan for member 1 (subject + 2 purposes with responsibilities & movements; some done).");

  const subject2 = await prisma.subjectBusiness.create({
    data: {
      userId: user.id,
      memberId: member2.id,
      name: "Northgate Growth Plan",
      verb: "Scale",
      noun: "practice",
      object: "client impact",
      objective: "Sustainable growth",
    },
  });
  const purpose2m2 = await prisma.areaOfPurpose.create({
    data: {
      subjectBusinessId: subject2.id,
      name: "Client delivery & retention",
      verb: "Deliver",
      noun: "value",
      object: "on commitments",
      objective: "95% retention",
    },
  });
  const responsibility2m2 = await prisma.areaOfResponsibility.create({
    data: {
      areaOfPurposeId: purpose2m2.id,
      name: "Quarterly business reviews",
      verb: "Conduct",
      noun: "QBR",
      object: "with each client",
      objective: "Per quarter",
    },
  });
  await prisma.physicalMovement.create({
    data: {
      areaOfResponsibilityId: responsibility2m2.id,
      verb: "Schedule",
      noun: "review",
      object: "calls",
      objective: "By end of month",
      results: "Q1 QBRs on calendar.",
      done: true,
      doneAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
  });
  const purpose2m2b = await prisma.areaOfPurpose.create({
    data: {
      subjectBusinessId: subject2.id,
      name: "Team & operations",
      verb: "Run",
      noun: "operations",
      object: "smoothly",
      objective: "Clear roles, no bottlenecks",
    },
  });
  const responsibility2m2b = await prisma.areaOfResponsibility.create({
    data: {
      areaOfPurposeId: purpose2m2b.id,
      name: "Weekly team sync",
      verb: "Lead",
      noun: "meeting",
      object: "agenda & notes",
      objective: "Every Monday 9am",
    },
  });
  await prisma.physicalMovement.create({
    data: {
      areaOfResponsibilityId: responsibility2m2b.id,
      verb: "Send",
      noun: "agenda",
      object: "24h in advance",
      objective: "So team can prep",
      results: null,
    },
  });
  console.log("Created demo life plan for member 2 (subject + 2 purposes with responsibilities & movements; some done).");

  const mp1 = await prisma.memberPlan.create({
    data: { memberId: member.id, subjectBusiness: "Personal", areasOfPurpose: "Health; Family", areasOfResponsibility: "Movement; Family dinner", sortOrder: 0 },
  });
  await prisma.memberPlanTask.create({ data: { memberPlanId: mp1.id, verb: "Walk", noun: "steps", object: "10k", objective: "Daily", done: true, doneAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) } });
  await prisma.memberPlanTask.create({ data: { memberPlanId: mp1.id, verb: "Block", noun: "Sunday", object: "5–7pm", objective: "Family dinner", done: false } });
  const mp2 = await prisma.memberPlan.create({
    data: { memberId: member2.id, subjectBusiness: "Business", areasOfPurpose: "Client delivery; Operations", areasOfResponsibility: "QBRs; Team sync", sortOrder: 0 },
  });
  await prisma.memberPlanTask.create({ data: { memberPlanId: mp2.id, verb: "Send", noun: "agenda", object: "24h ahead", objective: "Monday sync", done: true, doneAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
  await prisma.memberPlanTask.create({ data: { memberPlanId: mp2.id, verb: "Conduct", noun: "QBR", object: "with top 3 clients", objective: "This quarter", done: false } });
  console.log("Created MemberPlan + tasks for both members.");

  const comms = [
    { memberId: member.id, type: "call", subject: "Welcome call", notes: "Intro and onboarding." },
    { memberId: member.id, type: "email", subject: "Life plan link", notes: "Sent portal login and plan link." },
    { memberId: member.id, type: "call", subject: "30-day check-in", notes: "Reviewed goals; walking habit on track." },
    { memberId: member.id, type: "mailout", subject: "Newsletter Q1", notes: "Life plan tips and recap." },
    { memberId: member2.id, type: "call", subject: "Discovery call", notes: "Discussed Business plan and next steps." },
    { memberId: member2.id, type: "email", subject: "Contract and invoice", notes: "Sent SOVEREIGN Business agreement." },
    { memberId: member2.id, type: "call", subject: "Kickoff", notes: "Set Northgate Growth Plan; QBR schedule." },
    { memberId: member2.id, type: "email", subject: "QBR template", notes: "Shared agenda template for client reviews." },
  ];
  for (const c of comms) await prisma.communication.create({ data: c });
  console.log("Created " + comms.length + " communications.");

  const chorePast = new Date();
  chorePast.setDate(chorePast.getDate() - 2);
  await prisma.chore.create({ data: { title: "Review demo member", description: "Check portal and plan display", done: true, doneAt: chorePast } });
  await prisma.chore.create({ data: { title: "Update docs", description: "After demo data is verified" } });
  await prisma.chore.create({ data: { title: "Send renewal reminders", description: "Members due in 30 days" } });
  await prisma.chore.create({ data: { title: "Reconcile manual payments", description: "Match to open invoices" } });
  console.log("Created 4 chores (1 done).");

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const expenditures = [
    { memberId: member.id, description: "Coaching session", amountCents: 5000, date: twoWeeksAgo, notes: "Monthly 1:1." },
    { memberId: member.id, description: "Course materials", amountCents: 2990, date: lastMonth, notes: "Life plan workbook." },
    { memberId: member.id, description: "Annual retreat ticket", amountCents: 15000, date: new Date(), notes: "Early bird." },
    { memberId: member2.id, description: "Consulting retainer", amountCents: 25000, date: lastMonth, notes: "Business plan month 1." },
    { memberId: member2.id, description: "Team training", amountCents: 50000, date: twoWeeksAgo, notes: "QBR facilitation." },
    { memberId: member2.id, description: "Software (planning tool)", amountCents: 9900, date: new Date(), notes: "Annual license." },
  ];
  for (const e of expenditures) await prisma.expenditure.create({ data: e });
  console.log("Created " + expenditures.length + " expenditures.");

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const pastDue = new Date();
  pastDue.setDate(pastDue.getDate() - 5);
  const paidLastMonth = new Date();
  paidLastMonth.setMonth(paidLastMonth.getMonth() - 1);

  const inv1 = await prisma.invoice.create({
    data: { memberId: member.id, invoiceNumber: "INV-001", amountCents: 2500, dueDate, status: "open" },
  });
  await prisma.payment.create({
    data: { invoiceId: inv1.id, amountCents: 1000, currencyType: "fiat", currencyCode: "USD", paymentProvider: "manual", providerPaymentId: "demo-payment-1" },
  });
  const invPaid1 = await prisma.invoice.create({
    data: { memberId: member.id, invoiceNumber: "INV-000", amountCents: 2500, dueDate: paidLastMonth, status: "paid" },
  });
  await prisma.payment.create({
    data: { invoiceId: invPaid1.id, amountCents: 2500, currencyType: "fiat", currencyCode: "USD", paymentProvider: "manual", providerPaymentId: "demo-payment-0" },
  });
  await prisma.invoice.create({
    data: { memberId: member.id, invoiceNumber: "INV-001b", amountCents: 2500, dueDate: pastDue, status: "past_due" },
  });

  const dueDate2 = new Date();
  dueDate2.setDate(dueDate2.getDate() + 30);
  const inv2 = await prisma.invoice.create({
    data: { memberId: member2.id, invoiceNumber: "INV-002", amountCents: 25000, dueDate: dueDate2, status: "open" },
  });
  await prisma.payment.create({
    data: { invoiceId: inv2.id, amountCents: 10000, currencyType: "fiat", currencyCode: "USD", paymentProvider: "manual", providerPaymentId: "demo-payment-2" },
  });
  const invPaid2 = await prisma.invoice.create({
    data: { memberId: member2.id, invoiceNumber: "INV-002a", amountCents: 25000, dueDate: paidLastMonth, status: "paid" },
  });
  await prisma.payment.create({
    data: { invoiceId: invPaid2.id, amountCents: 25000, currencyType: "fiat", currencyCode: "USD", paymentProvider: "manual", providerPaymentId: "demo-payment-2a" },
  });
  console.log("Created 6 invoices (2 paid, 2 open, 1 past_due, 1 open with partial payment).");

  const order1 = await prisma.order.create({
    data: { memberId: member.id, orderNumber: "ORD-001", totalCents: 2500, status: "paid" },
  });
  await prisma.orderLine.create({ data: { orderId: order1.id, type: "subscription", item: "SOVEREIGN Personal", unitCents: 2500, quantity: 1, totalCents: 2500 } });
  const order2 = await prisma.order.create({
    data: { memberId: member.id, orderNumber: "ORD-002", totalCents: 2990, status: "pending" },
  });
  await prisma.orderLine.create({ data: { orderId: order2.id, type: "one-time", item: "Workbook", unitCents: 2990, quantity: 1, totalCents: 2990 } });
  const order3 = await prisma.order.create({
    data: { memberId: member2.id, orderNumber: "ORD-101", totalCents: 25000, status: "paid" },
  });
  await prisma.orderLine.create({ data: { orderId: order3.id, type: "subscription", item: "SOVEREIGN Business", unitCents: 25000, quantity: 1, totalCents: 25000 } });
  const order4 = await prisma.order.create({
    data: { memberId: member2.id, orderNumber: "ORD-102", totalCents: 50000, status: "pending" },
  });
  await prisma.orderLine.create({ data: { orderId: order4.id, type: "one-time", item: "Team training", unitCents: 50000, quantity: 1, totalCents: 50000 } });
  console.log("Created 4 orders with order lines (2 paid, 2 pending).");

  console.log("Demo seed done. Members with fact data:");
  console.log("  1. " + DEMO_MEMBER_EMAIL + " / demo1234 (Personal, SOVEREIGN: Personal, has life plan)");
  console.log("  2. jordan.lee@example.slp.local / fact4567 (Agency + MMPE4, SOVEREIGN: Business)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
