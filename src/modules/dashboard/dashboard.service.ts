import { prisma } from "../../config/database";
import dayjs from "dayjs";
import {
  startOfMonth,
  startOfToday,
  startOfWeek,
  startOfYear,
  DateRange,
  rangeFrom,
} from "../../utils/dateHelpers";

const PRIORITY_RANK: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

 type Period = "daily" | "weekly" | "monthly" | "yearly";

function bucketKey(date: Date, period: Period): string {
  const d = dayjs(date);
  switch (period) {
    case "daily":
      return d.format("YYYY-MM-DD");
    case "weekly":
      return d.startOf("week").format("YYYY-MM-DD");
    case "monthly":
      return d.format("YYYY-MM"); 
    case "yearly":
      return d.format("YYYY");
  }
}

function bucketLabel(key: string, period: Period, weekIndex: number): string {
  switch (period) {
    case 'daily': return dayjs(key).format('ddd');           // Sun, Mon, Tue...
    case 'weekly': return `Wk ${weekIndex}`;                  // Wk 1, Wk 2...
    case 'monthly': return dayjs(`${key}-01`).format('MMM');  // Jan, Feb...
    case 'yearly': return key;                                // 2025, 2026...
  }
}

class DashboardService {
  async sumOfIncome(range: DateRange) {
    const result = await prisma.income.aggregate({
      where: {
        deletedAt: null,
        transactionDate: { gte: range.gte, lte: range.lte },
      },
      _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
  }

  async sumOfExpense(range: DateRange) {
    const result = await prisma.expense.aggregate({
      where: {
        deletedAt: null,
        transactionDate: { gte: range.gte, lte: range.lte },
      },
      _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
  }

  async periodKpis(range: DateRange) {
    const [income, expense] = await Promise.all([
      this.sumOfIncome(range),
      this.sumOfExpense(range),
    ]);
    return { income, expense, profit: income - expense };
  }

  async getAllKpis() {
    const [today, week, month, year] = await Promise.all([
      this.periodKpis(rangeFrom(startOfToday())),
      this.periodKpis(rangeFrom(startOfWeek())),
      this.periodKpis(rangeFrom(startOfMonth())),
      this.periodKpis(rangeFrom(startOfYear())),
    ]);

    return { today, week, month, year };
  }

  async getIncomeExpenseChart(period: Period) {
    const [incomeRows, expenseRows] = await Promise.all([
      prisma.income.findMany({
        where: { deletedAt: null },
        select: { transactionDate: true, amount: true },
      }),
      prisma.expense.findMany({
        where: { deletedAt: null },
        select: { transactionDate: true, amount: true },
      }),
    ]);

    const buckets = new Map<string, { income: number; expense: number }>();

    for (const row of incomeRows) {
      const key = bucketKey(row.transactionDate, period);
      const entry = buckets.get(key) ?? { income: 0, expense: 0 };
      entry.income += Number(row.amount);
      buckets.set(key, entry);
    }

    for (const row of expenseRows) {
      const key = bucketKey(row.transactionDate, period);
      const entry = buckets.get(key) ?? { income: 0, expense: 0 };
      entry.expense += Number(row.amount);
      buckets.set(key, entry);
    }

    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([bucket, { income, expense }], index) => ({
        bucket,
        label: bucketLabel(bucket, period, index + 1),
        income,
        expense,
        profit: income - expense,
      }));
  }

  async getIncomeByCategory(from: Date, to: Date) {
    const rows = await prisma.income.groupBy({
      by: ["incomeCategoryId"],
      where: { deletedAt: null, transactionDate: { gte: from, lte: to } },
      _sum: { amount: true },
    });

    const categories = await prisma.incomeCategory.findMany({
      where: { id: { in: rows.map((r) => r.incomeCategoryId) } },
    });

    const total = rows.reduce((sum, r) => sum + Number(r._sum.amount ?? 0), 0);

    return rows.map((r) => {
      const amount = Number(r._sum.amount ?? 0);
      return {
        categoryId: r.incomeCategoryId,
        categoryName:
          categories.find((c) => c.id === r.incomeCategoryId)?.categoryName ??
          "Unknown",
        amount,
        percentage: total > 0 ? Number(((amount / total) * 100).toFixed(2)) : 0,
      };
    });
  }

  async getExpenseByCategory(from: Date, to: Date) {
    const rows = await prisma.expense.groupBy({
      by: ["expenseCategoryId"],
      where: { deletedAt: null, transactionDate: { gte: from, lte: to } },
      _sum: { amount: true },
    });

    const categories = await prisma.expenseCategory.findMany({
      where: { id: { in: rows.map((r) => r.expenseCategoryId) } },
    });

    const total = rows.reduce((sum, r) => sum + Number(r._sum.amount ?? 0), 0);

    return rows.map((r) => {
      const amount = Number(r._sum.amount ?? 0);
      return {
        categoryId: r.expenseCategoryId,
        categoryName:
          categories.find((c) => c.id === r.expenseCategoryId)?.categoryName ??
          "Unknown",
        amount,
        percentage: total > 0 ? Number(((amount / total) * 100).toFixed(2)) : 0,
      };
    });
  }

  async getMonthlyCashFlow(year: number) {
    const start = new Date(`${year}-01-01T00:00:00Z`);
    const end = new Date(`${year}-12-31T23:59:59Z`);

    const [incomeRows, expenseRows] = await Promise.all([
      prisma.income.findMany({
        where: { deletedAt: null, transactionDate: { gte: start, lte: end } },
        select: { transactionDate: true, amount: true },
      }),
      prisma.expense.findMany({
        where: { deletedAt: null, transactionDate: { gte: start, lte: end } },
        select: { transactionDate: true, amount: true },
      }),
    ]);

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      label: dayjs(`${year}-${i + 1}-01`).format('MMM'),
      income: 0,
      expense: 0,
    }));

    for (const row of incomeRows) {
      const monthIndex = dayjs(row.transactionDate).month();
      const month = months[monthIndex];
      if (month) {
        month.income += Number(row.amount);
      }
    }
    for (const row of expenseRows) {
      const monthIndex = dayjs(row.transactionDate).month();
      const month = months[monthIndex];
      if (month) {
        month.expense += Number(row.amount);
      }
    }

    return months.map((m) => ({ ...m, profit: m.income - m.expense }));
  }

  async getRecentTransactions() {
    const [income, expense] = await Promise.all([
      prisma.income.findMany({
        where: { deletedAt: null },
        orderBy: { transactionDate: "desc" },
        include: { incomeCategories: true },
        take: 20,
      }),
      prisma.expense.findMany({
        where: { deletedAt: null },
        orderBy: { transactionDate: "desc" },
        include: { expenseCategories: true },
        take: 20,
      }),
    ]);

    const merged = [
      ...income.map((i) => ({
        type: "income" as const,
        id: i.id,
        date: i.transactionDate,
        amount: Number(i.amount),
        party: i.clientName ?? i.incomeSource,
        category: i.incomeCategories.categoryName,
      })),
      ...expense.map((e) => ({
        type: "expense" as const,
        id: e.id,
        date: e.transactionDate,
        amount: Number(e.amount),
        party: e.vendorName,
        category: e.expenseCategories.categoryName,
      })),
    ];

    return merged
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 20);
  }

  

 async  getUpcomingReminders() {
  const now = new Date();
  const in7Days = dayjs().add(7, 'day').endOf('day').toDate();

  const reminders = await prisma.remainder.findMany({
    where: { status: 'PENDING', deletedAt: null, remainderDate: { gte: now, lte: in7Days } },
  });

  return reminders.sort((a, b) => {
    const byDate = a.remainderDate.getTime() - b.remainderDate.getTime();
    return byDate !== 0 ? byDate : (PRIORITY_RANK[a.priority] ?? 0) - (PRIORITY_RANK[b.priority] ?? 0);
  });
}
}

export default new DashboardService();
