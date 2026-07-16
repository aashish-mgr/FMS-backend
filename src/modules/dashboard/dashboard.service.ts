import { resourceLimits } from "node:worker_threads";
import { prisma } from "../../config/database";
import {
  startOfMonth,
  startOfToday,
  startOfWeek,
  startOfYear,
  DateRange,
  rangeFrom,
} from "../../utils/dateHelpers";

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

    return {today,week,month,year}
  }
}
