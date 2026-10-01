import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  turnstileConfigured: vi.fn(),
  verifyTurnstile: vi.fn(),
  signInWithPassword: vi.fn(),
  verifyOtp: vi.fn(),
  memberLookup: vi.fn(),
  getUserById: vi.fn(),
  generateLink: vi.fn(),
  sendAdminLink: vi.fn(),
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
vi.mock("@/lib/admin/links", () => ({
  adminLinkUrl: (properties: { hashed_token: string }) =>
    `https://admin.example.com/admin/auth/confirm?token_hash=${properties.hashed_token}`,
  sendAdminLink: mocks.sendAdminLink,
}));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: async () => ({
    auth: {
      signInWithPassword: mocks.signInWithPassword,
      verifyOtp: mocks.verifyOtp,
    },
  }),
}));
vi.mock("@/lib/supabase/service", () => ({
  getServiceSupabase: () => ({
    from: () => ({
      select: () => ({
        eq: (_column: string, email: string) => ({
          maybeSingle: () => mocks.memberLookup(email),
        }),
      }),
    }),
    auth: {
      admin: {
        getUserById: mocks.getUserById,
        generateLink: mocks.generateLink,
      },
    },
  }),
}));

import { confirmLink, requestPasswordReset, signIn } from "./auth";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  mocks.turnstileConfigured.mockReturnValue(false);
  mocks.verifyTurnstile.mockResolvedValue({ ok: true });
  mocks.signInWithPassword.mockResolvedValue({ error: null });
  mocks.verifyOtp.mockResolvedValue({ error: null });
  mocks.memberLookup.mockResolvedValue({ data: { id: "user-1" } });
  mocks.getUserById.mockResolvedValue({
    data: { user: { id: "user-1", recovery_sent_at: null } },
  });
  mocks.generateLink.mockResolvedValue({
    data: {
      properties: { hashed_token: "hash-1", verification_type: "recovery" },
    },
    error: null,
  });
  mocks.sendAdminLink.mockResolvedValue({ ok: true, id: "email-1" });
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

  it("signs in once Turnstile verifies, without forwarding the spent token", async () => {
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

describe("confirmLink", () => {
  it("verifies the token and continues to the set-password screen", async () => {
    await expect(
      confirmLink(form({ token_hash: "hash-1", type: "invite" })),
    ).rejects.toThrow("REDIRECT:/admin/set-password");
    expect(mocks.verifyOtp).toHaveBeenCalledWith({
      token_hash: "hash-1",
      type: "invite",
    });
  });

  it("sends a spent or expired link back to sign-in", async () => {
    mocks.verifyOtp.mockResolvedValue({ error: { message: "expired" } });
    await expect(
      confirmLink(form({ token_hash: "hash-1", type: "recovery" })),
    ).rejects.toThrow("REDIRECT:/admin/login?error=link");
  });

  it("refuses a missing token or an unexpected type without calling Supabase", async () => {
    await expect(confirmLink(form({ type: "invite" }))).rejects.toThrow(
      "REDIRECT:/admin/login?error=link",
    );
    await expect(
      confirmLink(form({ token_hash: "hash-1", type: "magiclink" })),
    ).rejects.toThrow("REDIRECT:/admin/login?error=link");
    expect(mocks.verifyOtp).not.toHaveBeenCalled();
  });
});

describe("requestPasswordReset", () => {
  const neutral = {
    ok: true,
    message: expect.stringContaining("If that address"),
  };

  it("mails a member a one-time link to this site's own confirm page", async () => {
    const state = await requestPasswordReset(
      null,
      form({ email: "Person@Example.com" }),
    );
    expect(state).toMatchObject(neutral);
    expect(mocks.memberLookup).toHaveBeenCalledWith("person@example.com");
    expect(mocks.generateLink).toHaveBeenCalledWith({
      type: "recovery",
      email: "person@example.com",
    });
    expect(mocks.sendAdminLink).toHaveBeenCalledWith(
      "recovery",
      "person@example.com",
      expect.stringContaining("/admin/auth/confirm?token_hash=hash-1"),
    );
  });

  it("answers the same way, and sends nothing, for an address that is not a member", async () => {
    mocks.memberLookup.mockResolvedValue({ data: null });
    const state = await requestPasswordReset(
      null,
      form({ email: "other-app-user@example.com" }),
    );
    expect(state).toMatchObject(neutral);
    expect(mocks.generateLink).not.toHaveBeenCalled();
    expect(mocks.sendAdminLink).not.toHaveBeenCalled();
  });

  it("sends at most one link a minute to the same member", async () => {
    mocks.getUserById.mockResolvedValue({
      data: {
        user: { id: "user-1", recovery_sent_at: new Date().toISOString() },
      },
    });
    const state = await requestPasswordReset(
      null,
      form({ email: "person@example.com" }),
    );
    expect(state).toMatchObject(neutral);
    expect(mocks.generateLink).not.toHaveBeenCalled();
  });

  it("still answers neutrally, without touching Supabase, when Turnstile rejects the token", async () => {
    mocks.turnstileConfigured.mockReturnValue(true);
    mocks.verifyTurnstile.mockResolvedValue({ ok: false, codes: ["invalid"] });
    const state = await requestPasswordReset(
      null,
      form({ email: "person@example.com", "cf-turnstile-response": "bad" }),
    );
    expect(state).toMatchObject(neutral);
    expect(mocks.memberLookup).not.toHaveBeenCalled();
    expect(mocks.generateLink).not.toHaveBeenCalled();
  });

  it("answers neutrally when the lookup or the mail fails", async () => {
    mocks.generateLink.mockRejectedValue(new Error("network"));
    const state = await requestPasswordReset(
      null,
      form({ email: "person@example.com" }),
    );
    expect(state).toMatchObject(neutral);
    expect(mocks.sendAdminLink).not.toHaveBeenCalled();
  });

  it("rejects a malformed address before ever reaching Supabase", async () => {
    const state = await requestPasswordReset(
      null,
      form({ email: "not-an-email" }),
    );
    expect(state).toMatchObject({ ok: false });
    expect(mocks.memberLookup).not.toHaveBeenCalled();
  });
});
