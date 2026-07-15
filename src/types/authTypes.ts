import { Request } from "express";
import { User } from "@prisma/client";
import { EntityType } from "../modules/attachment/attachment.service";

// Was a hand-written UserDetails interface in the Sequelize version. Now
// reuses Prisma's generated User type directly so it can never drift out of
// sync with the schema.
export interface AuthRequest extends Request {
  user?: User;
  entityType?: EntityType;
}
