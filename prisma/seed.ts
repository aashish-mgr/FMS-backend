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
import {
  DEFAULT_TENANT_ID,
  DEFAULT_TENANT_NAME,
  DEFAULT_TENANT_SLUG,
  DEFAULT_WORKSPACE_SETTINGS,
  ROLES,
} from "../src/config/constants";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from "../src/config/defaultCategories";

dotenv.config();

const prisma = new PrismaClient();

async function seedRoles() {
  for (const roleName of ROLES) {
    const existing = await prisma.role.findFirst({ where: { roleName } });
    if (!existing) {
      await prisma.role.create({ data: { roleName } });
    }
  }
  console.log("Roles seeded successfully");
}

async function ensureDefaultTenant() {
  const existing = await prisma.tenant.findFirst({
    where: {
      OR: [{ id: DEFAULT_TENANT_ID }, { slug: DEFAULT_TENANT_SLUG }],
    },
  });

  if (existing) return existing;

  const tenant = await prisma.tenant.create({
    data: {
      id: DEFAULT_TENANT_ID,
      name: DEFAULT_TENANT_NAME,
      slug: DEFAULT_TENANT_SLUG,
      status: "ACTIVE",
      plan: "free",
      settings: DEFAULT_WORKSPACE_SETTINGS,
    },
  });

  console.log("Default tenant created");
  return tenant;
}

async function seedIncomeCategories(tenantId: string) {
  const existing = await prisma.incomeCategory.findFirst({ where: { tenantId } });
  if (existing) return;

  await prisma.incomeCategory.createMany({
    data: DEFAULT_INCOME_CATEGORIES.map((category) => ({ ...category, tenantId })),
  });
  console.log("income category seeded successfully");
}

async function seedExpenseCategories(tenantId: string) {
  const existing = await prisma.expenseCategory.findFirst({ where: { tenantId } });
  if (existing) return;

  await prisma.expenseCategory.createMany({
    data: DEFAULT_EXPENSE_CATEGORIES.map((category) => ({ ...category, tenantId })),
  });
  console.log("expense category seeded successfully");
}

async function seedAdmin(tenantId: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL env var is required");
  }
  const existingUser = await prisma.user.findFirst({ where: { userEmail: adminEmail } });

  if (existingUser) {
    const adminRole = await prisma.role.findFirst({ where: { roleName: "admin" } });
    if (adminRole) {
      const alreadyLinked = await prisma.userRole.findFirst({
        where: { userId: existingUser.id, roleId: adminRole.id },
      });
      if (!alreadyLinked) {
        await prisma.userRole.create({
          data: { userId: existingUser.id, roleId: adminRole.id },
        });
        console.log("role seeded")
      }
    }
    return;
  }

  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD env var is required");
  }

  const user = await prisma.user.create({
    data: {
      tenantId,
      userName: "admin",
      userEmail: adminEmail,
      userPassword: bcrypt.hashSync(adminPassword, 10),
    },
  });
  const adminRole = await prisma.role.findFirst({ where: { roleName: "admin" } });
  if (!adminRole) {
    throw new Error("admin role is required before seeding the admin user");
  }
  await prisma.userRole.create({
    data: { userId: user.id, roleId: adminRole.id },
  });
}

async function main() {
  try {
    const tenant = await ensureDefaultTenant();
    await seedRoles();
    await seedAdmin(tenant.id);
    await seedIncomeCategories(tenant.id);
    await seedExpenseCategories(tenant.id);
    
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
