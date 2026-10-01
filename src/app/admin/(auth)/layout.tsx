import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import { SkipLink } from "@/components/ui/skip-link";
import { Tag } from "@/components/ui/tag";

/** Centred card for sign-in and password screens. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <main
        id="content"
        tabIndex={-1}
        className="bg-canvas flex min-h-dvh flex-col items-center justify-center px-4 py-12 outline-none"
      >
        <div className="bg-surface border-line w-full max-w-sm rounded-sm border p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="focus-visible:ring-focus focus-visible:ring-offset-surface flex rounded-xs text-lg leading-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Logo />
            </Link>
            <Tag size="sm">Admin</Tag>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </>
  );
}
