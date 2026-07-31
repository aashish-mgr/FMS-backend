import pdfMake from "pdfmake";
import path from "path";
import type { TableCell } from "pdfmake/interfaces";

// Bundled Roboto fonts ship inside the pdfmake package itself — no separate font files needed.
const FONT_DIR = path.join(__dirname, "../../../node_modules/pdfmake/fonts/Roboto");
pdfMake.setUrlAccessPolicy(() => false);

let fontsConfigured = false;
function ensureFontsConfigured() {
  if (fontsConfigured) return;
  pdfMake.setFonts({
    Roboto: {
      normal: path.join(FONT_DIR, "Roboto-Regular.ttf"),
      bold: path.join(FONT_DIR, "Roboto-Medium.ttf"),
      italics: path.join(FONT_DIR, "Roboto-Italic.ttf"),
      bolditalics: path.join(FONT_DIR, "Roboto-MediumItalic.ttf"),
    },
  });
  pdfMake.setLocalAccessPolicy(() => true); // we only read our own bundled font files
  fontsConfigured = true;
}

function formatNPR(amount: number) {
  return `Rs. ${amount.toLocaleString("en-NP", { minimumFractionDigits: 2 })}`;
}

export async function generateIncomeExcelPdf(records: any[], title: string): Promise<Buffer> {
  ensureFontsConfigured();

  const total = records.reduce((sum, r) => sum + Number(r.amount), 0);

  const tableBody = [
    [
      { text: "Date", bold: true },
      { text: "Category", bold: true },
      { text: "Client", bold: true },
      { text: "Payment", bold: true },
      { text: "Amount", bold: true, alignment: "right" },
    ],
    ...records.map((r) => [
      new Date(r.transactionDate).toLocaleDateString(),
      r.incomeCategories.categoryName,
      r.clientName ?? "—",
      r.paymentMethod,
      { text: formatNPR(Number(r.amount)), alignment: "right" },
    ]),
    [
      { text: "TOTAL", bold: true, colSpan: 4 },
      {},
      {},
      {},
      { text: formatNPR(total), bold: true, alignment: "right" },
    ],
  ];

  const pdf = pdfMake.createPdf({
    content: [
      { text: "Digital Pathshala — Finance Management System", style: "header" },
      { text: title, style: "subheader" },
      { text: " ", margin: [0, 8] },
      {
        table: { headerRows: 1, widths: ["auto", "*", "*", "auto", "auto"], body: tableBody },
      },
    ],
    styles: {
      header: { fontSize: 14, bold: true },
      subheader: { fontSize: 11, color: "#475569" },
    },
    defaultStyle: { fontSize: 9 },
  });

  return pdf.getBuffer();
}

export async function generateExpenseExcelPdf(records: any[], title: string): Promise<Buffer> {
  ensureFontsConfigured();

  const total = records.reduce((sum, r) => sum + Number(r.amount), 0);

  const tableBody = [
    [
      { text: "Date", bold: true },
      { text: "Category", bold: true },
      { text: "Vendor", bold: true },
      { text: "Payment", bold: true },
      { text: "Amount", bold: true, alignment: "right" },
    ],
    ...records.map((r) => [
      new Date(r.transactionDate).toLocaleDateString(),
      r.expenseCategories.categoryName,
      r.vendorName ?? "—",
      r.paymentMethod,
      { text: formatNPR(Number(r.amount)), alignment: "right" },
    ]),
    [
      { text: "TOTAL", bold: true, colSpan: 4 },
      {},
      {},
      {},
      { text: formatNPR(total), bold: true, alignment: "right" },
    ],
  ];

  const pdf = pdfMake.createPdf({
    content: [
      { text: "Digital Pathshala — Finance Management System", style: "header" },
      { text: title, style: "subheader" },
      { text: " ", margin: [0, 8] },
      {
        table: { headerRows: 1, widths: ["auto", "*", "*", "auto", "auto"], body: tableBody },
      },
    ],
    styles: {
      header: { fontSize: 14, bold: true },
      subheader: { fontSize: 11, color: "#475569" },
    },
    defaultStyle: { fontSize: 9 },
  });

  return pdf.getBuffer();
}



export async function generateProfitLossPdf(
  report: {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    incomeCount: number;
    expenseCount: number;
  },
  title: string
): Promise<Buffer> {
  ensureFontsConfigured();

  const { totalIncome, totalExpense, netProfit, incomeCount, expenseCount } = report;
  const netColor = netProfit < 0 ? "#dc2626" : "#16a34a";

  const tableBody: TableCell[][] = [
    [
      { text: "Metric", bold: true },
      { text: "Transactions", bold: true, alignment: "right" },
      { text: "Amount", bold: true, alignment: "right" },
    ],
    [
      "Total Income",
      { text: String(incomeCount), alignment: "right" },
      { text: formatNPR(totalIncome), alignment: "right" },
    ],
    [
      "Total Expense",
      { text: String(expenseCount), alignment: "right" },
      { text: formatNPR(totalExpense), alignment: "right" },
    ],
    [
      { text: netProfit < 0 ? "Net Loss" : "Net Profit", bold: true },
      "",
      { text: formatNPR(netProfit), bold: true, alignment: "right", color: netColor },
    ],
  ];

  const pdf = pdfMake.createPdf({
    content: [
      { text: "Digital Pathshala — Finance Management System", style: "header" },
      { text: title, style: "subheader" },
      { text: " ", margin: [0, 8] },
      {
        table: { headerRows: 1, widths: ["*", "auto", "auto"], body: tableBody },
      },
    ],
    styles: {
      header: { fontSize: 14, bold: true },
      subheader: { fontSize: 11, color: "#475569" },
    },
    defaultStyle: { fontSize: 9 },
  });

  return pdf.getBuffer();
}