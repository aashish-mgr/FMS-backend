// Not used by the current income/auth modules (neither had pagination in the
// original Sequelize version), but the SRS's list endpoints (Section 12 —
// Search & Filters) expect `page` / `limit` query params on every list route.
// Drop this into a new module's service like:
//
//   const { skip, take } = toSkipTake(page, limit);
//   prisma.expense.findMany({ where, skip, take });

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../config/constants";

export const toSkipTake = (page?: number | string, limit?: number | string) => {
  const pageNum = Math.max(1, Number(page) || DEFAULT_PAGE);
  const limitNum = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(limit) || DEFAULT_PAGE_SIZE));

  return {
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
    page: pageNum,
    limit: limitNum,
  };
};

export const buildMeta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
