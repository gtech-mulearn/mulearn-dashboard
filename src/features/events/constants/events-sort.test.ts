/**
 * Events — list sorting contract
 *
 * 📍 src/features/events/constants/events-sort.test.ts
 *
 * Backend source of truth — utils/utils.py :: CommonUtils.get_paginated_queryset
 *
 *     sort = sort_by[1:] if sort_by.startswith("-") else sort_by
 *     if sort_field_name := sort_fields.get(sort):
 *         if sort_by.startswith("-"):
 *             sort_field_name = f"-{sort_field_name}"
 *         queryset = queryset.order_by(sort_field_name)
 *
 * The "-" from the request is re-applied to the *mapped* value. If a mapping
 * value already starts with "-", the result is order_by("--field"), which
 * Django rejects with FieldError → 500. That is what previously made
 * manage-events 500 on sortBy=-created_at and led to sortBy being stripped
 * from management requests entirely.
 */

import { describe, expect, it } from "vitest";
import { EVENT_SORT_DEFAULT, EVENT_SORT_OPTIONS } from "./events.constants";

/** Faithful port of the backend's resolution, including the "-" doubling bug. */
function resolveOrderBy(
  sortBy: string,
  sortFields: Record<string, string>,
): string | null {
  const descending = sortBy.startsWith("-");
  const key = descending ? sortBy.slice(1) : sortBy;
  const mapped = sortFields[key];
  if (!mapped) return null;
  return descending ? `-${mapped}` : mapped;
}

const isValidDjangoOrderBy = (value: string | null) =>
  value !== null && !value.startsWith("--");

// Mirrors the three backends the events lists talk to, AFTER the manage fix.
const SORT_FIELDS = {
  manage: { created_at: "created_at", start_datetime: "start_datetime" },
  admin: {
    created_at: "created_at",
    start_datetime: "start_datetime",
    interest_count: "-interest_count",
  },
  public: {
    start_datetime: "start_datetime",
    "-start_datetime": "-start_datetime",
    interest_count: "-interest_count",
    created_at: "created_at",
  },
} as const;

describe("EVENT_SORT_OPTIONS — backend parity", () => {
  it("defaults to newest first", () => {
    expect(EVENT_SORT_DEFAULT).toBe("-created_at");
    expect(EVENT_SORT_OPTIONS[0].value).toBe(EVENT_SORT_DEFAULT);
  });

  it.each(
    Object.entries(SORT_FIELDS),
  )("every offered option resolves to a valid order_by on the %s list", (_endpoint, sortFields) => {
    for (const option of EVENT_SORT_OPTIONS) {
      const orderBy = resolveOrderBy(
        option.value,
        sortFields as Record<string, string>,
      );
      expect(
        isValidDjangoOrderBy(orderBy),
        `${option.value} resolved to ${orderBy}`,
      ).toBe(true);
    }
  });

  it("resolves consistently across manage, admin and public", () => {
    // The whole point of the manage_views.py fix: the same dropdown value must
    // not sort one way for an admin and the opposite way for everyone else.
    for (const option of EVENT_SORT_OPTIONS) {
      const resolved = Object.values(SORT_FIELDS).map((fields) =>
        resolveOrderBy(option.value, fields as Record<string, string>),
      );
      expect(new Set(resolved).size).toBe(1);
    }
  });

  it("would have caught the old manage mapping", () => {
    // Regression guard for the exact shape that produced the 500.
    const oldManage = { created_at: "-created_at" };
    expect(resolveOrderBy("-created_at", oldManage)).toBe("--created_at");
    expect(isValidDjangoOrderBy(resolveOrderBy("-created_at", oldManage))).toBe(
      false,
    );
  });

  it("documents why interest_count is not offered", () => {
    // Mapped as '-interest_count', so only the ascending form is safe — and an
    // ascending "least interested first" option is not useful.
    expect(
      isValidDjangoOrderBy(
        resolveOrderBy("-interest_count", {
          interest_count: "-interest_count",
        }),
      ),
    ).toBe(false);
  });
});
