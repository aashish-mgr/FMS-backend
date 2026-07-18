import { AuditSchema, AuditSchemaInput } from "./audit.validation";
import { prisma } from "../../config/database";
import { parsePagination, buildMeta } from "../../utils/pagination";
import { Prisma } from "@prisma/client";

class AuditService {
  async listAudit(query: AuditSchemaInput) {
    const { page, limit, skip, take } = parsePagination(query as string);
    const where: Prisma.AuditLogsWhereInput = {};
    if (query.action) where.action = query.action;
    if (query.entity_type) where.entityType = query.entity_type;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    const [records, total] = await Promise.all([
      prisma.auditLogs.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: take,
      }),
      prisma.auditLogs.count({ where }),
    ]);

    const userIds = [
      ...new Set(
        records.map((r) => r.userId).filter((id): id is string => id !== null),
      ),
    ];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, fullName: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u.fullName]));

    return {
      records: records.map((r) => ({
        ...r,
        userName: r.userId
          ? (userMap.get(r.userId) ?? "Unknown user")
          : "System",
      })),
      meta: buildMeta(page, limit, total),
    };
  }
}

export default new AuditService();