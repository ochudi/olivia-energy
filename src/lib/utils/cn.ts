export type ClassValue =
  | string
  | number
  | bigint
  | null
  | boolean
  | undefined
  | ClassValue[]
  | { [key: string]: boolean | null | undefined };

/** Minimal clsx-style class joiner. Falsy values and `false` object keys are dropped. */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (value: ClassValue): void => {
    if (!value) return;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "bigint"
    ) {
      out.push(String(value));
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (typeof value === "object") {
      for (const key in value) if (value[key]) out.push(key);
    }
  };
  inputs.forEach(walk);
  return out.join(" ");
}

/** Returns a shallow copy of `obj` without the given keys. */
export function omitKeys<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Omit<T, K> {
  const out = { ...obj };
  for (const key of keys) delete out[key];
  return out;
}
