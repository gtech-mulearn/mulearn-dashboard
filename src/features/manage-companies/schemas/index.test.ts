import { describe, expect, it } from "vitest";
import { CompanyDetailsSchema } from "./index";

describe("CompanyDetailsSchema", () => {
  it("accepts gallery items as objects, the only shape the backend stores", () => {
    // validate_gallery requires a list of dicts
    // (mulearnbackend/api/dashboard/company/serializers.py).
    const parsed = CompanyDetailsSchema.safeParse({
      id: "c1",
      name: "Acme",
      slug: "acme",
      status: "pending",
      gallery: [{ url: "https://cdn.example/1.png", caption: "Office" }],
    });
    expect(parsed.success).toBe(true);
  });
});
