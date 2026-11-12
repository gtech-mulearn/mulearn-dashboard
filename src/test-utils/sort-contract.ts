/**
 * Shared test helper: pins a table's sortable columns to the backend view's
 * sort_fields.
 *
 * 📍 src/test-utils/sort-contract.ts
 *
 * CommonUtils.get_paginated_queryset (mulearnbackend/utils/utils.py) silently
 * ignores a sortBy key missing from the view's sort_fields, so a sortable
 * column the backend doesn't know shows an arrow that does nothing. Each
 * feature calls this from its own test with a copy of its view's keys, so no
 * test reaches across feature boundaries.
 */
import { describe, expect, it } from "vitest";

export interface ContractColumn {
  column: string;
  isSortable: boolean;
}

export function describeSortContract(
  table: string,
  columns: ContractColumn[],
  backendSortFields: readonly string[],
): void {
  const sortable = columns.filter((c) => c.isSortable).map((c) => c.column);

  describe(`${table} table — sort contract`, () => {
    it("only offers sorts the backend applies", () => {
      for (const key of sortable) {
        expect(backendSortFields).toContain(key);
      }
    });

    it("offers a date sort", () => {
      expect(sortable.some((key) => key.endsWith("_at"))).toBe(true);
    });
  });
}
