import type { OpenAPIV3 } from "openapi-types";
import { param, uuidPathParam } from "./helpers";

const uuid: OpenAPIV3.SchemaObject = { type: "string", format: "uuid" };
const dateTime: OpenAPIV3.SchemaObject = { type: "string", format: "date-time" };
const nullableDateTime: OpenAPIV3.SchemaObject = {
  type: "string",
  format: "date-time",
  nullable: true,
};
const nullableString: OpenAPIV3.SchemaObject = { type: "string", nullable: true };
const nullableUuid: OpenAPIV3.SchemaObject = {
  type: "string",
  format: "uuid",
  nullable: true,
};
const nullableJson: OpenAPIV3.SchemaObject = {
  type: "object",
  additionalProperties: true,
  nullable: true,
};
const money: OpenAPIV3.SchemaObject = {
  oneOf: [
    { type: "number", format: "double" },
    { type: "string", example: "1500.00" },
  ],
  description:
    "Monetary value. Prisma Decimal values may be serialized as strings by some endpoints.",
};

const paymentMethods = [
  "Cash",
  "Bank Transfer",
  "Cheque",
  "Esewa",
  "Khalti",
  "Other",
] as const;

const incomeProperties: Record<string, OpenAPIV3.SchemaObject> = {
  transactionDate: dateTime,
  amount: money,
  incomeCategoryId: uuid,
  paymentMethod: { type: "string", enum: [...paymentMethods] },
  incomeSource: nullableString,
  clientName: nullableString,
  referenceNumber: nullableString,
  invoiceNumber: nullableString,
  description: nullableString,
};

const expenseProperties: Record<string, OpenAPIV3.SchemaObject> = {
  transactionDate: dateTime,
  amount: money,
  expenseCategoryId: uuid,
  paymentMethod: { type: "string", enum: [...paymentMethods] },
  vendorName: nullableString,
  billNumber: nullableString,
  description: nullableString,
};

const noteProperties: Record<string, OpenAPIV3.SchemaObject> = {
  title: { type: "string", minLength: 1, maxLength: 255 },
  description: { type: "string", minLength: 1 },
  colorLabel: nullableString,
  isPinned: { type: "boolean", default: false },
  isArchived: { type: "boolean", default: false },
};

const reminderProperties: Record<string, OpenAPIV3.SchemaObject> = {
  title: { type: "string", minLength: 1, maxLength: 255 },
  description: { type: "string", minLength: 1 },
  remainderDate: dateTime,
  remainderTime: {
    type: "string",
    nullable: true,
    example: "09:30:00",
    description: "Time of day in HH:mm:ss format.",
  },
  priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
  status: {
    type: "string",
    enum: ["PENDING", "COMPLETED"],
    default: "COMPLETED",
    description: "The current validation schema defaults this to COMPLETED when omitted.",
  },
  repeat: {
    type: "string",
    enum: ["NONE", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
    default: "NONE",
  },
};

export const securitySchemes: Record<string, OpenAPIV3.SecuritySchemeObject> = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description:
      "Access token returned by login, register, refresh, or accept-invitation. Send it as `Authorization: Bearer <token>`.",
  },
  cookieAuth: {
    type: "apiKey",
    in: "cookie",
    name: "refreshToken",
    description:
      "HttpOnly refresh token cookie set by login, register, accept-invitation, and refresh. Used only by POST /api/auth/refresh.",
  },
};

export const schemas: Record<
  string,
  OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
> = {
  Money: money,

  TenantStatus: {
    type: "string",
    enum: ["TRIAL", "ACTIVE", "SUSPENDED", "CANCELLED"],
  },

  RoleName: {
    type: "string",
    enum: ["admin", "superAdmin", "accountant"],
  },

  AssignableRole: {
    type: "string",
    enum: ["admin", "accountant"],
    description: "superAdmin is platform-level and cannot be assigned through workspace APIs.",
  },

  InvitationStatus: {
    type: "string",
    enum: ["PENDING", "ACCEPTED", "REVOKED", "EXPIRED"],
  },

  PaymentMethod: {
    type: "string",
    enum: [...paymentMethods],
  },

  ReminderPriority: {
    type: "string",
    enum: ["LOW", "MEDIUM", "HIGH"],
  },

  ReminderStatus: {
    type: "string",
    enum: ["PENDING", "COMPLETED"],
  },

  ReminderRepeat: {
    type: "string",
    enum: ["NONE", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
  },

  ReportFormat: {
    type: "string",
    enum: ["json", "pdf", "excel", "csv"],
    default: "json",
  },

  PaginationMeta: {
    type: "object",
    required: ["page", "limit", "total", "totalPages"],
    properties: {
      page: { type: "integer", minimum: 1 },
      limit: { type: "integer", minimum: 1, maximum: 100 },
      total: { type: "integer", minimum: 0 },
      totalPages: { type: "integer", minimum: 0 },
    },
  },

  ApiError: {
    type: "object",
    required: ["success", "message"],
    properties: {
      success: { type: "boolean", enum: [false] },
      message: { type: "string" },
      details: nullableJson,
    },
  },

  WorkspaceSettings: {
    type: "object",
    additionalProperties: false,
    properties: {
      currency: { type: "string", example: "NPR" },
      timezone: { type: "string", example: "Asia/Kathmandu" },
    },
  },

  Tenant: {
    type: "object",
    required: [
      "id",
      "name",
      "slug",
      "status",
      "plan",
      "createdAt",
      "updatedAt",
    ],
    properties: {
      id: uuid,
      name: { type: "string", maxLength: 255 },
      slug: { type: "string", maxLength: 100 },
      status: { $ref: "#/components/schemas/TenantStatus" },
      plan: { type: "string", example: "free" },
      trialEndsAt: nullableDateTime,
      settings: {
        allOf: [{ $ref: "#/components/schemas/WorkspaceSettings" }],
        nullable: true,
      },
      createdAt: dateTime,
      updatedAt: dateTime,
      deletedAt: nullableDateTime,
    },
  },

  User: {
    type: "object",
    required: ["id", "tenantId", "userName", "userEmail", "createdAt", "updatedAt"],
    properties: {
      id: uuid,
      tenantId: uuid,
      userName: { type: "string", maxLength: 255 },
      userEmail: { type: "string", format: "email" },
      emailVerifiedAt: nullableDateTime,
      createdAt: dateTime,
      updatedAt: dateTime,
      deletedAt: nullableDateTime,
    },
  },

  AuthUser: {
    allOf: [
      { $ref: "#/components/schemas/User" },
      {
        type: "object",
        required: ["roles", "role"],
        properties: {
          roles: {
            type: "array",
            items: { $ref: "#/components/schemas/RoleName" },
          },
          role: {
            allOf: [{ $ref: "#/components/schemas/RoleName" }],
            nullable: true,
          },
        },
      },
    ],
  },

  AuthSession: {
    type: "object",
    required: ["accessToken", "user", "tenant"],
    properties: {
      accessToken: { type: "string", description: "JWT access token." },
      user: { $ref: "#/components/schemas/AuthUser" },
      tenant: { $ref: "#/components/schemas/Tenant" },
    },
  },

  Member: {
    type: "object",
    required: ["id", "userName", "userEmail", "roles", "createdAt"],
    properties: {
      id: uuid,
      userName: { type: "string" },
      userEmail: { type: "string", format: "email" },
      roles: {
        type: "array",
        items: { $ref: "#/components/schemas/RoleName" },
      },
      createdAt: dateTime,
    },
  },

  Invitation: {
    type: "object",
    required: ["id", "email", "role", "status", "expiresAt", "createdAt"],
    properties: {
      id: uuid,
      email: { type: "string", format: "email" },
      role: { $ref: "#/components/schemas/AssignableRole" },
      status: { $ref: "#/components/schemas/InvitationStatus" },
      expiresAt: dateTime,
      acceptedAt: nullableDateTime,
      createdAt: dateTime,
      invitedBy: {
        type: "object",
        nullable: true,
        required: ["id", "userName"],
        properties: {
          id: uuid,
          userName: { type: "string" },
        },
      },
    },
  },

  InvitationCreated: {
    allOf: [
      { $ref: "#/components/schemas/Invitation" },
      {
        type: "object",
        required: ["token", "acceptUrl", "emailSent"],
        properties: {
          token: {
            type: "string",
            description: "Raw invitation token. Returned only once at creation or resend.",
          },
          acceptUrl: { type: "string", format: "uri" },
          emailSent: { type: "boolean" },
        },
      },
    ],
  },

  InvitationPreview: {
    type: "object",
    required: ["email", "workspace", "role", "expiresAt"],
    properties: {
      email: { type: "string", format: "email" },
      workspace: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: uuid,
          name: { type: "string" },
        },
      },
      role: { $ref: "#/components/schemas/AssignableRole" },
      expiresAt: dateTime,
    },
  },

  IncomeCategory: {
    type: "object",
    required: [
      "id",
      "tenantId",
      "categoryName",
      "categoryDescription",
      "createdAt",
      "updatedAt",
    ],
    properties: {
      id: uuid,
      tenantId: uuid,
      categoryName: { type: "string", maxLength: 255 },
      categoryDescription: { type: "string", maxLength: 255 },
      createdAt: dateTime,
      updatedAt: dateTime,
      deletedAt: nullableDateTime,
    },
  },

  ExpenseCategory: {
    type: "object",
    required: [
      "id",
      "tenantId",
      "categoryName",
      "categoryDescription",
      "createdAt",
      "updatedAt",
    ],
    properties: {
      id: uuid,
      tenantId: uuid,
      categoryName: { type: "string", maxLength: 255 },
      categoryDescription: { type: "string", maxLength: 255 },
      createdAt: dateTime,
      updatedAt: dateTime,
      deletedAt: nullableDateTime,
    },
  },

  Income: {
    type: "object",
    required: [
      "id",
      "tenantId",
      "transactionDate",
      "amount",
      "incomeCategoryId",
      "paymentMethod",
      "createdAt",
      "updatedAt",
    ],
    properties: {
      id: uuid,
      tenantId: uuid,
      transactionDate: dateTime,
      amount: money,
      incomeCategoryId: uuid,
      incomeSource: nullableString,
      clientName: nullableString,
      paymentMethod: { $ref: "#/components/schemas/PaymentMethod" },
      referenceNumber: nullableString,
      invoiceNumber: nullableString,
      description: nullableString,
      createdBy: nullableUuid,
      updatedBy: nullableUuid,
      createdAt: dateTime,
      updatedAt: dateTime,
      deletedAt: nullableDateTime,
    },
  },

  IncomeWithCategory: {
    allOf: [
      { $ref: "#/components/schemas/Income" },
      {
        type: "object",
        properties: {
          incomeCategories: { $ref: "#/components/schemas/IncomeCategory" },
        },
      },
    ],
  },

  Expense: {
    type: "object",
    required: [
      "id",
      "tenantId",
      "transactionDate",
      "amount",
      "expenseCategoryId",
      "paymentMethod",
      "createdAt",
      "updatedAt",
    ],
    properties: {
      id: uuid,
      tenantId: uuid,
      transactionDate: dateTime,
      amount: money,
      expenseCategoryId: uuid,
      vendorName: nullableString,
      paymentMethod: { $ref: "#/components/schemas/PaymentMethod" },
      billNumber: nullableString,
      description: nullableString,
      createdBy: nullableUuid,
      updatedBy: nullableUuid,
      createdAt: dateTime,
      updatedAt: dateTime,
      deletedAt: nullableDateTime,
    },
  },

  ExpenseWithCategory: {
    allOf: [
      { $ref: "#/components/schemas/Expense" },
      {
        type: "object",
        properties: {
          expenseCategories: { $ref: "#/components/schemas/ExpenseCategory" },
        },
      },
    ],
  },

  Note: {
    type: "object",
    required: [
      "id",
      "tenantId",
      "title",
      "description",
      "isPinned",
      "isArchived",
      "createdAt",
      "updatedAt",
    ],
    properties: {
      id: uuid,
      tenantId: uuid,
      title: { type: "string", maxLength: 255 },
      description: { type: "string", maxLength: 255 },
      colorLabel: nullableString,
      isPinned: { type: "boolean" },
      isArchived: { type: "boolean" },
      createdBy: nullableUuid,
      createdAt: dateTime,
      updatedAt: dateTime,
      deletedAt: nullableDateTime,
    },
  },

  Reminder: {
    type: "object",
    required: [
      "id",
      "tenantId",
      "title",
      "remainderDate",
      "priority",
      "status",
      "createdAt",
      "updatedAt",
    ],
    properties: {
      id: uuid,
      tenantId: uuid,
      title: { type: "string", maxLength: 255 },
      description: nullableString,
      remainderDate: dateTime,
      remainderTime: {
        type: "string",
        nullable: true,
        example: "09:30:00",
      },
      priority: { $ref: "#/components/schemas/ReminderPriority" },
      status: { $ref: "#/components/schemas/ReminderStatus" },
      repeat: {
        allOf: [{ $ref: "#/components/schemas/ReminderRepeat" }],
        nullable: true,
      },
      createdBy: nullableUuid,
      createdAt: dateTime,
      updatedAt: dateTime,
      deletedAt: nullableDateTime,
    },
  },

  Attachment: {
    type: "object",
    required: [
      "id",
      "tenantId",
      "entityType",
      "entityId",
      "fileName",
      "fileSize",
      "mimeType",
      "provider",
      "resourceType",
      "uploadedBy",
      "createdAt",
      "downloadUrl",
    ],
    properties: {
      id: uuid,
      tenantId: uuid,
      entityType: { type: "string", enum: ["income", "expense", "reminder"] },
      entityId: uuid,
      fileName: { type: "string" },
      fileSize: { type: "integer", description: "File size in bytes." },
      mimeType: { type: "string" },
      provider: { type: "string", enum: ["local", "cloudinary"] },
      resourceType: {
        type: "string",
        enum: ["image", "raw", "video"],
        nullable: true,
        description:
          "Cloudinary resource type used for signed downloads and deletion. Null only for legacy records.",
      },
      uploadedBy: uuid,
      createdAt: dateTime,
      deletedAt: nullableDateTime,
      downloadUrl: {
        type: "string",
        description:
          "Authenticated API path that redirects to a short-lived signed download URL.",
      },
    },
  },

  AuditLog: {
    type: "object",
    required: ["id", "action", "entityType", "createdAt", "userName"],
    properties: {
      id: uuid,
      tenantId: nullableUuid,
      userId: nullableUuid,
      action: { type: "string", maxLength: 100 },
      entityType: { type: "string", maxLength: 50 },
      entityId: nullableUuid,
      oldValues: nullableJson,
      newValues: nullableJson,
      ipAddress: nullableString,
      createdAt: dateTime,
      userName: { type: "string" },
    },
  },

  AuditListData: {
    type: "object",
    required: ["records", "meta"],
    properties: {
      records: {
        type: "array",
        items: { $ref: "#/components/schemas/AuditLog" },
      },
      meta: { $ref: "#/components/schemas/PaginationMeta" },
    },
  },

  KpiPeriod: {
    type: "object",
    required: ["income", "expense", "profit"],
    properties: {
      income: { type: "number" },
      expense: { type: "number" },
      profit: { type: "number" },
    },
  },

  DashboardKpis: {
    type: "object",
    required: ["today", "week", "month", "year"],
    properties: {
      today: { $ref: "#/components/schemas/KpiPeriod" },
      week: { $ref: "#/components/schemas/KpiPeriod" },
      month: { $ref: "#/components/schemas/KpiPeriod" },
      year: { $ref: "#/components/schemas/KpiPeriod" },
    },
  },

  IncomeExpenseChartPoint: {
    type: "object",
    required: ["bucket", "label", "income", "expense", "profit"],
    properties: {
      bucket: { type: "string" },
      label: { type: "string" },
      income: { type: "number" },
      expense: { type: "number" },
      profit: { type: "number" },
    },
  },

  CategoryBreakdown: {
    type: "object",
    required: ["categoryId", "categoryName", "amount", "percentage"],
    properties: {
      categoryId: uuid,
      categoryName: { type: "string" },
      amount: { type: "number" },
      percentage: { type: "number" },
    },
  },

  CashFlowMonth: {
    type: "object",
    required: ["month", "label", "income", "expense", "profit"],
    properties: {
      month: { type: "integer", minimum: 1, maximum: 12 },
      label: { type: "string", example: "Jan" },
      income: { type: "number" },
      expense: { type: "number" },
      profit: { type: "number" },
    },
  },

  RecentTransaction: {
    type: "object",
    required: ["type", "id", "date", "amount", "category"],
    properties: {
      type: { type: "string", enum: ["income", "expense"] },
      id: uuid,
      date: dateTime,
      amount: { type: "number" },
      party: nullableString,
      category: { type: "string" },
    },
  },

  ProfitLossReport: {
    type: "object",
    required: [
      "totalIncome",
      "totalExpense",
      "netProfit",
      "incomeCount",
      "expenseCount",
    ],
    properties: {
      totalIncome: { type: "number" },
      totalExpense: { type: "number" },
      netProfit: { type: "number" },
      incomeCount: { type: "integer" },
      expenseCount: { type: "integer" },
    },
  },

  EmailDispatchResult: {
    type: "object",
    required: ["emailSent"],
    properties: {
      emailSent: { type: "boolean" },
    },
  },

  VerifyEmailResult: {
    type: "object",
    required: ["userId", "emailVerifiedAt"],
    properties: {
      userId: uuid,
      emailVerifiedAt: dateTime,
    },
  },

  RemovedMember: {
    type: "object",
    required: ["id"],
    properties: {
      id: uuid,
    },
  },

  LoginRequest: {
    type: "object",
    required: ["userEmail", "userPassword"],
    additionalProperties: false,
    properties: {
      userEmail: { type: "string", format: "email" },
      userPassword: { type: "string", minLength: 1 },
    },
  },

  RegisterRequest: {
    type: "object",
    required: ["workspaceName", "userName", "userEmail", "userPassword"],
    additionalProperties: false,
    properties: {
      workspaceName: { type: "string", minLength: 2, maxLength: 255 },
      userName: { type: "string", minLength: 1, maxLength: 255 },
      userEmail: { type: "string", format: "email", maxLength: 255 },
      userPassword: { type: "string", minLength: 8, maxLength: 72 },
    },
  },

  ForgotPasswordRequest: {
    type: "object",
    required: ["userEmail"],
    additionalProperties: false,
    properties: {
      userEmail: { type: "string", format: "email", maxLength: 255 },
    },
  },

  ResetPasswordRequest: {
    type: "object",
    required: ["token", "userPassword"],
    additionalProperties: false,
    properties: {
      token: { type: "string", minLength: 32, maxLength: 255 },
      userPassword: { type: "string", minLength: 8, maxLength: 72 },
    },
  },

  ChangePasswordRequest: {
    type: "object",
    required: ["currentPassword", "newPassword"],
    additionalProperties: false,
    properties: {
      currentPassword: { type: "string", minLength: 1 },
      newPassword: { type: "string", minLength: 8, maxLength: 72 },
    },
  },

  VerifyEmailRequest: {
    type: "object",
    required: ["token"],
    additionalProperties: false,
    properties: {
      token: { type: "string", minLength: 32, maxLength: 255 },
    },
  },

  AcceptInvitationRequest: {
    type: "object",
    required: ["token", "userName", "userPassword"],
    additionalProperties: false,
    properties: {
      token: { type: "string", minLength: 32, maxLength: 255 },
      userName: { type: "string", minLength: 1, maxLength: 255 },
      userPassword: { type: "string", minLength: 8, maxLength: 72 },
    },
  },

  CreateIncomeRequest: {
    type: "object",
    required: [
      "transactionDate",
      "amount",
      "incomeCategoryId",
      "paymentMethod",
    ],
    additionalProperties: false,
    properties: incomeProperties,
  },

  UpdateIncomeRequest: {
    type: "object",
    additionalProperties: false,
    properties: incomeProperties,
  },

  CreateExpenseRequest: {
    type: "object",
    required: [
      "transactionDate",
      "amount",
      "expenseCategoryId",
      "paymentMethod",
    ],
    additionalProperties: false,
    properties: expenseProperties,
  },

  UpdateExpenseRequest: {
    type: "object",
    additionalProperties: false,
    properties: expenseProperties,
  },

  CreateNoteRequest: {
    type: "object",
    required: ["title", "description"],
    additionalProperties: false,
    properties: noteProperties,
  },

  UpdateNoteRequest: {
    type: "object",
    additionalProperties: false,
    properties: noteProperties,
  },

  ToggleNotePinRequest: {
    type: "object",
    required: ["isPinned"],
    additionalProperties: false,
    properties: {
      isPinned: { type: "boolean" },
    },
  },

  ToggleNoteArchiveRequest: {
    type: "object",
    required: ["isArchived"],
    additionalProperties: false,
    properties: {
      isArchived: { type: "boolean" },
    },
  },

  CreateReminderRequest: {
    type: "object",
    required: ["title", "remainderDate", "priority"],
    additionalProperties: false,
    properties: reminderProperties,
  },

  UpdateReminderRequest: {
    type: "object",
    additionalProperties: false,
    properties: reminderProperties,
  },

  UpdateWorkspaceRequest: {
    type: "object",
    additionalProperties: false,
    properties: {
      name: { type: "string", minLength: 2, maxLength: 255 },
      settings: { $ref: "#/components/schemas/WorkspaceSettings" },
    },
    anyOf: [{ required: ["name"] }, { required: ["settings"] }],
  },

  UpdateMemberRoleRequest: {
    type: "object",
    required: ["roleName"],
    additionalProperties: false,
    properties: {
      roleName: { $ref: "#/components/schemas/AssignableRole" },
    },
  },

  CreateInvitationRequest: {
    type: "object",
    required: ["userEmail", "roleName"],
    additionalProperties: false,
    properties: {
      userEmail: { type: "string", format: "email", maxLength: 255 },
      roleName: { $ref: "#/components/schemas/AssignableRole" },
    },
  },
};

export const parameters: Record<string, OpenAPIV3.ParameterObject> = {
  Id: uuidPathParam("id", "Resource identifier."),
  EntityId: uuidPathParam(
    "entityId",
    "Income, expense, or reminder identifier that owns the attachments.",
  ),
  AttachmentId: uuidPathParam("attachmentId", "Attachment identifier."),
  UserId: uuidPathParam("userId", "Workspace member user identifier."),
  InvitationId: uuidPathParam("invitationId", "Workspace invitation identifier."),
  InvitationToken: param(
    "token",
    "path",
    "Raw invitation token from the accept link.",
    { type: "string", minLength: 32, maxLength: 255 },
    true,
  ),
  Year: param("year", "path", "Four-digit year.", {
    type: "integer",
    minimum: 2000,
    maximum: 2100,
  }, true),
  FromDate: param("from", "path", "Inclusive start date (YYYY-MM-DD).", {
    type: "string",
    format: "date",
  }, true),
  ToDate: param("to", "path", "Inclusive end date (YYYY-MM-DD).", {
    type: "string",
    format: "date",
  }, true),
  Page: param("page", "query", "Page number.", {
    type: "integer",
    minimum: 1,
    default: 1,
  }),
  Limit: param("limit", "query", "Page size.", {
    type: "integer",
    minimum: 1,
    maximum: 100,
    default: 20,
  }),
  From: param("from", "query", "Inclusive start date (YYYY-MM-DD).", {
    type: "string",
    format: "date",
  }),
  To: param("to", "query", "Inclusive end date (YYYY-MM-DD).", {
    type: "string",
    format: "date",
  }),
  Format: param("format", "query", "Report output format.", {
    type: "string",
    enum: ["json", "pdf", "excel", "csv"],
    default: "json",
  }),
  Period: param("period", "query", "Chart bucket size.", {
    type: "string",
    enum: ["daily", "weekly", "monthly", "yearly"],
  }, true),
  CategoryId: param("categoryId", "query", "Category identifier.", {
    type: "string",
    format: "uuid",
  }),
  PaymentMethod: param("paymentMethod", "query", "Payment method filter.", {
    type: "string",
    enum: [...paymentMethods],
  }),
  Action: param("action", "query", "Audit action filter.", {
    type: "string",
  }),
  EntityType: param("entity_type", "query", "Audit entity type filter.", {
    type: "string",
  }),
};

export const responses: Record<
  string,
  OpenAPIV3.ResponseObject | OpenAPIV3.ReferenceObject
> = {
  BadRequest: {
    description: "Invalid request payload or query parameters.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ApiError" },
      },
    },
  },
  Unauthorized: {
    description: "Missing, invalid, expired, or revoked credentials.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ApiError" },
      },
    },
  },
  Forbidden: {
    description: "Authenticated but missing the required permission.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ApiError" },
      },
    },
  },
  NotFound: {
    description: "The requested resource was not found in the active workspace.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ApiError" },
      },
    },
  },
  Conflict: {
    description: "The request conflicts with existing data.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ApiError" },
      },
    },
  },
  TooManyRequests: {
    description: "Rate limit exceeded. Retry after the advertised window.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ApiError" },
      },
    },
  },
  InternalServerError: {
    description: "Unexpected server error.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ApiError" },
      },
    },
  },
};

export const tags: OpenAPIV3.TagObject[] = [
  {
    name: "Auth",
    description:
      "Registration, login, refresh-token rotation, password recovery, email verification, and invitation acceptance.",
  },
  {
    name: "Income",
    description: "Tenant-scoped income records.",
  },
  {
    name: "Expense",
    description: "Tenant-scoped expense records.",
  },
  {
    name: "Categories",
    description: "Tenant-scoped income and expense categories.",
  },
  {
    name: "Notes",
    description: "Tenant-scoped notes, pinning, and archiving.",
  },
  {
    name: "Reminders",
    description: "Tenant-scoped reminders and completion.",
  },
  {
    name: "Attachments",
    description:
      "PDF and image attachments for income, expense, and reminder records.",
  },
  {
    name: "Dashboard",
    description: "Aggregated KPIs, charts, recent activity, and upcoming reminders.",
  },
  {
    name: "Reports",
    description: "Income, expense, and profit/loss reports with JSON and file exports.",
  },
  {
    name: "Audit Logs",
    description: "Tenant-scoped audit trail. Requires audit:read.",
  },
  {
    name: "Workspace",
    description: "Current workspace profile and settings.",
  },
  {
    name: "Members",
    description: "Workspace membership and role management.",
  },
  {
    name: "Invitations",
    description: "Workspace invitation creation, listing, resend, and revocation.",
  },
];
