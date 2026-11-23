import { describe, expect, it } from "vitest";
import { ApiError, parseApiError, toApiError } from "./errors";

// Fixtures follow the backend envelope (backend issue 0019, docs/architecture/07-api-standards.md).
const RID = "req_0193a1b2c3d4e5f60718293a4b5c6d7e";

describe("parseApiError against today's envelopes", () => {
  it("keeps the message, status and data of a legacy failure envelope", () => {
    const data = {
      hasError: true,
      statusCode: 400,
      message: { general: ["Event not found."] },
      response: {},
    };

    const error = parseApiError(400, data);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.message).toBe("Event not found.");
    expect(error.data).toBe(data);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBeUndefined();
    expect(error.requestId).toBeUndefined();
    expect(error.fieldErrors).toBeUndefined();
  });

  it("reads a legacy field-error message the way extractDjangoMessage does", () => {
    const error = parseApiError(400, {
      hasError: true,
      message: { email: ["Enter a valid email."] },
    });

    expect(error.message).toBe("Enter a valid email.");
  });

  it("reads DRF's detail, and falls back when there is no message", () => {
    expect(parseApiError(404, { detail: "Not found." }).message).toBe(
      "Not found.",
    );
    expect(parseApiError(502, null).message).toBe(
      "Something went wrong. Please try again.",
    );
    expect(parseApiError(502, null, undefined, "Upload failed").message).toBe(
      "Upload failed",
    );
  });

  it("keeps a token failure's body, statusCode 1000 included", () => {
    const data = {
      hasError: true,
      message: { general: ["Token Expired or Invalid"] },
      statusCode: 1000,
    };

    const error = parseApiError(403, data);

    expect(error.status).toBe(403);
    expect(error.statusCode).toBe(1000);
    expect(error.message).toBe("Token Expired or Invalid");
  });
});

describe("parseApiError with the new keys", () => {
  it("carries code, requestId and the endpoint", () => {
    const error = parseApiError(
      409,
      {
        hasError: true,
        statusCode: 409,
        code: "events.not_bookmarkable",
        message: {
          general: ["Cancelled or past events cannot be bookmarked."],
          fields: {},
        },
        response: {},
        requestId: RID,
      },
      "/api/v1/events/bookmarks/",
    );

    expect(error.code).toBe("events.not_bookmarkable");
    expect(error.requestId).toBe(RID);
    expect(error.endpoint).toBe("/api/v1/events/bookmarks/");
    expect(error.message).toBe(
      "Cancelled or past events cannot be bookmarked.",
    );
    expect(error.fieldErrors).toBeUndefined();
  });

  it("flattens nested field errors to dotted keys and treats non_field_errors as general", () => {
    const error = parseApiError(400, {
      hasError: true,
      statusCode: 400,
      code: "validation_error",
      message: {
        general: [],
        fields: {
          startsAt: ["Must be in the future."],
          address: { city: ["Required."] },
          items: [{ name: ["Too long."] }, {}],
          non_field_errors: ["Dates overlap."],
        },
      },
      response: {},
      requestId: RID,
    });

    expect(error.fieldErrors).toEqual({
      startsAt: ["Must be in the future."],
      "address.city": ["Required."],
      "items.0.name": ["Too long."],
    });
    expect(error.message).toBe("Dates overlap.");
  });

  it("uses the first field error when there is no general message", () => {
    const error = parseApiError(400, {
      hasError: true,
      statusCode: 400,
      code: "validation_error",
      message: {
        general: [],
        fields: { startsAt: ["Must be in the future."] },
      },
      response: {},
      requestId: RID,
    });

    expect(error.message).toBe("Must be in the future.");
  });

  it("reads a JSON 500 envelope", () => {
    const error = parseApiError(500, {
      hasError: true,
      statusCode: 500,
      code: "internal_error",
      message: {
        general: ["Something went wrong. Please try again."],
        fields: {},
      },
      response: {},
      requestId: RID,
    });

    expect(error.status).toBe(500);
    expect(error.code).toBe("internal_error");
    expect(error.requestId).toBe(RID);
  });
});

describe("ApiError", () => {
  it("still takes three arguments", () => {
    const error = new ApiError(401, "Session expired", { a: 1 });

    expect(error).toBeInstanceOf(Error);
    expect([error.status, error.message, error.data]).toEqual([
      401,
      "Session expired",
      { a: 1 },
    ]);
    expect(error.code).toBeUndefined();
  });
});

describe("toApiError", () => {
  it("reads the response body", async () => {
    const response = new Response(
      JSON.stringify({
        hasError: true,
        statusCode: 400,
        code: "validation_error",
        message: { general: ["Bad."], fields: {} },
        response: {},
        requestId: RID,
      }),
      { status: 400 },
    );

    const error = await toApiError(response, "/api/v1/projects/");

    expect([error.status, error.message, error.code, error.endpoint]).toEqual([
      400,
      "Bad.",
      "validation_error",
      "/api/v1/projects/",
    ]);
  });

  it("falls back when the body isn't JSON, such as a proxy's 413 page", async () => {
    const error = await toApiError(
      new Response("<html>Too large</html>", { status: 413 }),
    );

    expect(error.status).toBe(413);
    expect(error.message).toBe("Something went wrong. Please try again.");
  });

  it("uses a body the caller already read, and the caller's own message", async () => {
    const data = { hasError: true, message: { general: [] }, requestId: RID };

    const error = await toApiError(new Response(null, { status: 400 }), "/x/", {
      data,
      message: "Failed to upload cover image",
    });

    expect(error.message).toBe("Failed to upload cover image");
    expect(error.data).toBe(data);
    expect(error.requestId).toBe(RID);
  });
});
