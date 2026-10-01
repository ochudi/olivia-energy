import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  turnstileConfigured: vi.fn(),
  verifyTurnstile: vi.fn(),
  signInWithPassword: vi.fn(),
  resetPasswordForEmail: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`REDIRECT:${to}`);
  },
}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.9" }),
}));
vi.mock("@/lib/contact/turnstile", () => ({
  turnstileConfigured: mocks.turnstileConfigured,
  verifyTurnstile: mocks.verifyTurnstile,
}));
vi.mock("@/lib/seo/urls", () => ({
  siteUrl: () => "https://admin.example.com",
}));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: async () => ({
    auth: {
      signInWithPassword: mocks.signInWithPassword,
      resetPasswordForEmail: mocks.resetPasswordForEmail,
    },
  }),
}));

import { requestPasswordReset, signIn } from "./auth";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  mocks.turnstileConfigured.mockReturnValue(false);
  mocks.verifyTurnstile.mockResolvedValue({ ok: true });
  mocks.signInWithPassword.mockResolvedValue({ error: null });
  mocks.resetPasswordForEmail.mockResolvedValue({ error: null });
});

describe("signIn", () => {
  it("rejects an incomplete form without touching Supabase", async () => {
    const state = await signIn(null, form({ email: "not-an-email" }));
    expect(state).toMatchObject({ ok: false });
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it("signs in and redirects when Turnstile is not configured", async () => {
    await expect(
      signIn(
        null,
        form({
          email: "a@example.com",
          password: "secret1",
          next: "/admin/inbox",
        }),
      ),
    ).rejects.toThrow("REDIRECT:/admin/inbox");
    expect(mocks.verifyTurnstile).not.toHaveBeenCalled();
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "a@example.com",
      password: "secret1",
      options: undefined,
    });
  });

  it("verifies Turnstile first and never calls Supabase when it fails", async () => {
    mocks.turnstileConfigured.mockReturnValue(true);
    mocks.verifyTurnstile.mockResolvedValue({ ok: false, codes: ["invalid"] });
    const state = await signIn(
      null,
      form({
        email: "a@example.com",
        password: "secret1",
        "cf-turnstile-response": "tok",
      }),
    );
    expect(state).toMatchObject({
      ok: false,
      message: expect.stringContaining("verify"),
    });
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it("passes a verified Turnstile token through as captchaToken", async () => {
    mocks.turnstileConfigured.mockReturnValue(true);
    mocks.verifyTurnstile.mockResolvedValue({ ok: true });
    await expect(
      signIn(
        null,
        form({
          email: "a@example.com",
          password: "secret1",
          "cf-turnstile-response": "tok-1",
        }),
      ),
    ).rejects.toThrow("REDIRECT:/admin");
    expect(mocks.verifyTurnstile).toHaveBeenCalledWith("tok-1", "203.0.113.9");
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "a@example.com",
      password: "secret1",
      options: { captchaToken: "tok-1" },
    });
  });

  it("keeps the generic message for bad credentials", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      error: { status: 400, message: "Invalid login credentials" },
    });
    const state = await signIn(
      null,
      form({ email: "a@example.com", password: "wrong" }),
    );
    expect(state).toMatchObject({
      ok: false,
      message: "That email and password do not match.",
    });
  });

  it("names a rate limit distinctly", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      error: { status: 429, message: "rate limited" },
    });
    const state = await signIn(
      null,
      form({ email: "a@example.com", password: "wrong" }),
    );
    expect(state).toMatchObject({
      ok: false,
      message: expect.stringMatching(/too many/i),
    });
  });

  it("names an outage distinctly for a 5xx", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      error: { status: 503, message: "down" },
    });
    const state = await signIn(
      null,
      form({ email: "a@example.com", password: "wrong" }),
    );
    expect(state).toMatchObject({
      ok: false,
      message: expect.stringMatching(/unavailable/i),
    });
  });

  it("names an outage distinctly for a network failure with no status", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      error: { status: undefined, message: "network" },
    });
    const state = await signIn(
      null,
      form({ email: "a@example.com", password: "wrong" }),
    );
    expect(state).toMatchObject({
      ok: false,
      message: expect.stringMatching(/unavailable/i),
    });
  });
});

describe("requestPasswordReset", () => {
  it("answers with the same neutral message for any address", async () => {
    const state = await requestPasswordReset(
      null,
      form({ email: "person@example.com" }),
    );
    expect(state).toMatchObject({
      ok: true,
      message: expect.stringContaining("If that address"),
    });
    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith(
      "person@example.com",
      expect.objectContaining({
        redirectTo: expect.stringContaining("/admin/auth/callback"),
      }),
    );
  });

  it("still answers neutrally, without calling Supabase, when Turnstile rejects the token", async () => {
    mocks.turnstileConfigured.mockReturnValue(true);
    mocks.verifyTurnstile.mockResolvedValue({ ok: false, codes: ["invalid"] });
    const state = await requestPasswordReset(
      null,
      form({ email: "person@example.com", "cf-turnstile-response": "bad" }),
    );
    expect(state).toMatchObject({ ok: true });
    expect(mocks.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("passes a verified token through as captchaToken", async () => {
    mocks.turnstileConfigured.mockReturnValue(true);
    mocks.verifyTurnstile.mockResolvedValue({ ok: true });
    await requestPasswordReset(
      null,
      form({ email: "person@example.com", "cf-turnstile-response": "tok-2" }),
    );
    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith(
      "person@example.com",
      expect.objectContaining({ captchaToken: "tok-2" }),
    );
  });

  it("rejects a malformed address before ever reaching Supabase", async () => {
    const state = await requestPasswordReset(
      null,
      form({ email: "not-an-email" }),
    );
    expect(state).toMatchObject({ ok: false });
    expect(mocks.resetPasswordForEmail).not.toHaveBeenCalled();
  });
});
