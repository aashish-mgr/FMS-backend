import { DataType, Model, Table, Column } from "sequelize-typescript";

@Table({
  tableName: "expenses",
  modelName: "Expense",
  timestamps: true,

})
class Expense extends Model<Expense> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  declare id: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare transactionDate: Date;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
  })
  declare amount: number;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare expenseCategoryId: string;


  @Column({
    type: DataType.STRING,
  })
  declare vendorName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare paymentMethod: string;

  @Column({
    type: DataType.STRING,
  })
  declare billNumber: string;


  @Column({
    type: DataType.STRING,
  })
  declare description: string;

  @Column({
    type: DataType.UUID,
  })
  declare createdBy: string;

  @Column({
    type: DataType.UUID,
  })
  declare updatedBy: string;
}

export default Expense;
