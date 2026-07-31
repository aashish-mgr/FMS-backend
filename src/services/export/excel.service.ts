import ExcelJS from "exceljs";

export async function generateIncomeExcel(records: any[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Income");

  sheet.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Category", key: "category", width: 24 },
    { header: "Client", key: "client", width: 24 },
    { header: "Payment Method", key: "paymentMethod", width: 18 },
    { header: "Amount (NPR)", key: "amount", width: 16 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const r of records) {
    sheet.addRow({
      date: new Date(r.transactionDate).toLocaleDateString(),
      category: r.incomeCategories.categoryName,
      client: r.clientName ?? "",
      paymentMethod: r.paymentMethod,
      amount: Number(r.amount),
    });
  }

  const total = records.reduce((sum, r) => sum + Number(r.amount), 0);
  const totalRow = sheet.addRow({ category: "TOTAL", amount: total });
  totalRow.font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function generateExpenseExcel(records: any[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Expense");

  sheet.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Category", key: "category", width: 24 },
    { header: "Vendor", key: "vendor", width: 24 },
    { header: "Payment Method", key: "paymentMethod", width: 18 },
    { header: "Amount (NPR)", key: "amount", width: 16 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const r of records) {
    sheet.addRow({
      date: new Date(r.expenseDate).toLocaleDateString(),
      category: r.category.name,
      vendor: r.vendorName ?? "",
      paymentMethod: r.paymentMethod,
      amount: Number(r.amount),
    });
  }

  const total = records.reduce((sum, r) => sum + Number(r.amount), 0);
  const totalRow = sheet.addRow({ category: "TOTAL", amount: total });
  totalRow.font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function generateProfitLossExcel(report: {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  incomeCount: number;
  expenseCount: number;
}): Promise<Buffer> {
  const { totalIncome, totalExpense, netProfit, incomeCount, expenseCount } = report;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Profit & Loss");

  sheet.columns = [
    { header: "Metric", key: "metric", width: 20 },
    { header: "Transactions", key: "transactions", width: 16 },
    { header: "Amount (NPR)", key: "amount", width: 18 },
  ];
  sheet.getRow(1).font = { bold: true };

  sheet.addRow({ metric: "Total Income", transactions: incomeCount, amount: totalIncome });
  sheet.addRow({ metric: "Total Expense", transactions: expenseCount, amount: totalExpense });

  const netRow = sheet.addRow({
    metric: netProfit < 0 ? "Net Loss" : "Net Profit",
    transactions: "",
    amount: netProfit,
  });
  netRow.font = {
    bold: true,
    color: { argb: netProfit < 0 ? "FFDC2626" : "FF16A34A" },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}