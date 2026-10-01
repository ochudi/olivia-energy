import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { isPublicAdminPath, safeNext } from "@/lib/admin/paths";

const mocks = vi.hoisted(() => ({ updateSession: vi.fn() }));
vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: mocks.updateSession,
}));

import { proxy } from "./proxy";

const request = (
  path: string,
  init?: ConstructorParameters<typeof NextRequest>[1],
) => new NextRequest(new URL(path, "http://localhost:3000"), init);
const location = (response: Response) =>
  new URL(response.headers.get("location") ?? "", "http://localhost:3000");

const signedOut = () => ({
  response: NextResponse.next(),
  user: null,
  configured: true,
});
const signedIn = () => ({
  response: NextResponse.next(),
  user: { id: "user-1" },
  configured: true,
});

beforeEach(() => {
  mocks.updateSession.mockImplementation(async () => signedOut());
});

describe("admin route guard", () => {
  it("sends a signed-out visitor to the login page and remembers where they were going", async () => {
    const response = await proxy(request("/admin/articles/abc?tab=seo"));
    expect(response.status).toBe(307);
    const to = location(response);
    expect(to.pathname).toBe("/admin/login");
    expect(to.searchParams.get("next")).toBe("/admin/articles/abc?tab=seo");
  });

  it("locks every method, not only GET", async () => {
    for (const method of ["POST", "PUT", "DELETE"]) {
      const response = await proxy(request("/admin/settings", { method }));
      expect(response.status).toBe(307);
      expect(location(response).pathname).toBe("/admin/login");
    }
  });

  it("lets a signed-out visitor reach the login page, the reset-password page, and the auth callback", async () => {
    for (const path of [
      "/admin/login",
      "/admin/reset",
      "/admin/auth/callback?code=abc",
    ]) {
      const response = await proxy(request(path));
      expect(response.status).toBe(200);
    }
  });

  it("keeps the password-reset and no-access screens behind a session", async () => {
    for (const path of ["/admin/set-password", "/admin/no-access"]) {
      const response = await proxy(request(path));
      expect(location(response).pathname).toBe("/admin/login");
    }
  });

  it("sends a signed-in user away from the login page", async () => {
    mocks.updateSession.mockImplementation(async () => signedIn());
    const response = await proxy(request("/admin/login"));
    expect(response.status).toBe(307);
    expect(location(response).pathname).toBe("/admin");
  });

  it("passes a signed-in user through with the refreshed session response", async () => {
    mocks.updateSession.mockImplementation(async () => signedIn());
    const response = await proxy(request("/admin/inbox"));
    expect(response.status).toBe(200);
  });

  it("explains a missing Supabase configuration instead of failing open", async () => {
    mocks.updateSession.mockImplementation(async () => ({
      response: NextResponse.next(),
      user: null,
      configured: false,
    }));
    const response = await proxy(request("/admin/articles"));
    const to = location(response);
    expect(to.pathname).toBe("/admin/login");
    expect(to.searchParams.get("error")).toBe("unconfigured");
    expect((await proxy(request("/admin/login"))).status).toBe(200);
  });
});

describe("post-login redirect target", () => {
  it("only ever points inside the admin", () => {
    expect(safeNext(null)).toBe("/admin");
    expect(safeNext("/admin/inbox?filter=unread")).toBe(
      "/admin/inbox?filter=unread",
    );
    expect(safeNext("/insights")).toBe("/admin");
    expect(safeNext("https://evil.example/admin")).toBe("/admin");
    expect(safeNext("//evil.example/admin")).toBe("/admin");
  });

  it("knows which admin paths are public", () => {
    expect(isPublicAdminPath("/admin/login")).toBe(true);
    expect(isPublicAdminPath("/admin/reset")).toBe(true);
    expect(isPublicAdminPath("/admin/auth/callback")).toBe(true);
    expect(isPublicAdminPath("/admin/loginx")).toBe(false);
    expect(isPublicAdminPath("/admin/resetx")).toBe(false);
    expect(isPublicAdminPath("/admin")).toBe(false);
  });
});
