import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export type AlertTone = "info" | "success" | "warning" | "danger";

const toneClass: Record<AlertTone, string> = {
  info: "bg-info-bg text-info",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
};

export interface AlertProps extends ComponentProps<"div"> {
  tone?: AlertTone;
  title?: string;
}

export function Alert({ className, tone = "info", title, children, ...props }: AlertProps) {
  const role = tone === "danger" ? "alert" : "status";
  return (
    <div
      role={role}
      aria-live={tone === "danger" ? "assertive" : "polite"}
      className={cn(
        "flex flex-col gap-1 rounded-lg border border-transparent p-4",
        toneClass[tone],
        className,
      )}
      {...props}
    >
      {title ? <p className="text-[length:var(--fs-sm)] font-semibold">{title}</p> : null}
      <div className="text-[length:var(--fs-sm)] text-ink-2">{children}</div>
    </div>
  );
}
