import type { NextConfig } from "next";
import path from "node:path";
import embedHosts from "./src/lib/insights/embed-hosts.json";

const production = process.env.NODE_ENV === "production";
// Vercel preview deployments inject the feedback toolbar from vercel.live;
// a strict policy would break it, so previews get the other headers only.
const strictCsp = production && process.env.VERCEL_ENV !== "preview";

/**
 * The Supabase project behind this deployment, from NEXT_PUBLIC_SUPABASE_URL.
 * Both the image optimiser and the CSP are limited to it, so nobody can run
 * their own bucket through this site's image pipeline. Without the variable
 * (a bare `next build`), any hosted Supabase project is allowed.
 */
const supabase = (() => {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    return {
      origin: url.origin,
      hostname: url.hostname,
      protocol: url.protocol,
    };
  } catch {
    return null;
  }
})();
const supabaseOrigin = supabase?.origin ?? "https://*.supabase.co";
const siteIsHttps = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://").startsWith(
  "https://",
);

/**
 * Content-Security-Policy. Inline scripts stay allowed: Next.js hydrates
 * with inline data scripts, and a per-request nonce would force every page
 * to render dynamically and give up static rendering. The policy still
 * confines scripts, connections, frames and images to the hosts the site
 * actually uses: Cloudflare Turnstile on the contact form, Supabase for
 * data and media, and the embed hosts an article may use.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin}`,
  "font-src 'self'",
  `connect-src 'self' ${supabaseOrigin} https://challenges.cloudflare.com`,
  `frame-src https://challenges.cloudflare.com ${embedHosts
    .map((host) => `https://${host}`)
    .join(" ")}`,
  `media-src 'self' ${supabaseOrigin}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(siteIsHttps ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  // Two years, subdomains included; no `preload`, which is a one-way door
  // the client should choose knowingly (hstspreload.org).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  ...(strictCsp ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const nextConfig: NextConfig = {
  // Pin the workspace root so Next.js does not infer it from a stray
  // lockfile in a parent directory.
  turbopack: {
    root: path.resolve(__dirname),
  },
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    // Post covers and inline images come from this project's "media" bucket.
    // The local entries cover `supabase start` and other local stacks.
    remotePatterns: [
      {
        protocol: supabase?.protocol === "http:" ? "http" : "https",
        hostname: supabase?.hostname ?? "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      ...(production
        ? []
        : [
            { protocol: "http" as const, hostname: "127.0.0.1" },
            { protocol: "http" as const, hostname: "localhost" },
          ]),
    ],
    // Next.js 16 refuses to optimise images served from local IPs. The
    // local Supabase stack lives on 127.0.0.1, so allow it outside
    // production only; hosted projects serve covers from *.supabase.co.
    dangerouslyAllowLocalIP: !production,
    // Photographs are served at 60 (see CoverImage and PhotoFigure); 75 stays
    // for anything that does not pass a quality.
    qualities: [60, 75],
  },
};

export default nextConfig;
