import Note from "../supporting model/notes";
import User from "../auth/userModel";

export const noteRelationship = () => {
    User.hasMany(Note, {
        foreignKey: "createdBy"
    })

    Note.belongsTo(User,{
        foreignKey: "createdBy"
    })
}