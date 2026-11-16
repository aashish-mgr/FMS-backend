import type { OpenAPIV3 } from "openapi-types";
import {
  permissionDescription,
  protectedErrors,
  reportResponse,
  schemaRef,
  success,
} from "../helpers";

export const analyticsPaths: OpenAPIV3.PathsObject = {
  "/api/dashboard/kpis": {
    get: {
      tags: ["Dashboard"],
      summary: "Get dashboard KPIs",
      operationId: "getDashboardKpis",
      description: permissionDescription(
        "Returns income, expense, and profit totals for today, the current week, the current month, and the current year.",
        "dashboard:read",
      ),
      responses: {
        "200": success("Kpi fetched successfully.", schemaRef("DashboardKpis")),
        ...protectedErrors,
      },
    },
  },

  "/api/dashboard/income-expense-chart": {
    get: {
      tags: ["Dashboard"],
      summary: "Get the income and expense chart",
      operationId: "getIncomeExpenseChart",
      description: permissionDescription(
        "Returns income, expense, and profit buckets for the selected period.",
        "dashboard:read",
      ),
      parameters: [{ $ref: "#/components/parameters/Period" }],
      responses: {
        "200": success("Chart data fetched successfully.", {
          type: "array",
          items: schemaRef("IncomeExpenseChartPoint"),
        }),
        ...protectedErrors,
      },
    },
  },

  "/api/dashboard/income-by-category/{from}/{to}": {
    get: {
      tags: ["Dashboard"],
      summary: "Get income by category",
      operationId: "getIncomeByCategory",
      description: permissionDescription(
        "Returns income totals grouped by category for the inclusive date range.",
        "dashboard:read",
      ),
      parameters: [
        { $ref: "#/components/parameters/FromDate" },
        { $ref: "#/components/parameters/ToDate" },
      ],
      responses: {
        "200": success("Income by category fetched successfully.", {
          type: "array",
          items: schemaRef("CategoryBreakdown"),
        }),
        ...protectedErrors,
      },
    },
  },

  "/api/dashboard/expense-by-category/{from}/{to}": {
    get: {
      tags: ["Dashboard"],
      summary: "Get expense by category",
      operationId: "getExpenseByCategory",
      description: permissionDescription(
        "Returns expense totals grouped by category for the inclusive date range.",
        "dashboard:read",
      ),
      parameters: [
        { $ref: "#/components/parameters/FromDate" },
        { $ref: "#/components/parameters/ToDate" },
      ],
      responses: {
        "200": success("Expense by category fetched successfully.", {
          type: "array",
          items: schemaRef("CategoryBreakdown"),
        }),
        ...protectedErrors,
      },
    },
  },

  "/api/dashboard/cash-flow/{year}": {
    get: {
      tags: ["Dashboard"],
      summary: "Get monthly cash flow",
      operationId: "getMonthlyCashFlow",
      description: permissionDescription(
        "Returns one row per month for the requested year, including income, expense, and profit.",
        "dashboard:read",
      ),
      parameters: [{ $ref: "#/components/parameters/Year" }],
      responses: {
        "200": success("cash flow fetched successfully.", {
          type: "array",
          items: schemaRef("CashFlowMonth"),
        }),
        ...protectedErrors,
      },
    },
  },

  "/api/dashboard/recent-transactions": {
    get: {
      tags: ["Dashboard"],
      summary: "Get recent transactions",
      operationId: "getRecentTransactions",
      description: permissionDescription(
        "Returns the 20 most recent income and expense records merged into a single activity feed.",
        "dashboard:read",
      ),
      responses: {
        "200": success("recent transactions fetched successfully.", {
          type: "array",
          items: schemaRef("RecentTransaction"),
        }),
        ...protectedErrors,
      },
    },
  },

  "/api/dashboard/upcoming-reminders": {
    get: {
      tags: ["Dashboard"],
      summary: "Get upcoming reminders",
      operationId: "getUpcomingReminders",
      description: permissionDescription(
        "Returns upcoming, non-completed reminders for the active workspace.",
        "dashboard:read",
      ),
      responses: {
        "200": success("reminders fetched successfully.", {
          type: "array",
          items: schemaRef("Reminder"),
        }),
        ...protectedErrors,
      },
    },
  },

  "/api/report/income": {
    get: {
      tags: ["Reports"],
      summary: "Generate an income report",
      operationId: "getIncomeReport",
      description: permissionDescription(
        "Returns income records with their categories. Set `format` to `pdf`, `excel`, or `csv` to download a file instead of JSON.",
        "report:read",
      ),
      parameters: [
        { $ref: "#/components/parameters/From" },
        { $ref: "#/components/parameters/To" },
        { $ref: "#/components/parameters/CategoryId" },
        { $ref: "#/components/parameters/PaymentMethod" },
        { $ref: "#/components/parameters/Format" },
      ],
      responses: {
        "200": reportResponse("Income report.", {
          type: "array",
          items: schemaRef("IncomeWithCategory"),
        }),
        ...protectedErrors,
      },
    },
  },

  "/api/report/expense": {
    get: {
      tags: ["Reports"],
      summary: "Generate an expense report",
      operationId: "getExpenseReport",
      description: permissionDescription(
        "Returns expense records with their categories. Set `format` to `pdf`, `excel`, or `csv` to download a file instead of JSON.",
        "report:read",
      ),
      parameters: [
        { $ref: "#/components/parameters/From" },
        { $ref: "#/components/parameters/To" },
        { $ref: "#/components/parameters/CategoryId" },
        { $ref: "#/components/parameters/PaymentMethod" },
        { $ref: "#/components/parameters/Format" },
      ],
      responses: {
        "200": reportResponse("Expense report.", {
          type: "array",
          items: schemaRef("ExpenseWithCategory"),
        }),
        ...protectedErrors,
      },
    },
  },

  "/api/report/profit-loss": {
    get: {
      tags: ["Reports"],
      summary: "Generate a profit and loss report",
      operationId: "getProfitLossReport",
      description: permissionDescription(
        "Returns total income, total expense, net profit, and transaction counts. Set `format` to `pdf`, `excel`, or `csv` to download a file instead of JSON.",
        "report:read",
      ),
      parameters: [
        { $ref: "#/components/parameters/From" },
        { $ref: "#/components/parameters/To" },
        { $ref: "#/components/parameters/Format" },
      ],
      responses: {
        "200": reportResponse(
          "Profit and loss report.",
          schemaRef("ProfitLossReport"),
        ),
        ...protectedErrors,
      },
    },
  },
};
