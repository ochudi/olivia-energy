"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Notice, PageHeader } from "@/components/admin";
import { ADMIN_ERROR } from "@/content/errors";

/** Route error boundary for the admin shell (sidebar and header stay put). */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <PageHeader title={ADMIN_ERROR.title} />
      <Notice tone="error">
        {ADMIN_ERROR.lede}
        {error.digest ? (
          <span className="mt-1 block font-mono text-xs">
            {ADMIN_ERROR.reference} {error.digest}
          </span>
        ) : null}
      </Notice>
      <div className="mt-4 flex items-center gap-3">
        <Button size="sm" onClick={reset}>
          {ADMIN_ERROR.actions.retry}
        </Button>
        <Button size="sm" variant="secondary" href="/admin">
          {ADMIN_ERROR.actions.home}
        </Button>
      </div>
    </>
  );
}
