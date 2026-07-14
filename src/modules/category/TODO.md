# Category module — not yet converted

No `categoryController` / `categoryRoute` existed in the Sequelize source —
`IncomeCategory` and `ExpenseCategory` were only ever read/written by their
seeders (`incomeCategorySeed.ts` / `expenseCategorySeed.ts`), now converted
into `prisma/seed.ts` (`seedIncomeCategories` / `seedExpenseCategories`).

Both `IncomeCategory` and `ExpenseCategory` models are fully defined in
`prisma/schema.prisma`. If you build read/list endpoints for these (e.g. for
populating a category dropdown in the frontend), follow the pattern in
`src/modules/income/`:

```ts
prisma.incomeCategory.findMany({ where: { deletedAt: null } });
prisma.expenseCategory.findMany({ where: { deletedAt: null } });
```
