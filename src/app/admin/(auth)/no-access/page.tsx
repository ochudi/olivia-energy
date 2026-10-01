import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/admin/actions/auth";
import { getAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "No access" };

export default async function Page() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.isAdmin) redirect("/admin");
  return (
    <>
      <h1 className="font-display text-display-xs font-normal">
        No admin access
      </h1>
      <p className="text-ink-muted mt-2 text-sm leading-relaxed">
        {session.email} is signed in but is not an admin. Ask an existing admin
        to grant access from the Team page.
      </p>
      <form action={signOut} className="mt-6">
        <Button type="submit" variant="secondary" size="sm">
          Sign out
        </Button>
      </form>
    </>
  );
}
