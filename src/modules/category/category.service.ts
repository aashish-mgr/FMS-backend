import {prisma} from "../../config/database"

class CategoryService {
    async getIncomeCategory() {
       return prisma.incomeCategory.findMany({
        where: {deletedAt: null}
       });

    }

    async getExpenseCategory() {
        return prisma.expenseCategory.findMany({
            where: {deletedAt: null}
        });
    }
}

export default new CategoryService();