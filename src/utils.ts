export function coerceToNumber(value: unknown): number {
  // Reject symbols, objects, or arrays that would yield unexpected or NaN results early
  if (
    typeof value === "symbol" ||
    (typeof value === "object" && value !== null)
  ) {
    throw new TypeError(
      `Failed to convert ${JSON.stringify(value)} to number.`,
    );
  }

  const numberValue = typeof value === "number" ? value : Number(value);

  // Handle cases like NaN, undefined, or empty/invalid strings
  if (Number.isNaN(numberValue) || value === undefined || value === null) {
    throw new TypeError(
      `Failed to convert ${JSON.stringify(value)} to number.`,
    );
  }

  return numberValue;
}

export function coerceToString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    throw new TypeError(
      `Failed to convert ${JSON.stringify(value)} to string.`,
    );
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value === "object") {
    try {
      // Arrays are objects too and will safely pass through here
      return JSON.stringify(value);
    } catch {
      throw new TypeError(
        `Failed to convert ${JSON.stringify(value)} to string (JSON mapping failed).`,
      );
    }
  }

  throw new TypeError(`Failed to convert ${JSON.stringify(value)} to string.`);
}

export function coerceToBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const lower = value.toLowerCase().trim();
    if (lower === "true") return true;
    if (lower === "false") return false;
  }

  if (typeof value === "number") {
    // Keeps your custom rule where numbers act like truthy chunks unless they are 0
    if (!Number.isNaN(value)) {
      return value !== 0;
    }
  }

  throw new TypeError(`Failed to convert ${JSON.stringify(value)} to boolean.`);
}

export function coerceToArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value !== undefined && value !== null) {
    return [value as T];
  }

  throw new TypeError(`Failed to convert ${JSON.stringify(value)} to array.`);
}

export function coerceToObject(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  throw new TypeError(`Failed to convert ${JSON.stringify(value)} to object.`);
}
