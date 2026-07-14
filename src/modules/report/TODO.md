# Report module — not yet converted

Nothing existed for this in the Sequelize source — no models, controllers,
or routes. Scaffolded here per the SRS (Section 11), which specifies report
types (Income, Expense, P&L, Category breakdowns, Monthly/Yearly summaries)
exportable as PDF/Excel/CSV.

Suggested libraries per the SRS: Puppeteer or pdfmake for PDF, ExcelJS or
SheetJS for Excel, csv-stringify (or Node's native CSV writing) for CSV —
none of these are in package.json yet, add them when you build this out.
