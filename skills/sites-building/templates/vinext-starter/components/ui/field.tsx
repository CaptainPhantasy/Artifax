"use client";

import { useId, type ComponentProps } from "react";
import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ */
/* Field — labelled control wrapper with hint + error, wired for a11y.  */
/* ------------------------------------------------------------------ */

export interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  /** Render prop receiving the a11y props your control must spread. */
  children: (ids: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean | undefined;
    "aria-required": boolean | undefined;
  }) => React.ReactNode;
}

export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[length:var(--fs-sm)] font-medium text-ink">
        {label}
        {required ? <span className="ml-1 text-danger" aria-hidden="true">*</span> : null}
      </label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        "aria-required": required || undefined,
      })}
      {hint && !error ? (
        <p id={hintId} className="text-[length:var(--fs-sm)] text-ink-2">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-[length:var(--fs-sm)] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Input / Textarea                                                    */
/* ------------------------------------------------------------------ */

const controlBase =
  "w-full rounded-lg border border-line bg-surface px-3 text-ink placeholder:text-ink-3 " +
  "transition-colors duration-[var(--dur-fast)] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:border-transparent " +
  "disabled:opacity-50 aria-[invalid=true]:border-danger";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlBase, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(controlBase, "min-h-24 py-2 leading-relaxed", className)} {...props} />;
}
