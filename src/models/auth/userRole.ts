import { Column, DataType, Table, Model } from "sequelize-typescript";
import User from "./userModel";
import Role from "./roleModel";

@Table({
    tableName: "userRoles",
    modelName: "userRole",
    timestamps: true
})

 class UserRole extends Model <UserRole> {
    
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
        allowNull: false
    })

    declare id: string;

    @Column({
        type: DataType.UUID,
        allowNull: false,
        references: {model: User, key: 'id'},
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })

    declare userId: string

    @Column({
        type: DataType.UUID,
        allowNull: false,
        references: {model: Role, key: 'id'},
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })

    declare roleId: string
}

export default UserRole;
