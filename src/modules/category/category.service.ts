import {prisma} from "../../config/database"

class CategoryService {
    async getIncomeCategory() {
       return prisma.incomeCategory.findMany();

    }

    async getExpenseCategory() {
        return prisma.expenseCategory.findMany();
    }
}

export default new CategoryService();