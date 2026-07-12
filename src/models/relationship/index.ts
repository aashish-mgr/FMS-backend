import User from "../auth/userModel";
import Role from "../auth/roleModel";
import UserRole from "../auth/userRole";
import { transactionRelationships } from "./transactionRel";

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

  transactionRelationships();
};

export { applyRelationship };
