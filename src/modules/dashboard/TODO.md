# Dashboard module — not yet converted

Nothing existed for this in the Sequelize source — no models, controllers,
or routes. Scaffolded here per the SRS (Section 6), which specifies:

- 12 KPI cards (today/week/month/year x income/expense/profit)
- Income vs Expense bar chart, category pie charts, monthly cash flow line
  chart
- Recent transactions widget, upcoming reminders widget

This will mostly be aggregation queries over `Income` and `Expense`
(`prisma.income.aggregate({ _sum: { amount: true }, where: {...} })`), using
the date-range helpers scaffolded in `src/utils/dateHelpers.ts`.
