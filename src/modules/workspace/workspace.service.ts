import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { DEFAULT_WORKSPACE_SETTINGS } from "../../config/constants";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from "../../config/defaultCategories";
import { httpError } from "../../utils/httpError";
import type { UpdateWorkspaceInput } from "./workspace.validation";

export interface ProvisionWorkspaceInput {
  workspaceName: string;
  userName: string;
  userEmail: string;
  userPassword: string;
}

function slugify(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
    .replace(/-+$/g, "");

  return slug || "workspace";
}

async function generateUniqueSlug(tx: Prisma.TransactionClient, workspaceName: string) {
  const base = slugify(workspaceName);
  let candidate = base;
  let suffix = 1;

  while (await tx.tenant.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    suffix += 1;
    const suffixText = `-${suffix}`;
    candidate = `${base.slice(0, 100 - suffixText.length).replace(/-+$/g, "")}${suffixText}`;
  }

  return candidate;
}

function isUniqueConstraintError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function getConstraintTarget(error: Prisma.PrismaClientKnownRequestError) {
  const target = error.meta?.target;
  return Array.isArray(target) ? target.join(",") : String(target ?? "");
}

class WorkspaceService {
  async provisionWorkspace(input: ProvisionWorkspaceInput) {
    const existingUser = await prisma.user.findFirst({
      where: { userEmail: input.userEmail },
      select: { id: true },
    });

    if (existingUser) {
      throw httpError("an account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(input.userPassword, 10);

    try {
      return await prisma.$transaction(async (tx) => {
        const slug = await generateUniqueSlug(tx, input.workspaceName);

        const tenant = await tx.tenant.create({
          data: {
            name: input.workspaceName,
            slug,
            status: "ACTIVE",
            plan: "free",
            settings: DEFAULT_WORKSPACE_SETTINGS,
          },
        });

        const user = await tx.user.create({
          data: {
            tenantId: tenant.id,
            userName: input.userName,
            userEmail: input.userEmail,
            userPassword: passwordHash,
          },
        });

        let adminRole = await tx.role.findFirst({ where: { roleName: "admin" } });
        if (!adminRole) {
          adminRole = await tx.role.create({ data: { roleName: "admin" } });
        }

        await tx.userRole.create({
          data: { userId: user.id, roleId: adminRole.id },
        });

        await tx.incomeCategory.createMany({
          data: DEFAULT_INCOME_CATEGORIES.map((category) => ({
            ...category,
            tenantId: tenant.id,
          })),
        });

        await tx.expenseCategory.createMany({
          data: DEFAULT_EXPENSE_CATEGORIES.map((category) => ({
            ...category,
            tenantId: tenant.id,
          })),
        });

        return { tenant, userId: user.id };
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        if (getConstraintTarget(error).toLowerCase().includes("useremail")) {
          throw httpError("an account with this email already exists", 409);
        }

        throw httpError("that workspace name is already taken", 409);
      }

      throw error;
    }
  }

  async getWorkspace(tenantId: string) {
    const workspace = await prisma.tenant.findFirst({
      where: { id: tenantId, deletedAt: null },
    });

    if (!workspace) {
      throw httpError("workspace not found", 404);
    }

    return workspace;
  }

  async updateWorkspace(tenantId: string, input: UpdateWorkspaceInput) {
    const workspace = await this.getWorkspace(tenantId);
    const data: Prisma.TenantUpdateInput = {};

    if (input.name !== undefined) {
      data.name = input.name;
    }

    if (input.settings !== undefined) {
      const currentSettings =
        workspace.settings && typeof workspace.settings === "object" && !Array.isArray(workspace.settings)
          ? (workspace.settings as Record<string, unknown>)
          : {};

      data.settings = {
        ...currentSettings,
        ...input.settings,
      } as Prisma.InputJsonValue;
    }

    return prisma.tenant.update({
      where: { id: workspace.id },
      data,
    });
  }
}

export default new WorkspaceService();
