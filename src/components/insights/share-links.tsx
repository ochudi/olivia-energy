import { cn } from "@/lib/utils/cn";
import { CopyLinkButton } from "./copy-link-button";

const linkClass =
  "hit-area tap text-ink hover:text-primary active:text-primary-hover duration-fast ease-standard underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-current";

/**
 * Share row as text links: LinkedIn, X, Email, Copy link, named for
 * assistive technology ("Share on LinkedIn, opens in a new tab", "Share by
 * email"). Copy link is the CopyLinkButton in its text form, which swaps its label to "Copied"
 * for two seconds and announces it.
 */
export function ShareLinks({
  url,
  title,
  className,
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const enc = encodeURIComponent;
  const links = [
    {
      label: "LinkedIn",
      verb: "Share on",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    },
    {
      label: "X",
      verb: "Share on",
      href: `https://x.com/intent/post?text=${enc(title)}&url=${enc(url)}`,
    },
    {
      label: "Email",
      verb: "Share by",
      href: `mailto:?subject=${enc(title)}&body=${enc(url)}`,
    },
  ];
  return (
    <div
      className={cn("flex flex-wrap items-baseline gap-x-4 gap-y-2", className)}
    >
      <p
        id="share-label"
        className="text-ink-muted font-sans text-sm font-medium"
      >
        Share
      </p>
      <ul
        aria-labelledby="share-label"
        className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm"
      >
        {links.map((link) => {
          const external = link.href.startsWith("http");
          return (
            <li key={link.label}>
              <a
                href={link.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className={cn(
                  linkClass,
                  // A one-letter label ("X") still gets a 24px target.
                  link.label.length <= 2 && "inline-block min-w-6 text-center",
                )}
              >
                <span className="sr-only">{`${link.verb} `}</span>
                {link.verb === "Share by" ? (
                  <>
                    <span aria-hidden="true">{link.label}</span>
                    <span className="sr-only">email</span>
                  </>
                ) : (
                  link.label
                )}
                {external ? (
                  <span className="sr-only">, opens in a new tab</span>
                ) : null}
              </a>
            </li>
          );
        })}
        <li>
          <CopyLinkButton url={url} label="Copy link" className={linkClass} />
        </li>
      </ul>
    </div>
  );
}
