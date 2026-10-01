import { ExternalLink, LogOut } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import { Tag } from "@/components/ui/tag";
import { signOut } from "@/lib/admin/actions/auth";
import { cn } from "@/lib/utils/cn";
import { AdminNav } from "./admin-nav";

/** Token easing + unified focus ring + a 1px press, for small text/icon controls. */
const controlPolish =
  "rounded-xs transition-colors duration-instant ease-standard active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

/**
 * Admin frame: sidebar (wordmark, nav, account) and a dense main column.
 * Below `lg` the sidebar collapses to a top bar with a scrolling nav row.
 */
export function AdminShell({
  email,
  unread,
  children,
}: {
  email: string | null;
  unread?: number;
  children: ReactNode;
}) {
  return (
    <div className="bg-canvas text-ink flex min-h-dvh flex-col lg:flex-row">
      <aside className="border-line bg-surface flex shrink-0 flex-col gap-4 border-b px-4 py-4 lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:border-r lg:border-b-0 lg:px-4 lg:py-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/admin"
            className="focus-visible:ring-focus focus-visible:ring-offset-surface flex rounded-xs text-lg leading-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Tag size="sm">Admin</Tag>
            <form action={signOut} className="lg:hidden">
              <button
                type="submit"
                aria-label="Sign out"
                title={email ? `Sign out ${email}` : "Sign out"}
                className={cn(
                  "text-ink-muted hover:text-ink inline-flex size-8 items-center justify-center",
                  controlPolish,
                )}
              >
                <LogOut aria-hidden className="size-4" />
              </button>
            </form>
          </div>
        </div>
        <AdminNav unread={unread} />
        <div className="border-line mt-auto hidden flex-col gap-2 border-t pt-4 lg:flex">
          <p
            className="text-ink-muted truncate text-xs"
            title={email ?? undefined}
          >
            {email}
          </p>
          <div className="flex items-center justify-between gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className={cn(
                "text-ink-muted hover:text-ink hit-area inline-flex items-center gap-1.5 text-xs",
                controlPolish,
              )}
            >
              View site
              <ExternalLink aria-hidden className="size-3.5" />
            </a>
            <form action={signOut}>
              <button
                type="submit"
                className={cn(
                  "text-ink-muted hover:text-ink hit-area inline-flex items-center gap-1.5 text-xs",
                  controlPolish,
                )}
              >
                <LogOut aria-hidden className="size-3.5" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main
        id="content"
        className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8"
      >
        <div className="mx-auto w-full max-w-[72rem]">{children}</div>
      </main>
    </div>
  );
}
