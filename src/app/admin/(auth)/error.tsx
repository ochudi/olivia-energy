"use client";

import { useEffect } from "react";
import { Notice } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { ADMIN_ERROR } from "@/content/errors";

/** Route error boundary for the sign-in / password screens' card. */
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
    <div className="flex flex-col gap-4">
      <Notice tone="error">
        {ADMIN_ERROR.lede}
        {error.digest ? (
          <span className="mt-1 block font-mono text-xs">
            {ADMIN_ERROR.reference} {error.digest}
          </span>
        ) : null}
      </Notice>
      <Button size="sm" onClick={reset} className="self-start">
        {ADMIN_ERROR.actions.retry}
      </Button>
    </div>
  );
}
