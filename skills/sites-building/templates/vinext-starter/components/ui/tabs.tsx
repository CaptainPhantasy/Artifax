"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

/** Tabs with the WAI-ARIA tabs pattern: roving tabindex + arrow-key navigation. */
export function Tabs({ items, className, initialId }: { items: TabItem[]; className?: string; initialId?: string }) {
  const [active, setActive] = useState(initialId ?? items[0]?.id);
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const idx = items.findIndex((t) => t.id === active);
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const next = (idx + delta + items.length) % items.length;
      setActive(items[next].id);
      (listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next])?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(items[0].id);
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(items[items.length - 1].id);
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[items.length - 1]?.focus();
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        ref={listRef}
        role="tablist"
        aria-label="Sections"
        onKeyDown={onKeyDown}
        className="inline-flex gap-1 rounded-lg border border-line bg-surface-2 p-1"
      >
        {items.map((item) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              id={`${baseId}-tab-${item.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[length:var(--fs-sm)] font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                selected ? "bg-surface text-ink shadow-xs" : "text-ink-2 hover:text-ink",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          id={`${baseId}-panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={item.id !== active}
          tabIndex={0}
          className="focus-visible:outline-none"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
