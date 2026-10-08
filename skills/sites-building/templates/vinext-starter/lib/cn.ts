// Minimal class-name joiner. No dependencies.
// Usage: cn("rounded-lg", isActive && "bg-brand", className)

export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  const push = (value: ClassValue): void => {
    if (!value && value !== 0) return;
    if (typeof value === "string" || typeof value === "number") {
      out.push(String(value));
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) push(item);
      return;
    }
    if (typeof value === "object") {
      for (const [key, on] of Object.entries(value)) {
        if (on) out.push(key);
      }
    }
  };

  for (const input of inputs) push(input);
  return out.join(" ");
}
