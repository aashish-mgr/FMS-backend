import { DataType,Model,Table,Column } from "sequelize-typescript";

@Table({
    tableName: "incomeCategories",
    modelName: "IncomeCategory",
    timestamps: true,
    underscored: true,
  paranoid: true,
})

class IncomeCategory extends Model <IncomeCategory> {
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

export default IncomeCategory;