"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Native <dialog> modal: focus trap, Esc, backdrop, and top-layer come from the
 * platform. Controlled by `open`/`onClose`. Restores focus to the invoker on close.
 */
export function Dialog({ open, onClose, title, description, children, footer, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      if (typeof el.showModal === "function") el.showModal();
      else el.setAttribute("open", "");
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="ds-dialog-title"
      aria-describedby={description ? "ds-dialog-desc" : undefined}
      onClose={onClose}
      onCancel={onClose}
      onClick={(event) => {
        // Light dismiss: clicking the backdrop (the dialog element itself) closes.
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "ds-panel-in m-auto w-[min(32rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-0 shadow-xl backdrop:bg-[var(--scrim)]",
        className,
      )}
    >
      <div className="flex flex-col gap-1 p-6 pb-0">
        <h2 id="ds-dialog-title" className="text-[length:var(--fs-lg)] font-semibold text-ink">
          {title}
        </h2>
        {description ? (
          <p id="ds-dialog-desc" className="text-[length:var(--fs-sm)] text-ink-2">
            {description}
          </p>
        ) : null}
      </div>
      {children ? <div className="p-6 pt-4 text-[length:var(--fs-sm)] text-ink-2">{children}</div> : null}
      {footer ? <div className="flex justify-end gap-3 border-t border-line p-6 pt-4">{footer}</div> : null}
    </dialog>
  );
}
