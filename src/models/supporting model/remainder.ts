import { EnumDataType } from "sequelize";
import { DataType, Table,Column,Model } from "sequelize-typescript";

@Table({
    tableName: "remainders",
    modelName: "remainder",
    timestamps: true,
    underscored: true,
  paranoid: true,
})

class Remainder extends Model <Remainder> {
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
    declare title: string;

    
    @Column({
        type: DataType.STRING,
        
    })
    declare description: string;

    
    @Column({
        type: DataType.DATE,
        allowNull: false
        
    })
    declare remainderDate: Date;

    
    @Column({
        type: DataType.TIME,
       
    })
    declare remainderTime: string;

     @Column({
        type: DataType.ENUM("LOW","MEDIUM","HIGH"),
        allowNull: false
    })
    declare priority: string;

     @Column({
        type: DataType.ENUM("PENDING","COMPLETED"),
        defaultValue: "PENDING",
        allowNull: false
        
    })
    declare status: string;

         @Column({
        type: DataType.ENUM("NONE","DAILY","WEEKLY","MONTHLY","YEARLY"),
        defaultValue: "NONE"
        
    })
    declare repeat: string;


    @Column({
        type: DataType.UUID,

    })
    declare createdBy: string;
}

export default Remainder;