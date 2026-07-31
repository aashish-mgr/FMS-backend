 import { stringify } from "csv-stringify/sync";

export function generateIncomeCsv(records: any[]): string {
  return stringify(
    records.map((r) => ({
      Date: new Date(r.transactionDate).toISOString().slice(0, 10),
      Category: r.incomeCategories.categoryName,
      Client: r.clientName ?? "",
      "Payment Method": r.paymentMethod,
      Amount: Number(r.amount).toFixed(2),
    })),
    { header: true }
  );
}

export function generateExpenseCsv(records: any[]): string {
  return stringify(
    records.map((r) => ({
      Date: new Date(r.expenseDate).toISOString().slice(0, 10),
      Category: r.category.name,
      Vendor: r.vendorName ?? "",
      "Payment Method": r.paymentMethod,
      Amount: Number(r.amount).toFixed(2),
    })),
    { header: true }
  );
}

export function generateProfitLossCsv(report: {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  incomeCount: number;
  expenseCount: number;
}): string {
  const { totalIncome, totalExpense, netProfit, incomeCount, expenseCount } = report;

  return stringify(
    [
      { Metric: "Total Income", Transactions: incomeCount, Amount: totalIncome.toFixed(2) },
      { Metric: "Total Expense", Transactions: expenseCount, Amount: totalExpense.toFixed(2) },
      {
        Metric: netProfit < 0 ? "Net Loss" : "Net Profit",
        Transactions: "",
        Amount: netProfit.toFixed(2),
      },
    ],
    { header: true }
  );
}