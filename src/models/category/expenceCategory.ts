import { DataType,Model,Table,Column } from "sequelize-typescript";

@Table({
    tableName: "expenseCategories",
    modelName: "ExpenseCategory",
    timestamps: true
})

class ExpenseCategory extends Model <ExpenseCategory> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
        allowNull: false
    })
    declare id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare categoryName: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare categoryDescription: string;
    
}

export default ExpenseCategory;