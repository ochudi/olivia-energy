import type { JSONContent } from "@tiptap/react";
import { getImageProps } from "next/image";
import type { ReactNode } from "react";
import { getMediaUrl } from "@/lib/supabase/queries";
import embedHosts from "@/lib/insights/embed-hosts.json";
import { typeset } from "@/lib/insights/text";

/**
 * Renders a Tiptap JSON document as semantic HTML inside <Prose>.
 *
 * Supported: paragraph, heading (2–4), text with bold / italic / underline /
 * strike / code / link marks, bullet and ordered lists, blockquote (set as a
 * pull quote by prose.css), code block, horizontal rule, hard break, image
 * (figure with caption), YouTube and generic iframe embeds from an
 * allow-list of hosts, and simple tables. Unknown nodes render their
 * children so a new extension never blanks a page.
 *
 * Everything here is server-rendered: no client JavaScript is shipped for
 * the body.
 */
export function TiptapContent({ doc }: { doc: JSONContent }) {
  return <>{renderNodes(doc.content)}</>;
}

/**
 * Hosts an article may embed. next.config.ts reads the same file for the
 * Content-Security-Policy frame-src list, so the two can never disagree.
 */
const EMBED_HOSTS: readonly string[] = embedHosts;

/**
 * `verbatim` is set inside a code block, where quotation marks stay as
 * typed. Elsewhere text is typeset; `before` and `after` carry the
 * neighbouring text nodes' nearest characters, so a quotation that closes
 * after a bold or linked run, or opens just before one, is set correctly.
 */
function renderNodes(
  nodes: JSONContent[] | undefined,
  verbatim = false,
): ReactNode[] {
  const list = nodes ?? [];
  const edge = (node: JSONContent | undefined, at: number) =>
    node?.type === "text"
      ? (node.text ?? "").slice(at, at + 1 || undefined)
      : "";
  return list.map((node, index) =>
    renderNode(
      node,
      index,
      verbatim,
      edge(list[index - 1], -1),
      edge(list[index + 1], 0),
    ),
  );
}

function renderNode(
  node: JSONContent,
  key: number,
  verbatim: boolean,
  before: string,
  after: string,
): ReactNode {
  const children = renderNodes(
    node.content,
    verbatim || node.type === "codeBlock",
  );
  const attrs = node.attrs ?? {};
  switch (node.type) {
    case "paragraph":
      return <p key={key}>{children.length ? children : null}</p>;
    case "heading": {
      const level = Math.min(4, Math.max(2, Number(attrs.level) || 2));
      const Tag = `h${level}` as "h2" | "h3" | "h4";
      return <Tag key={key}>{children}</Tag>;
    }
    case "text": {
      const text = node.text ?? "";
      const code = verbatim || node.marks?.some((m) => m.type === "code");
      return applyMarks(
        code ? text : typeset(text, before, after),
        node.marks,
        key,
      );
    }
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return (
        <ol key={key} start={attrs.start ? Number(attrs.start) : undefined}>
          {children}
        </ol>
      );
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "codeBlock":
      return (
        <pre key={key}>
          <code
            className={
              attrs.language ? `language-${attrs.language}` : undefined
            }
          >
            {children}
          </code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={key} />;
    case "hardBreak":
      return <br key={key} />;
    case "image": {
      const src = imageSrc(attrs.src);
      if (!src) return null;
      const caption = typeof attrs.title === "string" ? attrs.title : "";
      const alt = typeof attrs.alt === "string" ? attrs.alt : "";
      const width = positiveInt(attrs.width);
      const height = positiveInt(attrs.height);
      return (
        <figure key={key}>
          {/* eslint-disable-next-line @next/next/no-img-element -- responsive sources come from the optimizer via getImageProps; dimensions only when the editor stored them */}
          <img
            {...optimizedImage(src, alt)}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
          />
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      );
    }
    case "youtube": {
      const src = youtubeEmbed(attrs.src);
      return src ? embed(key, src, "YouTube video") : null;
    }
    case "iframe":
    case "embed": {
      const src = safeEmbedUrl(attrs.src);
      return src
        ? embed(
            key,
            src,
            typeof attrs.title === "string" ? attrs.title : "Embedded content",
          )
        : null;
    }
    case "table":
      return (
        <table key={key}>
          <tbody>{children}</tbody>
        </table>
      );
    case "tableRow":
      return <tr key={key}>{children}</tr>;
    case "tableHeader":
      return <th key={key}>{children}</th>;
    case "tableCell":
      return <td key={key}>{children}</td>;
    default:
      return children.length ? <div key={key}>{children}</div> : null;
  }
}

function applyMarks(
  text: string,
  marks: JSONContent["marks"],
  key: number,
): ReactNode {
  let out: ReactNode = text;
  for (const mark of marks ?? []) {
    switch (mark.type) {
      case "bold":
        out = <strong>{out}</strong>;
        break;
      case "italic":
        out = <em>{out}</em>;
        break;
      case "underline":
        out = <u>{out}</u>;
        break;
      case "strike":
        out = <s>{out}</s>;
        break;
      case "code":
        out = <code>{out}</code>;
        break;
      case "subscript":
        out = <sub>{out}</sub>;
        break;
      case "superscript":
        out = <sup>{out}</sup>;
        break;
      case "link": {
        const href = safeHref(mark.attrs?.href);
        if (!href) break;
        const external = /^https?:\/\//.test(href);
        out = (
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            {out}
          </a>
        );
        break;
      }
      default:
        break;
    }
  }
  return <span key={key}>{out}</span>;
}

function embed(key: number, src: string, title: string) {
  return (
    <figure key={key} className="embed">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </figure>
  );
}

/**
 * src/srcSet/sizes through the Next.js image optimizer for a remote image of
 * unknown dimensions (the `fill` form of getImageProps needs none). Falls
 * back to the plain URL if the host is not in next.config images.
 */
function optimizedImage(src: string, alt: string) {
  try {
    const { props } = getImageProps({
      src,
      alt,
      fill: true,
      sizes: "(min-width: 42rem) 42rem, 100vw",
    });
    return { src: props.src, srcSet: props.srcSet, sizes: props.sizes, alt };
  } catch {
    return { src, alt };
  }
}

function positiveInt(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

function safeHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const href = value.trim();
  if (/^(https?:\/\/|mailto:|\/|#)/i.test(href)) return href;
  return null;
}

function imageSrc(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return getMediaUrl(value.trim());
}

function safeEmbedUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    return EMBED_HOSTS.includes(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Accepts watch, share and embed YouTube URLs; returns a privacy-enhanced embed URL. */
function youtubeEmbed(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    let id: string | null = null;
    if (url.hostname === "youtu.be") id = url.pathname.slice(1);
    else if (/(^|\.)youtube(-nocookie)?\.com$/.test(url.hostname)) {
      id =
        url.searchParams.get("v") ??
        url.pathname.match(/\/(?:embed|shorts)\/([\w-]+)/)?.[1] ??
        null;
    }
    if (!id || !/^[\w-]{6,}$/.test(id)) return null;
    return `https://www.youtube-nocookie.com/embed/${id}`;
  } catch {
    return null;
  }
}
