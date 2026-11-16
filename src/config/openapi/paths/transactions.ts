import type { OpenAPIV3 } from "openapi-types";
import {
  jsonBody,
  permissionDescription,
  protectedErrors,
  schemaRef,
  success,
} from "../helpers";

export const transactionPaths: OpenAPIV3.PathsObject = {
  "/api/income": {
    post: {
      tags: ["Income"],
      summary: "Create income",
      operationId: "createIncome",
      description: permissionDescription(
        "Creates a tenant-scoped income record. `createdBy` is assigned from the authenticated user.",
        "income:create",
      ),
      requestBody: jsonBody(schemaRef("CreateIncomeRequest")),
      responses: {
        "200": success("Income created successfully.", schemaRef("Income")),
        ...protectedErrors,
      },
    },
    get: {
      tags: ["Income"],
      summary: "List income",
      operationId: "listIncome",
      description: permissionDescription(
        "Returns all non-deleted income records for the active workspace. Pagination and filters are not currently implemented.",
        "income:read",
      ),
      responses: {
        "200": success("Fetched income records.", {
          type: "array",
          items: schemaRef("Income"),
        }),
        ...protectedErrors,
      },
    },
  },

  "/api/income/{id}": {
    get: {
      tags: ["Income"],
      summary: "Get income by ID",
      operationId: "getIncome",
      description: permissionDescription(
        "Returns a single non-deleted income record from the active workspace.",
        "income:read",
      ),
      parameters: [{ $ref: "#/components/parameters/Id" }],
      responses: {
        "200": success("Income fetched successfully.", schemaRef("Income")),
        ...protectedErrors,
      },
    },
    patch: {
      tags: ["Income"],
      summary: "Update income",
      operationId: "updateIncome",
      description: permissionDescription(
        "Partially updates an income record. The tenant and `createdBy` values cannot be changed through this endpoint.",
        "income:update",
      ),
      parameters: [{ $ref: "#/components/parameters/Id" }],
      requestBody: jsonBody(schemaRef("UpdateIncomeRequest")),
      responses: {
        "200": success("Income updated successfully.", schemaRef("Income")),
        ...protectedErrors,
      },
    },
    delete: {
      tags: ["Income"],
      summary: "Delete income",
      operationId: "deleteIncome",
      description: permissionDescription(
        "Soft-deletes an income record by setting `deletedAt`. The deleted record is returned.",
        "income:delete",
      ),
      parameters: [{ $ref: "#/components/parameters/Id" }],
      responses: {
        "200": success("Income deleted successfully.", schemaRef("Income")),
        ...protectedErrors,
      },
    },
  },

  "/api/expense": {
    post: {
      tags: ["Expense"],
      summary: "Create expense",
      operationId: "createExpense",
      description: permissionDescription(
        "Creates a tenant-scoped expense record. `createdBy` is assigned from the authenticated user.",
        "expense:create",
      ),
      requestBody: jsonBody(schemaRef("CreateExpenseRequest")),
      responses: {
        "200": success("Expense created successfully.", schemaRef("Expense")),
        ...protectedErrors,
      },
    },
    get: {
      tags: ["Expense"],
      summary: "List expenses",
      operationId: "listExpenses",
      description: permissionDescription(
        "Returns all non-deleted expense records for the active workspace. Pagination and filters are not currently implemented.",
        "expense:read",
      ),
      responses: {
        "200": success("Fetched expense records.", {
          type: "array",
          items: schemaRef("Expense"),
        }),
        ...protectedErrors,
      },
    },
  },

  "/api/expense/{id}": {
    get: {
      tags: ["Expense"],
      summary: "Get expense by ID",
      operationId: "getExpense",
      description: permissionDescription(
        "Returns a single non-deleted expense record from the active workspace.",
        "expense:read",
      ),
      parameters: [{ $ref: "#/components/parameters/Id" }],
      responses: {
        "200": success("Expense fetched successfully.", schemaRef("Expense")),
        ...protectedErrors,
      },
    },
    patch: {
      tags: ["Expense"],
      summary: "Update expense",
      operationId: "updateExpense",
      description: permissionDescription(
        "Partially updates an expense record. The tenant and `createdBy` values cannot be changed through this endpoint.",
        "expense:update",
      ),
      parameters: [{ $ref: "#/components/parameters/Id" }],
      requestBody: jsonBody(schemaRef("UpdateExpenseRequest")),
      responses: {
        "200": success("Expense updated successfully.", schemaRef("Expense")),
        ...protectedErrors,
      },
    },
    delete: {
      tags: ["Expense"],
      summary: "Delete expense",
      operationId: "deleteExpense",
      description: permissionDescription(
        "Soft-deletes an expense record by setting `deletedAt`. The deleted record is returned.",
        "expense:delete",
      ),
      parameters: [{ $ref: "#/components/parameters/Id" }],
      responses: {
        "200": success("Expense deleted successfully.", schemaRef("Expense")),
        ...protectedErrors,
      },
    },
  },

  "/api/category/income": {
    get: {
      tags: ["Categories"],
      summary: "List income categories",
      operationId: "listIncomeCategories",
      description: permissionDescription(
        "Returns the income categories owned by the active workspace.",
        "category:read",
      ),
      responses: {
        "200": success("Income category fetched successfully.", {
          type: "array",
          items: schemaRef("IncomeCategory"),
        }),
        ...protectedErrors,
      },
    },
  },

  "/api/category/expense": {
    get: {
      tags: ["Categories"],
      summary: "List expense categories",
      operationId: "listExpenseCategories",
      description: permissionDescription(
        "Returns the expense categories owned by the active workspace.",
        "category:read",
      ),
      responses: {
        "200": success("Expense category fetched successfully.", {
          type: "array",
          items: schemaRef("ExpenseCategory"),
        }),
        ...protectedErrors,
      },
    },
  },
};
