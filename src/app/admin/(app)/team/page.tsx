import type { Metadata } from "next";
import { Notice, PageHeader, Table, Td, Th, Tr } from "@/components/admin";
import { InviteForm } from "@/components/admin/invite-form";
import { Tag } from "@/components/ui/tag";
import { removeMember, setRole } from "@/lib/admin/actions/team";
import { requireAdmin } from "@/lib/admin/auth";
import { formatDate } from "@/lib/insights/text";
import { createServerSupabase } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Team" };

/** Token easing + unified focus ring + a 1px press, for small text controls. */
const controlPolish =
  "rounded-xs transition-colors duration-instant ease-standard active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

export default async function Page() {
  const session = await requireAdmin();
  const supabase = await createServerSupabase();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  return (
    <>
      <PageHeader
        title="Team"
        description="Admins can publish, edit settings and read the inbox. Editors have no access until promoted."
      />
      {error ? (
        <Notice tone="error" className="mb-4">
          {error.message}
        </Notice>
      ) : null}
      <Table>
        <thead>
          <tr>
            <Th>Member</Th>
            <Th className="w-28">Role</Th>
            <Th className="hidden w-36 md:table-cell">Joined</Th>
            <Th className="w-56">
              <span className="sr-only">Actions</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {(profiles ?? []).map((p) => {
            const me = p.id === session.userId;
            return (
              <Tr key={p.id}>
                <Td>
                  <span className="font-medium">
                    {p.full_name ?? p.email ?? p.id}
                  </span>
                  {p.full_name && p.email ? (
                    <span className="text-ink-muted block text-xs">
                      {p.email}
                    </span>
                  ) : null}
                  {me ? (
                    <span className="text-ink-subtle block text-xs">You</span>
                  ) : null}
                </Td>
                <Td>
                  <Tag variant={p.role === "admin" ? "primary" : "outline"}>
                    {p.role}
                  </Tag>
                </Td>
                <Td className="text-ink-muted hidden font-mono text-xs tabular-nums md:table-cell">
                  {formatDate(p.created_at, "short")}
                </Td>
                <Td>
                  {me ? null : (
                    <div className="flex items-center justify-end gap-4 text-xs">
                      <form action={setRole}>
                        <input type="hidden" name="id" value={p.id} />
                        <input
                          type="hidden"
                          name="role"
                          value={p.role === "admin" ? "editor" : "admin"}
                        />
                        <button
                          type="submit"
                          className={cn(
                            "text-ink-muted hover:text-ink",
                            controlPolish,
                          )}
                        >
                          {p.role === "admin" ? "Make editor" : "Make admin"}
                        </button>
                      </form>
                      <form action={removeMember}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className={cn(
                            "text-ink-muted hover:text-accent hit-area",
                            controlPolish,
                          )}
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  )}
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
      <div className="mt-8">
        <InviteForm />
      </div>
    </>
  );
}
