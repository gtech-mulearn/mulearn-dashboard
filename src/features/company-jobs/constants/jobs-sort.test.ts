/**
 * Company Jobs — list sorting contract
 *
 * 📍 src/features/company-jobs/constants/jobs-sort.test.ts
 *
 * Backend source of truth:
 *   api/dashboard/company/job_views.py :: CompanyJobAPI.get
 *     sort_fields={"title": "title", "created_at": "created_at"}
 *   utils/utils.py :: CommonUtils.get_paginated_queryset
 *     sort_by = request.query_params.get("sortBy")
 *     sort = sort_by[1:] if sort_by.startswith("-") else sort_by
 *
 * Two things this pins down:
 *   1. Only `title` and `created_at` are sortable — any other key is dropped
 *      server-side and the rows come back unsorted.
 *   2. Direction rides on the same `sortBy` param as a leading "-". There is no
 *      `sort_order` parameter; the frontend used to send one and it did nothing.
 */

import { describe, expect, it } from "vitest";
import { JOB_SORT_DEFAULT, JOB_SORT_OPTIONS } from "./jobs.constants";

/** Mirrors the backend's parsing of the `sortBy` value. */
const BACKEND_SORT_FIELDS = new Set(["title", "created_at"]);

describe("JOB_SORT_OPTIONS — backend parity", () => {
  it("defaults to latest first", () => {
    expect(JOB_SORT_DEFAULT).toBe("-created_at");
    expect(JOB_SORT_OPTIONS[0].value).toBe(JOB_SORT_DEFAULT);
  });

  it("only offers fields the backend declares in sort_fields", () => {
    for (const option of JOB_SORT_OPTIONS) {
      const field = option.value.startsWith("-")
        ? option.value.slice(1)
        : option.value;
      expect(BACKEND_SORT_FIELDS.has(field)).toBe(true);
    }
  });

  it("covers both directions for every sortable field", () => {
    expect(JOB_SORT_OPTIONS.map((o) => o.value).sort()).toEqual(
      ["-created_at", "-title", "created_at", "title"].sort(),
    );
  });

  it("has no duplicate values or labels", () => {
    const values = JOB_SORT_OPTIONS.map((o) => o.value);
    const labels = JOB_SORT_OPTIONS.map((o) => o.label);
    expect(new Set(values).size).toBe(values.length);
    expect(new Set(labels).size).toBe(labels.length);
  });
});
