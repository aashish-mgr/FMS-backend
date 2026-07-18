

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../config/constants";

export const parsePagination = (page?: number | string, limit?: number | string) => {
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
