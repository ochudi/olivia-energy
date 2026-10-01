import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  assertAdmin: vi.fn(),
  generateLink: vi.fn(),
  listUsers: vi.fn(),
  deleteUser: vi.fn(),
  upsert: vi.fn(),
  deleteProfile: vi.fn(),
  sendAdminLink: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/admin/auth", () => ({ assertAdmin: mocks.assertAdmin }));
vi.mock("@/lib/admin/links", () => ({
  adminLinkUrl: (properties: { hashed_token: string }) =>
    `https://admin.example.com/admin/auth/confirm?token_hash=${properties.hashed_token}`,
  sendAdminLink: mocks.sendAdminLink,
}));
vi.mock("@/lib/supabase/service", () => ({
  getServiceSupabase: () => ({
    from: () => ({
      upsert: mocks.upsert,
      delete: () => ({
        eq: (_column: string, id: string) => mocks.deleteProfile(id),
      }),
    }),
    auth: {
      admin: {
        generateLink: mocks.generateLink,
        listUsers: mocks.listUsers,
        deleteUser: mocks.deleteUser,
      },
    },
  }),
}));

import { inviteAdmin, removeMember } from "./team";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  mocks.assertAdmin.mockResolvedValue({ userId: "me" });
  mocks.generateLink.mockResolvedValue({
    data: {
      user: { id: "new-user" },
      properties: { hashed_token: "hash-1", verification_type: "invite" },
    },
    error: null,
  });
  mocks.listUsers.mockResolvedValue({ data: { users: [] }, error: null });
  mocks.upsert.mockResolvedValue({ error: null });
  mocks.deleteProfile.mockResolvedValue({ error: null });
  mocks.sendAdminLink.mockResolvedValue({ ok: true, id: "email-1" });
});

describe("inviteAdmin", () => {
  it("creates the account, grants the role and mails the link", async () => {
    const state = await inviteAdmin(null, form({ email: " New@Example.com " }));
    expect(mocks.generateLink).toHaveBeenCalledWith({
      type: "invite",
      email: "new@example.com",
    });
    expect(mocks.upsert).toHaveBeenCalledWith({
      id: "new-user",
      email: "new@example.com",
      role: "admin",
    });
    expect(mocks.sendAdminLink).toHaveBeenCalledWith(
      "invite",
      "new@example.com",
      expect.stringContaining("token_hash=hash-1"),
    );
    expect(state).toMatchObject({ ok: true });
    expect(state?.link).toBeUndefined();
  });

  it("hands the link to the admin when email delivery is not set up", async () => {
    mocks.sendAdminLink.mockResolvedValue({
      ok: false,
      reason: "unconfigured",
    });
    const state = await inviteAdmin(null, form({ email: "new@example.com" }));
    expect(state).toMatchObject({
      ok: true,
      link: expect.stringContaining("token_hash=hash-1"),
    });
  });

  it("grants the role to an existing account without issuing any link", async () => {
    mocks.generateLink.mockResolvedValue({
      data: { user: null, properties: null },
      error: { code: "email_exists", message: "already registered" },
    });
    mocks.listUsers.mockResolvedValue({
      data: { users: [{ id: "existing", email: "Known@Example.com" }] },
      error: null,
    });
    const state = await inviteAdmin(null, form({ email: "known@example.com" }));
    expect(mocks.upsert).toHaveBeenCalledWith({
      id: "existing",
      email: "known@example.com",
      role: "admin",
    });
    expect(mocks.sendAdminLink).not.toHaveBeenCalled();
    expect(state).toMatchObject({ ok: true });
    expect(state?.link).toBeUndefined();
  });

  it("refuses when the caller is not an admin", async () => {
    mocks.assertAdmin.mockRejectedValue(new Error("Not authorised"));
    await expect(
      inviteAdmin(null, form({ email: "new@example.com" })),
    ).rejects.toThrow("Not authorised");
    expect(mocks.generateLink).not.toHaveBeenCalled();
  });
});

describe("removeMember", () => {
  it("deletes the profile and never the Auth account", async () => {
    await removeMember(form({ id: "someone" }));
    expect(mocks.deleteProfile).toHaveBeenCalledWith("someone");
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("will not remove the caller", async () => {
    await expect(removeMember(form({ id: "me" }))).rejects.toThrow();
    expect(mocks.deleteProfile).not.toHaveBeenCalled();
  });
});
