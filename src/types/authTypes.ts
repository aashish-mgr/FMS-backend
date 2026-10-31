import type { Request } from "express";
import type { Tenant, User } from "@prisma/client";
import type { EntityType } from "../modules/attachment/attachment.service";

// The authenticated user is always loaded together with their workspace and
// roles, so controllers can scope queries without re-reading the database.
export interface AuthRequest extends Request {
  user?: User;
  tenant?: Tenant;
  tenantId?: string;
  roles?: string[];
  entityType?: EntityType;
}
