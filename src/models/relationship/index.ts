import User from "../auth/userModel";
import Role from "../auth/roleModel";
import UserRole from "../auth/userRole";

const applyRelationship = () => {
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
};

export { applyRelationship };
