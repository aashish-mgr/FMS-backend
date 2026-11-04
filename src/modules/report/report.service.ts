import { prisma } from "../../config/database";

interface ReportFilters {
  from?: string;
  to?: string;
  categoryId?: string;
  paymentMethod?: string;
}

export async function getWorkspaceName(tenantId: string) {
  const tenant = await prisma.tenant.findFirst({
    where: { id: tenantId, deletedAt: null },
    select: { name: true },
  });

  return tenant?.name ?? "Workspace";
}

export async function getIncomeReport(tenantId: string, filters: ReportFilters) {
  const where: any = { tenantId, deletedAt: null };
  if (filters.from || filters.to) {
    where.transactionDate = {};
    if (filters.from) where.transactionDate.gte = new Date(filters.from);
    if (filters.to) where.transactionDate.lte = new Date(filters.to);
  }
  if (filters.categoryId) where.incomeCategoryId = filters.categoryId;
  if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;

  return prisma.income.findMany({
    where,
    include: { incomeCategories: true },
    orderBy: { transactionDate: "asc" },
  });
}

export async function getExpenseReport(tenantId: string, filters: ReportFilters) {
  const where: any = { tenantId, deletedAt: null };
  if (filters.from || filters.to) {
    where.transactionDate = {};
    if (filters.from) where.transactionDate.gte = new Date(filters.from);
    if (filters.to) where.transactionDate.lte = new Date(filters.to);
  }
  if (filters.categoryId) where.expenseCategoryId = filters.categoryId;
  if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;

  return prisma.expense.findMany({
    where,
    include: { expenseCategories: true },
    orderBy: { transactionDate: "asc" },
  });
}

export async function getProfitLossReport(tenantId: string, filters: ReportFilters) {
  const [incomes, expenses] = await Promise.all([
    getIncomeReport(tenantId, filters),
    getExpenseReport(tenantId, filters),
  ]);

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return {
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
    incomeCount: incomes.length,
    expenseCount: expenses.length,
  };
}
