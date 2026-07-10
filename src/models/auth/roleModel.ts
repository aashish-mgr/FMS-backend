import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table({
        tableName: "roles",
        modelName: "Role",
        timestamps: true
})

 class Role extends Model<Role> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        allowNull: false,
        primaryKey: true,
    })
    declare id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,

    })
    declare roleName: string

}

export default Role;