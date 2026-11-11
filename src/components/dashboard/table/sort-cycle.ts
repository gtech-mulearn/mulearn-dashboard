/**
 * Column sort cycle for dashboard tables: ascending → descending → off.
 *
 * 📍 src/components/dashboard/table/sort-cycle.ts
 *
 * Values follow the backend's `sortBy` contract
 * (mulearnbackend/utils/utils.py → CommonUtils.get_paginated_queryset):
 * "field" sorts ascending, "-field" descending, and "" keeps the view's
 * default ordering.
 */
export function nextSortState(current: string, column: string): string {
  if (current === column) return `-${column}`;
  if (current === `-${column}`) return "";
  return column;
}
