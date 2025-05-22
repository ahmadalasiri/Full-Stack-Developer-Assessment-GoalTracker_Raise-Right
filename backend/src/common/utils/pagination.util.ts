import { PaginationMeta } from '../interfaces/pagination.interface';

export class PaginationUtil {
  /**
   * Create pagination metadata based on current page, items per page, and total count
   */
  static createPaginationMeta(
    page: number,
    limit: number,
    total: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit) || 1; // Ensure page number doesn't exceed total pages
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    const meta: PaginationMeta = {
      currentPage,
      itemsPerPage: limit,
      totalItems: total,
      totalPages,
    };

    return meta;
  }
}
