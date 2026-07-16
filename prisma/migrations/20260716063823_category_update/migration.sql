-- AlterTable
ALTER TABLE "expenseCategories" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "incomeCategories" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6);
