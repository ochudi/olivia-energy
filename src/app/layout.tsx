import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SEO } from "@/content/seo";
import { SITE } from "@/content/site";
import { siteUrl } from "@/lib/seo/urls";
import {
  displayFont,
  displayItalicFont,
  sansFont,
  sansItalicFont,
} from "./fonts";
import "./globals.css";

/**
 * Site-wide defaults. Pages set their own title, description, canonical and
 * social copy through pageMetadata(); the default social image comes from
 * app/opengraph-image.tsx and the article one from its own route.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: SEO.home.title,
    template: `%s${SEO.suffix}`,
  },
  description: SEO.home.description,
  applicationName: SITE.name,
  openGraph: { type: "website", siteName: SITE.name, locale: "en_US" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

/**
 * The site has one, light palette. Declaring it stops browsers in dark mode
 * from restyling form controls and scrollbars, and colours the browser chrome
 * on phones to match the canvas.
 */
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#faf7f3",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${displayFont.variable} ${displayItalicFont.variable} ${sansFont.variable} ${sansItalicFont.variable}`}
    >
      <body className="bg-canvas text-ink flex min-h-dvh flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
