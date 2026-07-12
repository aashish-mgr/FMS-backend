import Role from "../auth/roleModel";
import User from "../auth/userModel";
import UserRole from "../auth/userRole";

export const roleRelationship = () => {
     User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: "userId",
    otherKey: "roleId",
  });

  Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: "roleId",
    otherKey: "userId",
  });
}