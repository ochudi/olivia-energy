"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileStatus =
  "loading" | "ready" | "solved" | "expired" | "error" | "unavailable";

export type TurnstileWidgetProps = {
  siteKey: string;
  /** Called with a fresh token, or null when it expires or fails. */
  onToken: (token: string | null) => void;
  onStatus?: (status: TurnstileStatus) => void;
  /** Bump to reset the widget (tokens are single-use). */
  resetKey?: number;
  className?: string;
};

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Cloudflare Turnstile, rendered explicitly so the form owns the token and
 * can reset the widget after a server-side rejection. Survives remounts
 * (the script loads once) and reports when it cannot load at all.
 */
export function TurnstileWidget({
  siteKey,
  onToken,
  onStatus,
  resetKey = 0,
  className,
}: TurnstileWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [status, setStatus] = useState<TurnstileStatus>("loading");

  const render = useCallback(() => {
    const api = window.turnstile;
    if (!container.current || !api || widgetId.current) return;
    widgetId.current = api.render(container.current, {
      sitekey: siteKey,
      action: "contact",
      theme: "light",
      // The flexible widget is 300px at minimum; on the narrowest phones
      // that overflows the form card, so those get the compact widget.
      size: window.innerWidth < 372 ? "compact" : "flexible",
      callback: (token: string) => {
        setStatus("solved");
        onToken(token);
      },
      "expired-callback": () => {
        setStatus("expired");
        onToken(null);
      },
      "timeout-callback": () => {
        setStatus("expired");
        onToken(null);
      },
      "error-callback": () => {
        setStatus("error");
        onToken(null);
        return true;
      },
    });
    setStatus((current) => (current === "loading" ? "ready" : current));
  }, [siteKey, onToken]);

  useEffect(() => {
    if (scriptReady || window.turnstile) render();
  }, [scriptReady, render]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!window.turnstile) setStatus("unavailable");
    }, 10000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!resetKey) return;
    const api = window.turnstile;
    if (api && widgetId.current) {
      api.reset(widgetId.current);
      onToken(null);
      setStatus("ready");
    }
  }, [resetKey, onToken]);

  useEffect(() => {
    onStatus?.(status);
  }, [status, onStatus]);

  useEffect(
    () => () => {
      const api = window.turnstile;
      if (api && widgetId.current) {
        api.remove(widgetId.current);
        widgetId.current = null;
      }
    },
    [],
  );

  return (
    <>
      <Script
        src={SCRIPT_SRC}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => setStatus("unavailable")}
      />
      <div ref={container} className={className} />
    </>
  );
}
