"use client";

import { Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { saveSettings } from "@/lib/admin/actions/settings";
import type { SiteSettings } from "@/lib/supabase/types";
import { cn } from "@/lib/utils/cn";
import { Checkbox, Field, Input, Textarea } from "./field";
import { Notice } from "./notice";

const section =
  "border-line bg-surface flex flex-col gap-4 rounded-sm border p-4";

/** Shared focus ring, matching the site-wide `focus-visible:ring-2 ring-focus ring-offset-2 ring-offset-canvas`. */
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

/** One form for every settings key; saves the whole object at once. */
export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [s, setS] = useState<SiteSettings>(initial);
  const [dirty, setDirty] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const patch = (next: Partial<SiteSettings>) => {
    setS((prev) => ({ ...prev, ...next }));
    setDirty(true);
  };
  const submit = () => {
    setFeedback(null);
    startTransition(async () => {
      const result = await saveSettings(s);
      setFeedback({
        tone: result.ok ? "success" : "error",
        text: result.message,
      });
      if (result.ok) setDirty(false);
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="grid gap-5 lg:grid-cols-2 lg:items-start"
    >
      <div className={section}>
        <h2 className="text-xs font-medium">Brand</h2>
        <Field label="Tagline" htmlFor="tagline" hint="Shown in the footer.">
          <Input
            id="tagline"
            value={s.tagline}
            onChange={(e) => patch({ tagline: e.target.value })}
          />
        </Field>
        <Field
          label="Contact email"
          htmlFor="contact-email"
          hint="Shown on Contact and in the footer. Contact-form messages are emailed here."
        >
          <Input
            id="contact-email"
            type="email"
            value={s.contact_email}
            onChange={(e) => patch({ contact_email: e.target.value })}
          />
        </Field>
        <Field
          label="NIPEX wording"
          htmlFor="nipex"
          hint="Shown in the footer legal line and on About. Leave empty to hide the line until the number is confirmed."
        >
          <Input
            id="nipex"
            value={s.nipex_wording}
            onChange={(e) => patch({ nipex_wording: e.target.value })}
          />
        </Field>
      </div>

      <div className={section}>
        <h2 className="text-xs font-medium">Social profiles</h2>
        {(["linkedin", "instagram", "x"] as const).map((id) => (
          <Field
            key={id}
            label={{ linkedin: "LinkedIn", instagram: "Instagram", x: "X" }[id]}
            htmlFor={`social-${id}`}
          >
            <Input
              id={`social-${id}`}
              type="url"
              value={s.socials[id] ?? ""}
              onChange={(e) =>
                patch({
                  socials: { ...s.socials, [id]: e.target.value || undefined },
                })
              }
              placeholder="https://"
            />
          </Field>
        ))}
        <Field
          label="Google Scholar"
          htmlFor="scholar-url"
          hint="The founder's profile. Linked from Publications; leave empty to hide the link."
        >
          <Input
            id="scholar-url"
            type="url"
            value={s.scholar_url}
            onChange={(e) => patch({ scholar_url: e.target.value })}
            placeholder="https://scholar.google.com/citations?user=…"
          />
        </Field>
      </div>

      <div className={section}>
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium">Addresses</h2>
          <AddButton
            onClick={() =>
              patch({ addresses: [...s.addresses, { country: "", lines: [] }] })
            }
          />
        </div>
        {s.addresses.map((a, i) => (
          <div
            key={i}
            className="border-line flex flex-col gap-3 border-t pt-3"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Country" htmlFor={`addr-country-${i}`}>
                <Input
                  id={`addr-country-${i}`}
                  value={a.country}
                  onChange={(e) =>
                    patch({
                      addresses: s.addresses.map((x, j) =>
                        j === i ? { ...x, country: e.target.value } : x,
                      ),
                    })
                  }
                />
              </Field>
              <Field
                label="Label"
                htmlFor={`addr-label-${i}`}
                hint="e.g. Lagos office"
              >
                <Input
                  id={`addr-label-${i}`}
                  value={a.label ?? ""}
                  onChange={(e) =>
                    patch({
                      addresses: s.addresses.map((x, j) =>
                        j === i
                          ? { ...x, label: e.target.value || undefined }
                          : x,
                      ),
                    })
                  }
                />
              </Field>
            </div>
            <Field
              label="Address lines"
              htmlFor={`addr-lines-${i}`}
              hint="One line per row."
            >
              <Textarea
                id={`addr-lines-${i}`}
                rows={3}
                value={a.lines.join("\n")}
                onChange={(e) =>
                  patch({
                    addresses: s.addresses.map((x, j) =>
                      j === i ? { ...x, lines: e.target.value.split("\n") } : x,
                    ),
                  })
                }
              />
            </Field>
            <RemoveButton
              label="Remove address"
              onClick={() =>
                patch({ addresses: s.addresses.filter((_, j) => j !== i) })
              }
            />
          </div>
        ))}
      </div>

      <div className={section}>
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium">Phone numbers</h2>
          <AddButton
            onClick={() => patch({ phones: [...s.phones, { number: "" }] })}
          />
        </div>
        {s.phones.length === 0 ? (
          <p className="text-ink-muted text-xs">None yet.</p>
        ) : null}
        {s.phones.map((p, i) => (
          <div
            key={i}
            className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <Field label="Label" htmlFor={`phone-label-${i}`}>
              <Input
                id={`phone-label-${i}`}
                value={p.label ?? ""}
                onChange={(e) =>
                  patch({
                    phones: s.phones.map((x, j) =>
                      j === i
                        ? { ...x, label: e.target.value || undefined }
                        : x,
                    ),
                  })
                }
              />
            </Field>
            <Field label="Number" htmlFor={`phone-number-${i}`}>
              <Input
                id={`phone-number-${i}`}
                value={p.number}
                onChange={(e) =>
                  patch({
                    phones: s.phones.map((x, j) =>
                      j === i ? { ...x, number: e.target.value } : x,
                    ),
                  })
                }
              />
            </Field>
            <RemoveButton
              label="Remove number"
              onClick={() =>
                patch({ phones: s.phones.filter((_, j) => j !== i) })
              }
            />
          </div>
        ))}
      </div>

      <div className={`${section} lg:col-span-2`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-medium">Homepage stats</h2>
            <p className="text-ink-muted mt-0.5 text-xs">
              Four figures in the band under Heritage.
            </p>
          </div>
          <AddButton
            onClick={() =>
              patch({ stats: [...s.stats, { label: "", value: 0 }] })
            }
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={s.stats_visible}
            onChange={(e) => patch({ stats_visible: e.target.checked })}
          />
          Show the figures on the homepage
        </label>
        <p className="text-ink-muted -mt-2 text-xs">
          Off until every figure is confirmed; the band stays hidden while off.
        </p>
        {s.stats.map((st, i) => (
          <div
            key={i}
            className="grid items-end gap-3 sm:grid-cols-[6rem_5rem_1fr_1fr_auto]"
          >
            <Field label="Value" htmlFor={`stat-value-${i}`}>
              <Input
                id={`stat-value-${i}`}
                inputMode="numeric"
                value={st.value}
                onChange={(e) =>
                  patch({
                    stats: s.stats.map((x, j) =>
                      j === i
                        ? { ...x, value: Number(e.target.value) || 0 }
                        : x,
                    ),
                  })
                }
              />
            </Field>
            <Field label="Suffix" htmlFor={`stat-suffix-${i}`}>
              <Input
                id={`stat-suffix-${i}`}
                value={st.suffix ?? ""}
                onChange={(e) =>
                  patch({
                    stats: s.stats.map((x, j) =>
                      j === i
                        ? { ...x, suffix: e.target.value || undefined }
                        : x,
                    ),
                  })
                }
                placeholder="+"
              />
            </Field>
            <Field label="Label" htmlFor={`stat-label-${i}`}>
              <Input
                id={`stat-label-${i}`}
                value={st.label}
                onChange={(e) =>
                  patch({
                    stats: s.stats.map((x, j) =>
                      j === i ? { ...x, label: e.target.value } : x,
                    ),
                  })
                }
              />
            </Field>
            <Field label="Description" htmlFor={`stat-desc-${i}`}>
              <Input
                id={`stat-desc-${i}`}
                value={st.description ?? ""}
                onChange={(e) =>
                  patch({
                    stats: s.stats.map((x, j) =>
                      j === i
                        ? { ...x, description: e.target.value || undefined }
                        : x,
                    ),
                  })
                }
              />
            </Field>
            <RemoveButton
              label="Remove stat"
              onClick={() =>
                patch({ stats: s.stats.filter((_, j) => j !== i) })
              }
            />
          </div>
        ))}
      </div>

      <div className="border-line bg-canvas sticky bottom-0 z-10 flex items-center gap-4 border-t py-4 lg:col-span-2">
        <Button
          type="submit"
          size="sm"
          disabled={pending || !dirty}
          className={cn(
            pending || !dirty
              ? "bg-surface-muted! text-ink-subtle! opacity-100!"
              : undefined,
          )}
        >
          {pending ? "Saving…" : "Save settings"}
        </Button>
        {dirty && !pending ? (
          <span className="text-ink-subtle text-xs">Unsaved changes</span>
        ) : null}
        {feedback ? (
          <Notice tone={feedback.tone}>{feedback.text}</Notice>
        ) : null}
      </div>
    </form>
  );
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-ink-muted hover:text-ink duration-instant ease-standard hit-area inline-flex items-center gap-1 rounded-xs text-xs transition-colors active:translate-y-px",
        focusRing,
      )}
    >
      <Plus aria-hidden className="size-3.5" /> Add
    </button>
  );
}
function RemoveButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "text-ink-muted hover:text-accent duration-instant ease-standard inline-flex h-9 items-center gap-1 rounded-xs text-xs transition-colors active:translate-y-px",
        focusRing,
      )}
    >
      <X aria-hidden className="size-3.5" /> Remove
    </button>
  );
}
