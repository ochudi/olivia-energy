import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/seo/urls", () => ({
  siteUrl: () => "https://admin.example.com",
  absoluteUrl: (path: string) => `https://admin.example.com${path}`,
}));
vi.mock("@/lib/email/send", () => ({
  escapeHtml: (text: string) => text,
  sendEmail: vi.fn(),
}));

import { adminLinkUrl } from "./links";

describe("adminLinkUrl", () => {
  it("opens the confirm page, which verifies on a button press, not the callback route", () => {
    const url = new URL(
      adminLinkUrl({ hashed_token: "hash/1+", verification_type: "invite" }),
    );
    expect(url.origin).toBe("https://admin.example.com");
    expect(url.pathname).toBe("/admin/auth/confirm");
    expect(url.searchParams.get("token_hash")).toBe("hash/1+");
    expect(url.searchParams.get("type")).toBe("invite");
  });
});
