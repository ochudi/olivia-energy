import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { SetPasswordForm } from "./set-password-form";

export const metadata: Metadata = { title: "Set password" };

export default async function Page() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return (
    <>
      <h1 className="font-display text-display-xs font-normal">
        Choose a password
      </h1>
      <p className="text-ink-muted mt-1 text-sm">
        Signed in as {session.email}. Set the password you will use from now on.
      </p>
      <div className="mt-6">
        <SetPasswordForm />
      </div>
    </>
  );
}
