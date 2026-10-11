export function coereceToNumber(value: unknown): number | undefined {
  const numberValue = typeof value === "number" ? value : Number(value);

  if (isNaN(numberValue)) {
    return undefined;
  }

  return undefined;
}

export function coereceToString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (value == null || value == undefined) {
    return undefined;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  // if the value is an object, we can try to JSON.stringify it
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return undefined;
    }
  }

  return undefined;
}

export function coereceToBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower === "true") {
      return true;
    }
    if (lower === "false") {
      return false;
    }
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  return undefined;
}

export function coereceToArray<T>(value: T | T[]): T[] | undefined {
  return Array.isArray(value)
    ? value
    : value !== undefined
      ? [value]
      : undefined;
}

export function coereceToObject(
  value: unknown,
): Record<string, unknown> | undefined {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return undefined;
}
