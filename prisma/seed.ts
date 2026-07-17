// Consolidates the original Sequelize seeders into a single Prisma seed script:
//   src/seeder/adminSeeder.ts
//   src/seeder/roleSeeder.ts
//   src/seeder/incomeCategorySeed.ts
//   src/seeder/expenseCategorySeed.ts
//
// Run with: npx prisma db seed
// (wired up via the "prisma.seed" entry in package.json)

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { ROLES } from "../src/config/constants";

dotenv.config();

const prisma = new PrismaClient();

const incomeCategories = [
  { categoryName: "Software Development", categoryDescription: "Custom software and web application development revenue." },
  { categoryName: "Website Development", categoryDescription: "Static and dynamic website development projects." },
  { categoryName: "Mobile App Development", categoryDescription: "iOS and Android application development." },
  { categoryName: "ERP Development", categoryDescription: "Enterprise resource planning system development." },
  { categoryName: "Government Project", categoryDescription: "Projects contracted with government entities." },
  { categoryName: "School Training", categoryDescription: "IT training programs delivered to school students." },
  { categoryName: "College Training", categoryDescription: "IT training programs delivered to college students." },
  { categoryName: "Corporate Training", categoryDescription: "IT training delivered to corporate organizations." },
  { categoryName: "Online Class", categoryDescription: "Online / remote training sessions." },
  { categoryName: "Physical Class", categoryDescription: "In-person classroom training sessions." },
  { categoryName: "Consultancy", categoryDescription: "IT consultancy and advisory services." },
  { categoryName: "AMC / Maintenance", categoryDescription: "Annual maintenance contracts and support retainers." },
  { categoryName: "Hosting Services", categoryDescription: "Web hosting service revenue." },
  { categoryName: "Domain Services", categoryDescription: "Domain registration and renewal revenue." },
  { categoryName: "Other", categoryDescription: "Income that does not fit other categories." },
];

const expenseCategories = [
  { categoryName: "Salary", categoryDescription: "Monthly salary payments to full-time employees." },
  { categoryName: "Bonus", categoryDescription: "Performance or festival bonuses." },
  { categoryName: "Allowance", categoryDescription: "Transport, meal, or other allowances." },
  { categoryName: "Freelancer Payment", categoryDescription: "Payments to freelance contractors." },
  { categoryName: "Office Rent", categoryDescription: "Office space rental payments." },
  { categoryName: "Office Electricity", categoryDescription: "Electricity utility bills." },
  { categoryName: "Office Water", categoryDescription: "Water utility bills." },
  { categoryName: "Office Internet", categoryDescription: "Internet/broadband subscription." },
  { categoryName: "Office Stationery", categoryDescription: "Paper, pens, and general stationery." },
  { categoryName: "Office Supplies", categoryDescription: "General office consumables." },
  { categoryName: "Office Furniture", categoryDescription: "Office furniture purchases." },
  { categoryName: "Office Maintenance", categoryDescription: "Office repairs and maintenance." },
  { categoryName: "Office Cleaning", categoryDescription: "Cleaning services and supplies." },
  { categoryName: "Server", categoryDescription: "Physical or cloud server costs." },
  { categoryName: "Hosting", categoryDescription: "Web/app hosting subscriptions." },
  { categoryName: "Domain", categoryDescription: "Domain registration and renewals." },
  { categoryName: "SSL", categoryDescription: "SSL certificate purchases." },
  { categoryName: "Software Subscription", categoryDescription: "SaaS tool subscriptions (e.g., Figma, Notion)." },
  { categoryName: "API Charges", categoryDescription: "Third-party API usage fees." },
  { categoryName: "Facebook Ads", categoryDescription: "Meta/Facebook advertising spend." },
  { categoryName: "Google Ads", categoryDescription: "Google advertising spend." },
  { categoryName: "Printing", categoryDescription: "Banners, brochures, printed materials." },
  { categoryName: "Events", categoryDescription: "Event sponsorships and participation costs." },
  { categoryName: "Fuel", categoryDescription: "Fuel for company vehicles." },
  { categoryName: "Travel", categoryDescription: "Bus, flight, or taxi travel costs." },
  { categoryName: "Accommodation", categoryDescription: "Hotel or lodging costs." },
  { categoryName: "Team Celebration", categoryDescription: "Team outing or party expenses." },
  { categoryName: "Festival Celebration", categoryDescription: "Dashain, Tihar, and other festival celebrations." },
  { categoryName: "Office Lunch", categoryDescription: "Team lunch or refreshments." },
  { categoryName: "Gifts", categoryDescription: "Client or employee gifts." },
  { categoryName: "Taxes", categoryDescription: "Government tax payments." },
  { categoryName: "Bank Charges", categoryDescription: "Bank service fees and transaction charges." },
  { categoryName: "Miscellaneous", categoryDescription: "Expenses that do not fit other categories." },
];

async function seedRoles() {
  const existingRoles = await prisma.role.findMany();
  if (existingRoles.length !== 0) return;

  await prisma.role.createMany({ data: ROLES.map((roleName) => ({ roleName })) });
  console.log("Roles seeded successfully");
}

async function seedIncomeCategories() {
  const existing = await prisma.incomeCategory.findMany();
  if (existing.length !== 0) return;

  await prisma.incomeCategory.createMany({ data: incomeCategories });
  console.log("income category seeded successfully");
}

async function seedExpenseCategories() {
  const existing = await prisma.expenseCategory.findMany();
  if (existing.length !== 0) return;

  await prisma.expenseCategory.createMany({ data: expenseCategories });
  console.log("expense category seeded successfully");
}

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL as string;
  const adminPassword = process.env.ADMIN_PASSWORD as string;
  const existingUser = await prisma.user.findFirst({ where: { userEmail: adminEmail } });

  if (existingUser) {
    const accountantRole = await prisma.role.findFirst({ where: { roleName: "accountant" } });
    if (accountantRole) {
      const alreadyLinked = await prisma.userRole.findFirst({
        where: { userId: existingUser.id, roleId: accountantRole.id },
      });
      if (!alreadyLinked) {
        await prisma.userRole.create({
          data: { userId: existingUser.id, roleId: accountantRole.id },
        });
      }
    }
    return;
  }

  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD env var is required");
  }

  await prisma.user.create({
    data: {
      userName: "admin",
      userEmail: adminEmail,
      userPassword: bcrypt.hashSync(adminPassword, 10),
    },
  });
}

async function main() {
  try {
    // NOTE: this order matches the original src/app.ts call order
    // (adminSeeder -> incomeSeeder -> expenseSeeder -> roleSeeder). That means
    // on a completely fresh database the very first seed run creates the admin
    // user WITHOUT the "accountant" role attached, because the roles table is
    // still empty at that point — the role only gets linked on a later re-run
    // of this script, once roles exist. This mirrors the original behavior;
    // see MIGRATION_NOTES.md for a suggested fix (seed roles first).
    await seedAdmin();
    await seedIncomeCategories();
    await seedExpenseCategories();
    await seedRoles();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
