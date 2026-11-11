import { describe, expect, it } from "vitest";
import { CompanyAdminLinkSchema } from "../schemas/jobs.schema";
import type { CompanyAdminLink } from "../types";
import { adminLinkActions, coAdminSeats } from "./admin-link-actions";

// Field list of the backend's CompanyAdminLinkSerializer (release 1.91).
const beSample = {
  id: "5d0c1c1e-7b1c-4c55-9a51-0c6f6d3a2f10",
  user_muid: "jane-doe@mulearn",
  user_name: "Jane Doe",
  status: "Accepted",
  invited_by_name: "Owner Person",
  invited_at: "2026-11-01T10:00:00Z",
  responded_at: "2026-11-02T09:30:00Z",
  revoked_by_name: null,
  revoked_at: null,
};

const link = (over: Partial<CompanyAdminLink> = {}): CompanyAdminLink =>
  CompanyAdminLinkSchema.parse({ ...beSample, ...over });

describe("CompanyAdminLinkSchema", () => {
  it("parses the backend serializer's fields", () => {
    expect(CompanyAdminLinkSchema.parse(beSample)).toMatchObject({
      user_muid: "jane-doe@mulearn",
      status: "Accepted",
    });
  });

  it("normalises status casing (the DB column defaults to lowercase)", () => {
    expect(link({ status: "pending" as never }).status).toBe("Pending");
  });
});

describe("adminLinkActions", () => {
  const owner = { role: "owner" as const, muid: "owner@mulearn" };
  const coAdmin = { role: "co_admin" as const, muid: "jane-doe@mulearn" };

  it("lets the owner remove an accepted co-admin", () => {
    expect(adminLinkActions(link(), owner)).toEqual({
      canRemove: true,
      canLeave: false,
      canCancel: false,
    });
  });

  it("lets a co-admin leave from their own row", () => {
    expect(adminLinkActions(link(), coAdmin)).toEqual({
      canRemove: false,
      canLeave: true,
      canCancel: false,
    });
  });

  it("gives a co-admin no actions on someone else's row", () => {
    expect(
      adminLinkActions(link({ user_muid: "someone@mulearn" }), coAdmin),
    ).toEqual({ canRemove: false, canLeave: false, canCancel: false });
  });

  it("lets only the owner cancel a pending invite (BE-2)", () => {
    const pending = link({ status: "Pending", responded_at: null });
    expect(adminLinkActions(pending, owner)).toEqual({
      canRemove: false,
      canLeave: false,
      canCancel: true,
    });
    expect(
      adminLinkActions(pending, { role: "co_admin", muid: "jane-doe@mulearn" }),
    ).toEqual({ canRemove: false, canLeave: false, canCancel: false });
  });
});

describe("coAdminSeats", () => {
  it("counts accepted and pending links against the backend's cap of 5", () => {
    const links = [
      link(),
      link({ id: "b", status: "Pending" }),
      link({ id: "c", status: "Declined" }),
      link({ id: "d", status: "Revoked" }),
    ];
    expect(coAdminSeats(links)).toEqual({ used: 2, left: 3, max: 5 });
  });

  it("never reports negative seats", () => {
    const six = Array.from({ length: 6 }, (_, i) => link({ id: String(i) }));
    expect(coAdminSeats(six).left).toBe(0);
  });
});
