# Expense module — not yet converted

No `expenseController` / `expenseRoute` existed in the Sequelize source —
only the `Expense` model (`src/models/transactions/expense.ts`) and its
relationships were defined; no controller/routes were ever written for it.

The `Expense` model is fully defined in `prisma/schema.prisma`, with the
same shape as `Income` (transactionDate, amount, category FK, vendorName
instead of clientName/incomeSource, paymentMethod, billNumber instead of
referenceNumber/invoiceNumber, description, createdBy/updatedBy, soft
delete via deletedAt).

Since `Income` already has a full CRUD conversion, the fastest way to build
this module is to copy `src/modules/income/` and adapt field names:

```
expense.routes.ts       # mirrors income.routes.ts
expense.controller.ts   # mirrors income.controller.ts
expense.service.ts      # mirrors income.service.ts, using prisma.expense.*
expense.validation.ts   # mirrors income.validation.ts, using Expense fields
```

Remember to filter `deletedAt: null` on every read, same as income.
