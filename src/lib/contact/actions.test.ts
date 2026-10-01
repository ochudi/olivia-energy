import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  insert: vi.fn(),
  verifyTurnstile: vi.fn(),
  sendContactEmail: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }),
}));
vi.mock("@/lib/supabase/env", () => ({ isSupabaseConfigured: () => true }));
vi.mock("@/lib/supabase/service", () => ({
  getServiceSupabase: () => ({ from: () => ({ insert: mocks.insert }) }),
}));
vi.mock("@/lib/supabase/queries", () => ({
  getSettings: async () => ({ contact_email: "inbox@example.com" }),
}));
vi.mock("./turnstile", () => ({
  turnstileConfigured: () => true,
  verifyTurnstile: mocks.verifyTurnstile,
}));
vi.mock("./email", () => ({ sendContactEmail: mocks.sendContactEmail }));

import { submitContact, type ContactState } from "./actions";

const idle: ContactState = { status: "idle" };

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const valid = {
  name: " Ada Okafor ",
  email: " Ada@Example.com ",
  organization: "",
  message:
    "We are weighing a gas-to-power investment and need a view on tariffs.",
  "cf-turnstile-response": "token-1",
};

beforeEach(() => {
  mocks.insert.mockResolvedValue({ error: null });
  mocks.verifyTurnstile.mockResolvedValue({ ok: true });
  mocks.sendContactEmail.mockResolvedValue({ ok: true, id: "email-1" });
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("submitContact", () => {
  it("rejects invalid input with one message per field and stores nothing", async () => {
    const state = await submitContact(
      idle,
      form({ name: "A", email: "nope", message: "short" }),
    );
    expect(state).toMatchObject({
      status: "error",
      reason: "invalid",
      errors: {
        name: expect.any(String),
        email: expect.any(String),
        message: expect.any(String),
      },
    });
    expect(mocks.verifyTurnstile).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("verifies the token with the caller's IP, stores the normalised message, then emails the inbox with reply-to set to the sender", async () => {
    const state = await submitContact(idle, form(valid));
    expect(state).toMatchObject({
      status: "success",
      name: "Ada Okafor",
      email: "ada@example.com",
    });
    expect(mocks.verifyTurnstile).toHaveBeenCalledWith(
      "token-1",
      "203.0.113.7",
    );
    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        name: "Ada Okafor",
        email: "ada@example.com",
        organization: null,
        message: valid.message,
        turnstile_score: 1,
      }),
    );
    expect(mocks.sendContactEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "inbox@example.com",
        name: "Ada Okafor",
        email: "ada@example.com",
      }),
    );
  });

  it("refuses a submission Cloudflare does not verify and stores nothing", async () => {
    mocks.verifyTurnstile.mockResolvedValue({
      ok: false,
      codes: ["invalid-input-response"],
    });
    const state = await submitContact(idle, form(valid));
    expect(state).toMatchObject({ status: "error", reason: "turnstile" });
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.sendContactEmail).not.toHaveBeenCalled();
  });

  it("maps the database rate limit (PT429) to the rate-limited state without emailing", async () => {
    mocks.insert.mockResolvedValue({
      error: { code: "PT429", message: "rate_limited" },
    });
    const state = await submitContact(idle, form(valid));
    expect(state).toMatchObject({ status: "error", reason: "rate_limited" });
    expect(mocks.sendContactEmail).not.toHaveBeenCalled();
  });

  it("reports other database failures as a server error", async () => {
    mocks.insert.mockResolvedValue({
      error: { code: "42501", message: "permission denied" },
    });
    const state = await submitContact(idle, form(valid));
    expect(state).toMatchObject({ status: "error", reason: "server" });
  });

  it("treats a filled honeypot as a silent success and stores nothing", async () => {
    const state = await submitContact(
      idle,
      form({ ...valid, website: "http://spam.example" }),
    );
    expect(state.status).toBe("success");
    expect(mocks.verifyTurnstile).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("still succeeds when the email cannot be sent, because the message is already stored", async () => {
    mocks.sendContactEmail.mockResolvedValue({ ok: false, reason: "failed" });
    const state = await submitContact(idle, form(valid));
    expect(state.status).toBe("success");
    expect(mocks.insert).toHaveBeenCalledTimes(1);
  });
});
