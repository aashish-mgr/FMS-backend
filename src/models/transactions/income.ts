import { DataType, Model, Table, Column } from "sequelize-typescript";

@Table({
  tableName: "incomes",
  modelName: "Income",
  timestamps: true,
})
class Income extends Model<Income> {
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
  declare incomeCategoryId: string;

  @Column({
    type: DataType.STRING,
  })
  declare incomeSource: string;

  @Column({
    type: DataType.STRING,
  })
  declare clientName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare paymentMethod: string;

  @Column({
    type: DataType.STRING,
  })
  declare referenceNumber: string;

  @Column({
    type: DataType.STRING,
  })
  declare invoiceNumber: string;

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

export default Income;
