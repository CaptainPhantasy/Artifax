import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface AccordionItem {
  question: string;
  answer: ReactNode;
}

/**
 * Disclosure list built on native <details>/<summary>: keyboard, screen-reader,
 * and find-in-page support come from the platform. No JS required.
 */
export function Accordion({
  items,
  className,
  name,
}: {
  items: AccordionItem[];
  className?: string;
  /** Set a shared name to make it a single-open (exclusive) accordion. */
  name?: string;
}) {
  return (
    <div className={cn("divide-y divide-[var(--line)] rounded-xl border border-line bg-surface", className)}>
      {items.map((item, i) => (
        <details key={i} name={name} className="group px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md py-1 text-[length:var(--fs-base)] font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            {item.question}
            <span aria-hidden="true" className="text-ink-3 transition-transform duration-[var(--dur-fast)] group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="pt-3 text-[length:var(--fs-sm)] leading-relaxed text-ink-2">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
