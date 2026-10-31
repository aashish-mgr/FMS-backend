import {prisma} from "../../config/database"

class CategoryService {
    async getIncomeCategory(tenantId: string) {
       return prisma.incomeCategory.findMany({
        where: {tenantId, deletedAt: null}
       });

    }

    async getExpenseCategory(tenantId: string) {
        return prisma.expenseCategory.findMany({
            where: {tenantId, deletedAt: null}
        });
    }
}

export default new CategoryService();
