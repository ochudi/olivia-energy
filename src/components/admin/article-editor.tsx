"use client";

import Image from "@tiptap/extension-image";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  ExternalLink,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  deletePost,
  savePost,
  type PostInput,
  type SaveIntent,
} from "@/lib/admin/actions/posts";
import { slugify } from "@/lib/admin/slug";
import { mediaUrl, uploadImage } from "@/lib/admin/upload";
import { formatDate } from "@/lib/insights/text";
import {
  POST_CATEGORIES,
  postBody,
  postCategoryLabel,
  type Post,
  type PostBody,
  type PostCategory,
  type PostStatus,
} from "@/lib/supabase/types";
import { cn } from "@/lib/utils/cn";
import { Field, Input, Select, Textarea, controlClass } from "./field";
import { Notice } from "./notice";

/** Image node with the dimensions the uploader measured, for stable layout on the site. */
const SizedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
      height: { default: null },
    };
  },
});

type Feedback = { tone: "success" | "error"; text: ReactNode } | null;

/** Shared focus ring, matching the site-wide `focus-visible:ring-2 ring-focus ring-offset-2 ring-offset-canvas`. */
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";
/** A small text/icon control: token easing, unified focus ring, a 1px press. */
const microControl = cn(
  "rounded-xs transition-colors duration-instant ease-standard active:translate-y-px",
  focusRing,
);

/**
 * ProseMirror creates node `attrs` as null-prototype objects, which the
 * server-action serializer drops silently. Round-trip through JSON so every
 * object is a plain one before it leaves the client.
 */
function plainJson(doc: unknown): PostBody {
  return JSON.parse(JSON.stringify(doc)) as PostBody;
}

export function ArticleEditor({
  post,
  siteOrigin,
}: {
  post: Post;
  siteOrigin: string;
}) {
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [slugTouched, setSlugTouched] = useState(
    post.status === "published" || !post.slug.startsWith("untitled-"),
  );
  const [excerpt, setExcerpt] = useState(post.excerpt ?? "");
  const [category, setCategory] = useState<PostCategory>(post.category);
  const [tags, setTags] = useState<string[]>(post.tags);
  const [tagDraft, setTagDraft] = useState("");
  const [coverPath, setCoverPath] = useState<string | null>(post.cover_path);
  const [seoTitle, setSeoTitle] = useState(post.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(
    post.seo_description ?? "",
  );
  const [status, setStatus] = useState<PostStatus>(post.status);
  const [publishedAt, setPublishedAt] = useState(post.published_at);
  const [dirty, setDirty] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // The body is read once for the editor and then tracked in a ref (the
  // editor owns it; React never needs to re-render on keystrokes).
  const [initialBody] = useState<PostBody>(() => postBody(post));
  const bodyRef = useRef<PostBody>(initialBody);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      SizedImage.configure({ allowBase64: false }),
      Placeholder.configure({
        placeholder:
          "Start writing. Use the toolbar for headings, quotes, lists, links and images.",
      }),
    ],
    content: initialBody,
    editorProps: {
      attributes: {
        class: "prose min-h-[24rem] max-w-none px-5 py-4 focus:outline-none",
        "aria-label": "Article body",
      },
    },
    onUpdate: ({ editor }) => {
      bodyRef.current = plainJson(editor.getJSON());
      setDirty(true);
    },
  });

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const touch = useCallback(() => setDirty(true), []);

  const onTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
    touch();
  };

  const addTag = () => {
    const parts = tagDraft
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (!parts.length) return;
    setTags((prev) => [...new Set([...prev, ...parts])].slice(0, 12));
    setTagDraft("");
    touch();
  };

  const collect = (): PostInput => ({
    title,
    slug,
    excerpt,
    category,
    tags,
    cover_path: coverPath,
    seo_title: seoTitle,
    seo_description: seoDescription,
    body: bodyRef.current as PostInput["body"],
  });

  const submit = (intent: SaveIntent) => {
    setFeedback(null);
    setErrors({});
    startTransition(async () => {
      const result = await savePost(post.id, collect(), intent);
      if (!result.ok) {
        setErrors(result.errors ?? {});
        setFeedback({ tone: "error", text: result.message });
        return;
      }
      setStatus(result.status);
      setPublishedAt(result.publishedAt);
      setSlug(result.slug);
      setDirty(false);
      const live = `${siteOrigin}/insights/${result.slug}`;
      setFeedback({
        tone: "success",
        text:
          result.status === "published" ? (
            <>
              {result.message}{" "}
              <a
                href={live}
                target="_blank"
                rel="noopener"
                className="underline"
              >
                View it on the site
              </a>
              .
            </>
          ) : (
            result.message
          ),
      });
    });
  };

  // Cmd/Ctrl+S saves without changing status.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        submit("save");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const uploadCover = async (file: File) => {
    setBusy("Uploading cover…");
    try {
      const uploaded = await uploadImage(file, `covers/${post.id}`);
      setCoverPath(uploaded.path);
      touch();
    } catch (e) {
      setFeedback({
        tone: "error",
        text: e instanceof Error ? e.message : "Upload failed.",
      });
    } finally {
      setBusy(null);
    }
  };

  const insertImage = async (file: File) => {
    if (!editor) return;
    setBusy("Uploading image…");
    try {
      const uploaded = await uploadImage(file, `posts/${post.id}`);
      editor
        .chain()
        .focus()
        .setImage({
          src: uploaded.url,
          alt: "",
          ...(uploaded.width && uploaded.height
            ? { width: uploaded.width, height: uploaded.height }
            : {}),
        } as never)
        .run();
    } catch (e) {
      setFeedback({
        tone: "error",
        text: e instanceof Error ? e.message : "Upload failed.",
      });
    } finally {
      setBusy(null);
    }
  };

  const remove = () => {
    if (!window.confirm("Delete this article? This cannot be undone.")) return;
    startTransition(() => deletePost(post.id));
  };

  const live = status === "published" ? `${siteOrigin}/insights/${slug}` : null;
  const working = pending || busy !== null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div className="min-w-0">
        <label htmlFor="title" className="sr-only">
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Article title"
          className={cn(
            "font-display text-display-xs sm:text-display-sm placeholder:text-ink-subtle w-full bg-transparent leading-tight tracking-tight focus:outline-none",
            errors.title && "text-accent",
          )}
        />
        {errors.title ? (
          <p role="alert" className="text-accent mt-1 text-xs">
            {errors.title}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className="text-ink-muted">/insights/</span>
          <input
            aria-label="URL slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
              touch();
            }}
            onBlur={() => setSlug((s) => slugify(s))}
            className={cn(
              "border-line hover:border-ink/40 focus:border-ink min-w-[16rem] flex-1 border-b bg-transparent py-0.5 font-mono focus:outline-none",
              errors.slug && "border-accent",
            )}
          />
          {errors.slug ? (
            <span role="alert" className="text-accent">
              {errors.slug}
            </span>
          ) : null}
        </div>

        <div className="mt-6">
          <Field
            label="Standfirst"
            htmlFor="excerpt"
            hint="One or two sentences shown on cards and under the title."
            error={errors.excerpt}
            meta={`${excerpt.length}/400`}
          >
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                touch();
              }}
              rows={2}
              className="min-h-16"
            />
          </Field>
        </div>

        <div className="border-line-strong bg-surface mt-6 rounded-sm border">
          <Toolbar editor={editor} onImage={insertImage} disabled={working} />
          <EditorContent editor={editor} />
        </div>
      </div>

      <aside className="flex flex-col gap-5 lg:sticky lg:top-8">
        <section className="border-line bg-surface rounded-sm border p-4">
          <div className="flex items-center justify-between gap-3">
            <StatusBadge status={status} publishedAt={publishedAt} />
            <span className="text-ink-subtle font-mono text-[0.6875rem]">
              {dirty ? "Unsaved changes" : "Saved"}
            </span>
          </div>
          {publishedAt ? (
            <p className="text-ink-muted mt-2 text-xs">
              Published {formatDate(publishedAt)}
            </p>
          ) : null}
          {feedback ? (
            <Notice tone={feedback.tone} className="mt-3">
              {feedback.text}
            </Notice>
          ) : null}
          {busy ? (
            <p className="text-ink-muted mt-3 text-xs" aria-live="polite">
              {busy}
            </p>
          ) : null}
          <div className="mt-4 flex flex-col gap-2">
            {status === "draft" ? (
              <>
                <Button
                  size="sm"
                  onClick={() => submit("publish")}
                  disabled={working}
                >
                  Publish
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => submit("save")}
                  disabled={working}
                >
                  Save draft
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => submit("save")}
                  disabled={working}
                >
                  Save changes
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => submit("unpublish")}
                  disabled={working}
                >
                  Unpublish
                </Button>
              </>
            )}
            {live ? (
              <a
                href={live}
                target="_blank"
                rel="noopener"
                className={cn(
                  "text-ink-muted hover:text-ink hit-area inline-flex items-center gap-1.5 text-xs",
                  microControl,
                )}
              >
                View live article{" "}
                <ExternalLink aria-hidden className="size-3.5" />
              </a>
            ) : null}
          </div>
        </section>

        <section className="border-line bg-surface rounded-sm border p-4">
          <h2 className="text-xs font-medium">Cover image</h2>
          {coverPath ? (
            <div className="mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary storage image */}
              <img
                src={mediaUrl(coverPath)}
                alt=""
                className="border-line aspect-[3/2] w-full rounded-xs border object-cover"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <FileButton
                  label="Replace"
                  onFile={uploadCover}
                  disabled={working}
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverPath(null);
                    touch();
                  }}
                  className={cn(
                    "text-ink-muted hover:text-ink hit-area inline-flex items-center gap-1 text-xs",
                    microControl,
                  )}
                >
                  <X aria-hidden className="size-3.5" /> Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <FileButton
                label="Upload cover"
                onFile={uploadCover}
                disabled={working}
              />
              <p className="text-ink-muted mt-2 text-xs">
                3:2 works best. Resized to 1920px before upload.
              </p>
            </div>
          )}
        </section>

        <section className="border-line bg-surface flex flex-col gap-4 rounded-sm border p-4">
          <Field label="Category" htmlFor="category" error={errors.category}>
            <Select
              id="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as PostCategory);
                touch();
              }}
            >
              {POST_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {postCategoryLabel(c)}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Tags"
            htmlFor="tags"
            hint="Press Enter or comma to add. Up to 12."
            error={errors.tags}
          >
            <div
              className={cn(
                controlClass,
                "flex min-h-9 flex-wrap items-center gap-1 py-1",
              )}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-surface-muted inline-flex items-center gap-1 rounded-xs px-1.5 py-0.5 text-xs"
                >
                  {tag}
                  <button
                    type="button"
                    aria-label={`Remove tag ${tag}`}
                    onClick={() => {
                      setTags((prev) => prev.filter((t) => t !== tag));
                      touch();
                    }}
                    className={cn(
                      "text-ink-muted hover:text-ink hit-area",
                      microControl,
                    )}
                  >
                    <X aria-hidden className="size-3" />
                  </button>
                </span>
              ))}
              <input
                id="tags"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  } else if (
                    e.key === "Backspace" &&
                    !tagDraft &&
                    tags.length
                  ) {
                    setTags((prev) => prev.slice(0, -1));
                    touch();
                  }
                }}
                onBlur={addTag}
                placeholder={tags.length ? "" : "e.g. gas, nigeria"}
                className="placeholder:text-ink-subtle min-w-[6rem] flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </Field>
        </section>

        <section className="border-line bg-surface flex flex-col gap-4 rounded-sm border p-4">
          <h2 className="text-xs font-medium">Search & social</h2>
          <Field
            label="SEO title"
            htmlFor="seo_title"
            hint="Defaults to the article title."
            error={errors.seo_title}
            meta={`${seoTitle.length}/70`}
          >
            <Input
              id="seo_title"
              value={seoTitle}
              onChange={(e) => {
                setSeoTitle(e.target.value);
                touch();
              }}
              maxLength={70}
            />
          </Field>
          <Field
            label="SEO description"
            htmlFor="seo_description"
            hint="Defaults to the standfirst."
            error={errors.seo_description}
            meta={`${seoDescription.length}/200`}
          >
            <Textarea
              id="seo_description"
              value={seoDescription}
              onChange={(e) => {
                setSeoDescription(e.target.value);
                touch();
              }}
              rows={3}
              maxLength={200}
              className="min-h-20"
            />
          </Field>
        </section>

        <div className="flex items-center justify-between">
          <Link
            href="/admin/articles"
            className={cn(
              "text-ink-muted hover:text-ink hit-area text-xs",
              microControl,
            )}
          >
            ← All articles
          </Link>
          <button
            type="button"
            onClick={remove}
            disabled={working}
            className={cn(
              "text-ink-muted hover:text-accent inline-flex items-center gap-1 text-xs disabled:opacity-40",
              microControl,
            )}
          >
            <Trash2 aria-hidden className="size-3.5" /> Delete
          </button>
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function FileButton({
  label,
  onFile,
  disabled,
}: {
  label: string;
  onFile: (file: File) => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      <Button
        size="sm"
        variant="secondary"
        onClick={() => ref.current?.click()}
        disabled={disabled}
      >
        {label}
      </Button>
    </>
  );
}

function Toolbar({
  editor,
  onImage,
  disabled,
}: {
  editor: Editor | null;
  onImage: (file: File) => void;
  disabled?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            h2: editor.isActive("heading", { level: 2 }),
            h3: editor.isActive("heading", { level: 3 }),
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            quote: editor.isActive("blockquote"),
            bullet: editor.isActive("bulletList"),
            ordered: editor.isActive("orderedList"),
            link: editor.isActive("link"),
            undo: editor.can().undo(),
            redo: editor.can().redo(),
          }
        : null,
  });
  if (!editor) {
    return <div className="border-line h-11 border-b" aria-hidden />;
  }
  // The state hook fills in on the first transaction; render the buttons
  // straight away so the toolbar is never blank.
  const s = state ?? {
    h2: false,
    h3: false,
    bold: false,
    italic: false,
    quote: false,
    bullet: false,
    ordered: false,
    link: false,
    undo: editor.can().undo(),
    redo: editor.can().redo(),
  };
  const chain = () => editor.chain().focus();
  const openLinkField = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    setLinkValue(previous ?? "");
    setLinkOpen(true);
  };
  const applyLink = () => {
    const href = linkValue.trim();
    if (!href) {
      chain().extendMarkRange("link").unsetLink().run();
    } else {
      chain().extendMarkRange("link").setLink({ href }).run();
    }
    setLinkOpen(false);
  };
  const removeLink = () => {
    chain().extendMarkRange("link").unsetLink().run();
    setLinkOpen(false);
  };
  const cancelLink = () => {
    setLinkOpen(false);
    chain().run();
  };
  type ToolbarItem = {
    /** Items with side effects outside the editor (the image picker). */
    id?: "image";
    label: string;
    icon: typeof Bold;
    active?: boolean;
    disabled?: boolean;
    run?: () => void;
  };
  const groups: { id: string; items: ToolbarItem[] }[] = [
    {
      id: "text",
      items: [
        {
          label: "Heading 2",
          icon: Heading2,
          active: s.h2,
          run: () => chain().toggleHeading({ level: 2 }).run(),
        },
        {
          label: "Heading 3",
          icon: Heading3,
          active: s.h3,
          run: () => chain().toggleHeading({ level: 3 }).run(),
        },
        {
          label: "Bold",
          icon: Bold,
          active: s.bold,
          run: () => chain().toggleBold().run(),
        },
        {
          label: "Italic",
          icon: Italic,
          active: s.italic,
          run: () => chain().toggleItalic().run(),
        },
      ],
    },
    {
      id: "blocks",
      items: [
        {
          label: "Pull quote",
          icon: Quote,
          active: s.quote,
          run: () => chain().toggleBlockquote().run(),
        },
        {
          label: "Bulleted list",
          icon: List,
          active: s.bullet,
          run: () => chain().toggleBulletList().run(),
        },
        {
          label: "Numbered list",
          icon: ListOrdered,
          active: s.ordered,
          run: () => chain().toggleOrderedList().run(),
        },
        {
          label: "Divider",
          icon: Minus,
          run: () => chain().setHorizontalRule().run(),
        },
      ],
    },
    {
      id: "insert",
      items: [
        {
          label: "Link",
          icon: Link2,
          active: s.link || linkOpen,
          run: openLinkField,
        },
        { id: "image", label: "Image", icon: ImagePlus, disabled },
      ],
    },
    {
      id: "history",
      items: [
        {
          label: "Undo",
          icon: Undo2,
          disabled: !s.undo,
          run: () => chain().undo().run(),
        },
        {
          label: "Redo",
          icon: Redo2,
          disabled: !s.redo,
          run: () => chain().redo().run(),
        },
      ],
    },
  ];
  return (
    <div className="bg-surface-muted/95 sticky top-0 z-10">
      <div
        role="toolbar"
        aria-label="Formatting"
        className="border-line flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImage(file);
            e.target.value = "";
          }}
        />
        {groups.map((group, i) => (
          <div
            key={group.id}
            className={cn(
              "flex items-center gap-0.5",
              i > 0 && "border-line ml-1 border-l pl-1.5",
            )}
          >
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  title={item.label}
                  aria-label={item.label}
                  aria-pressed={item.active}
                  disabled={item.disabled}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={
                    item.id === "image"
                      ? () => fileRef.current?.click()
                      : item.run
                  }
                  className={cn(
                    "text-ink-muted hover:bg-surface hover:text-ink duration-fast ease-standard inline-flex size-8 items-center justify-center rounded-xs transition-colors disabled:opacity-40",
                    item.active &&
                      "bg-surface-muted text-ink hover:bg-surface-muted hover:text-ink",
                  )}
                >
                  <Icon aria-hidden className="size-4" strokeWidth={1.75} />
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {linkOpen ? (
        <div className="border-line flex items-center gap-2 border-b px-2 py-1.5">
          <label htmlFor="toolbar-link-url" className="sr-only">
            Link URL
          </label>
          <input
            id="toolbar-link-url"
            type="url"
            autoFocus
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancelLink();
              }
            }}
            placeholder="https://"
            className={cn(
              "border-line-strong bg-surface text-ink placeholder:text-ink-subtle duration-fast ease-standard hover:border-ink/50 focus-visible:border-ink h-8 min-w-0 flex-1 rounded-xs border px-2 font-sans text-sm transition-[border-color,box-shadow] focus-visible:outline-none",
              focusRing,
            )}
          />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={applyLink}
            className={cn(
              "text-ink hover:text-primary shrink-0 text-xs font-medium",
              microControl,
            )}
          >
            Apply
          </button>
          {s.link ? (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={removeLink}
              className={cn(
                "text-ink-muted hover:text-accent shrink-0 text-xs",
                microControl,
              )}
            >
              Remove
            </button>
          ) : null}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={cancelLink}
            className={cn(
              "text-ink-muted hover:text-ink hit-area shrink-0 text-xs",
              microControl,
            )}
          >
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  );
}
