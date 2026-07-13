
import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "users",
    modelName: "User",
    timestamps: true,
    underscored: true,
  paranoid: true,
})

class User extends Model<User> {
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

    declare userName: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })

    declare userEmail: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare userPassword: string;

}

export default User;