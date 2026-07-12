import Remainder from "../supporting model/remainder";
import User from "../auth/userModel";

export const remainderRelationship = () => {
    User.hasMany(Remainder,{
        foreignKey: "createdBy"
    });

    Remainder.belongsTo(User,{
        foreignKey: "createdBy"
    })
}