import { describe, expect, it } from "vitest";
import type { PartnerConnection } from "../schemas";
import { cardState } from "./card-state";

const base: PartnerConnection = {
  enabled: true,
  account_type: "candidate",
  hidden: false,
  eligibility: { eligible: true, reason: null, message: null },
  can_manage: true,
  managed_by: null,
  email_verified: true,
  connection: null,
  consent: {
    current_version: "v1",
    accepted_version: null,
    needs_consent: true,
    document: null,
  },
  shared_data_preview: [],
};
const link = (
  overrides: Partial<NonNullable<PartnerConnection["connection"]>> = {},
) => ({
  status: "active" as const,
  connected_at: null,
  last_login_at: null,
  contact_name: "Asha Nair",
  takeover_required: false,
  ...overrides,
});
const consented = {
  current_version: "v1",
  accepted_version: "v1",
  needs_consent: false,
  document: null,
};

describe("cardState", () => {
  it("hides when disabled or not applicable", () => {
    expect(cardState({ enabled: false, account_type: "candidate" })).toBe(
      "hidden",
    );
    expect(cardState({ ...base, hidden: true })).toBe("hidden");
  });

  it("is read-only for co-admins and other campus staff", () => {
    expect(
      cardState({
        ...base,
        can_manage: false,
        eligibility: {
          eligible: false,
          reason: "not_lead_enabler",
          message: "m",
        },
      }),
    ).toBe("read_only");
  });

  it("is unavailable when the account can't connect yet", () => {
    expect(
      cardState({
        ...base,
        can_manage: false,
        eligibility: {
          eligible: false,
          reason: "company_not_verified",
          message: "m",
        },
      }),
    ).toBe("unavailable");
    expect(
      cardState({
        ...base,
        eligibility: {
          eligible: false,
          reason: "email_not_supported",
          message: "m",
        },
      }),
    ).toBe("unavailable");
  });

  it("follows the link, with takeover first, then terms", () => {
    expect(cardState(base)).toBe("not_connected");
    expect(
      cardState({ ...base, connection: link({ takeover_required: true }) }),
    ).toBe("takeover");
    expect(
      cardState({ ...base, connection: link({ status: "disconnected" }) }),
    ).toBe("disconnected");
    expect(cardState({ ...base, connection: link() })).toBe("needs_consent");
    expect(cardState({ ...base, consent: consented, connection: link() })).toBe(
      "active",
    );
    expect(
      cardState({
        ...base,
        consent: consented,
        connection: link({ status: "pending_approval" }),
      }),
    ).toBe("pending");
    expect(
      cardState({
        ...base,
        consent: consented,
        connection: link({ status: "rejected" }),
      }),
    ).toBe("rejected");
  });
});
