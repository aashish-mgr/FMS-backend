import Income from "../transactions/income";
import Expense from "../transactions/expense";
import IncomeCategory from "../category/incomeCategory";
import ExpenseCategory from "../category/expenceCategory";
import User from "../auth/userModel";

export const transactionRelationships = () => {
  IncomeCategory.hasMany(Income, {
    foreignKey: "incomeCategoryId",
  });
  Income.belongsTo(IncomeCategory, {
    foreignKey: "incomeCategoryId",
  });

  User.hasMany(Income, {
    foreignKey: "createdBy",
  });
  User.hasMany(Income, {
    foreignKey: "updatedBy",
  });

  Income.belongsTo(User, {
    foreignKey: "createdBy",
  });
  Income.belongsTo(User, {
    foreignKey: "updatedBy",
  });

    ExpenseCategory.hasMany(Expense, {
    foreignKey: "expenseCategoryId",
    as: "expenses",
  });
  Expense.belongsTo(ExpenseCategory, {
    foreignKey: "expenseCategoryId",
  });

  User.hasMany(Expense, {
    foreignKey: "createdBy",
  });
  User.hasMany(Expense, {
    foreignKey: "updatedBy",
  });

  Expense.belongsTo(User, {
    foreignKey: "createdBy",
  });
  Expense.belongsTo(User, {
    foreignKey: "updatedBy",
  });



};
