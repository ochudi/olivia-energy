"use client";

import { ArrowDown, ArrowUp, GripVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState, useTransition, type DragEvent } from "react";
import {
  deletePublication,
  reorderPublications,
  setFeatured,
} from "@/lib/admin/actions/publications";
import { isCommentaryKind, kindOf } from "@/lib/admin/publication-fields";
import {
  PUBLICATION_KIND_LABELS,
  type Publication,
} from "@/lib/supabase/types";
import { cn } from "@/lib/utils/cn";
import { Table, Td, Th, Tr } from "./data-table";
import { Checkbox } from "./field";

/** Token easing + unified focus ring + a 1px press, for small text/icon controls. */
const controlPolish =
  "rounded-xs transition-colors duration-instant ease-standard active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

/**
 * Publications. With `reorderable` (the journal filter, where the order is
 * the site's) rows drag to reorder, with up/down buttons for keyboards;
 * otherwise the rows are listed as given. The featured box and delete act
 * immediately.
 */
export function PublicationsTable({
  items,
  reorderable,
}: {
  items: Publication[];
  reorderable: boolean;
}) {
  const [rows, setRows] = useOptimistic(items);
  const [dragging, setDragging] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const commit = (next: Publication[]) => {
    startTransition(async () => {
      setRows(next);
      await reorderPublications(next.map((r) => r.id));
    });
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length || from === to) return;
    const next = [...rows];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    commit(next);
  };
  const toggle = (row: Publication) => {
    startTransition(async () => {
      setRows(
        rows.map((r) =>
          r.id === row.id ? { ...r, featured: !r.featured } : r,
        ),
      );
      await setFeatured(row.id, !row.featured);
    });
  };
  const remove = (row: Publication) => {
    if (!window.confirm(`Delete “${row.title}”?`)) return;
    startTransition(async () => {
      setRows(rows.filter((r) => r.id !== row.id));
      await deletePublication(row.id);
    });
  };

  return (
    <div aria-busy={pending || undefined}>
      <Table>
        <thead>
          <tr>
            {reorderable ? (
              <Th className="w-10">
                <span className="sr-only">Order</span>
              </Th>
            ) : null}
            <Th>Publication</Th>
            <Th className="w-32">Kind</Th>
            <Th className="w-28">Date</Th>
            <Th className="w-24">Featured</Th>
            <Th className="w-28">
              <span className="sr-only">Actions</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <Tr
              key={row.id}
              {...(reorderable
                ? {
                    draggable: true,
                    onDragStart: (e: DragEvent<HTMLTableRowElement>) => {
                      setDragging(row.id);
                      e.dataTransfer.effectAllowed = "move";
                    },
                    onDragOver: (e: DragEvent<HTMLTableRowElement>) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    },
                    onDrop: (e: DragEvent<HTMLTableRowElement>) => {
                      e.preventDefault();
                      if (!dragging || dragging === row.id) return;
                      const from = rows.findIndex((r) => r.id === dragging);
                      move(from, index);
                      setDragging(null);
                    },
                    onDragEnd: () => setDragging(null),
                  }
                : {})}
              className={cn(dragging === row.id && "opacity-50")}
            >
              {reorderable ? (
                <Td className="text-ink-subtle">
                  <div className="flex items-center gap-0.5">
                    <GripVertical aria-hidden className="size-4 cursor-grab" />
                    <div className="flex flex-col">
                      <button
                        type="button"
                        aria-label="Move up"
                        onClick={() => move(index, index - 1)}
                        disabled={index === 0}
                        className={cn(
                          "hover:text-ink inline-flex size-6 items-center justify-center disabled:opacity-30",
                          controlPolish,
                        )}
                      >
                        <ArrowUp aria-hidden className="size-3" />
                      </button>
                      <button
                        type="button"
                        aria-label="Move down"
                        onClick={() => move(index, index + 1)}
                        disabled={index === rows.length - 1}
                        className={cn(
                          "hover:text-ink inline-flex size-6 items-center justify-center disabled:opacity-30",
                          controlPolish,
                        )}
                      >
                        <ArrowDown aria-hidden className="size-3" />
                      </button>
                    </div>
                  </div>
                </Td>
              ) : null}
              <Td className="min-w-64">
                <Link
                  href={`/admin/publications/${row.id}`}
                  className={cn(
                    "hover:text-primary font-medium",
                    controlPolish,
                  )}
                >
                  {row.title}
                </Link>
                <p className="text-ink-muted mt-0.5 text-xs">
                  {row.authors.join(", ")}
                  {row.venue ? ` · ${row.venue}` : ""}
                </p>
              </Td>
              <Td className="text-ink-muted text-xs whitespace-nowrap">
                {PUBLICATION_KIND_LABELS[kindOf(row)]}
                {row.syndication ? (
                  <span className="text-ink-subtle block">Syndicated copy</span>
                ) : null}
              </Td>
              <Td className="text-ink-muted font-mono text-xs whitespace-nowrap tabular-nums">
                {row.published_on ?? row.year ?? "—"}
              </Td>
              <Td>
                {isCommentaryKind(kindOf(row)) ? (
                  <span aria-hidden className="text-ink-subtle text-xs">
                    —
                  </span>
                ) : (
                  <label className="inline-flex cursor-pointer p-1">
                    <Checkbox
                      checked={row.featured}
                      onChange={() => toggle(row)}
                      aria-label={`Featured: ${row.title}`}
                    />
                  </label>
                )}
              </Td>
              <Td>
                <div className="flex items-center justify-end gap-3 text-xs">
                  <Link
                    href={`/admin/publications/${row.id}`}
                    className={cn(
                      "text-ink-muted hover:text-ink hit-area",
                      controlPolish,
                    )}
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(row)}
                    className={cn(
                      "text-ink-muted hover:text-accent hit-area inline-flex items-center gap-1",
                      controlPolish,
                    )}
                  >
                    <Trash2 aria-hidden className="size-3.5" /> Delete
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
