import { describe, expect, it } from "vitest";
import {
  clientFormSchema,
  redirectUriProblem,
  toCreatePayload,
  toUpdatePayload,
} from "./connected-apps.schema";

const valid = {
  name: "µFIFA (prod)",
  client_id: "mufifa-prod",
  client_type: "confidential" as const,
  skip_authorization: false,
  redirect_uris: [{ value: "https://mufifa.mulearn.org/auth/callback" }],
  post_logout_redirect_uris: [{ value: "" }],
};

describe("redirectUriProblem mirrors the authserver's rules", () => {
  it.each([
    "https://app.mulearn.org/auth/callback",
    "mulearn://auth/callback",
    "http://localhost:4000/auth/callback",
    "http://127.0.0.1:4000/cb",
  ])("accepts %s", (uri) => {
    expect(redirectUriProblem(uri)).toBeNull();
  });

  it.each([
    ["http://app.mulearn.org/cb", "https"],
    ["https://*.mulearn.org/cb", "Wildcards"],
    ["https://app.mulearn.org/cb#x", "fragment"],
    [" https://app.mulearn.org/cb", "spaces"],
    ["ftp://app.mulearn.org/cb", "https"],
    ["https:///cb", "host"],
  ])("refuses %s", (uri, reason) => {
    expect(redirectUriProblem(uri)).toContain(reason);
  });
});

describe("clientFormSchema", () => {
  it("accepts a well-formed registration", () => {
    expect(clientFormSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a client id with capitals or spaces", () => {
    const r = clientFormSchema.safeParse({
      ...valid,
      client_id: "MuFIFA prod",
    });
    expect(r.success).toBe(false);
  });

  it("needs at least one redirect URI", () => {
    const r = clientFormSchema.safeParse({
      ...valid,
      redirect_uris: [{ value: "" }],
    });
    expect(r.success).toBe(false);
  });

  it("reports which redirect URI is wrong", () => {
    const r = clientFormSchema.safeParse({
      ...valid,
      redirect_uris: [
        { value: "https://ok.mulearn.org/cb" },
        { value: "http://bad.example.com/cb" },
      ],
    });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["redirect_uris", 1, "value"]);
  });

  it("rejects the same redirect URI twice", () => {
    const r = clientFormSchema.safeParse({
      ...valid,
      redirect_uris: [
        { value: "https://a.mulearn.org/cb" },
        { value: "https://a.mulearn.org/cb" },
      ],
    });
    expect(r.success).toBe(false);
  });
});

describe("payloads", () => {
  it("create sends trimmed values and drops empty optional URIs", () => {
    expect(
      toCreatePayload({
        ...valid,
        name: "  µFIFA (prod) ",
        post_logout_redirect_uris: [
          { value: "" },
          { value: "https://mufifa.mulearn.org/" },
        ],
      }),
    ).toEqual({
      name: "µFIFA (prod)",
      client_id: "mufifa-prod",
      client_type: "confidential",
      skip_authorization: false,
      redirect_uris: ["https://mufifa.mulearn.org/auth/callback"],
      post_logout_redirect_uris: ["https://mufifa.mulearn.org/"],
    });
  });

  it("update never sends client_id or client_type, which can't change", () => {
    const payload = toUpdatePayload(valid);
    expect(payload).not.toHaveProperty("client_id");
    expect(payload).not.toHaveProperty("client_type");
    expect(payload.redirect_uris).toEqual([
      "https://mufifa.mulearn.org/auth/callback",
    ]);
  });
});
