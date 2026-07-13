import { DataType, Table,Column,Model } from "sequelize-typescript";

@Table({
    tableName: "notes",
    modelName: "note",
    timestamps: true,
    underscored: true,
  paranoid: true,
})

class Note extends Model <Note> {
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
        allowNull: false
    })
    declare description: string;

    
    @Column({
        type: DataType.STRING,
        defaultValue: null,
        
    })
    declare colorLabel: string;

    
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    declare isPinned: boolean;

     @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    declare isArchived: boolean;

     @Column({
        type: DataType.UUID,
        
    })
    declare createdBy: string;
}

export default Note;