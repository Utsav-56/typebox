type SnakeToCamel<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Lowercase<Head>}${Capitalize<SnakeToCamel<Tail>>}`
  : Lowercase<S>;

export type CamelCaseKeys<T extends Record<string, unknown>> = {
  [K in keyof T as K extends string ? SnakeToCamel<K> : K]: T[K];
};

function toCamelKey(key: string): string {
  return key
    .toLowerCase()
    .replaceAll(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}

function toSnakeKey(key: string): string {
  return key.replaceAll(/[A-Z]/g, (char) => `_${char}`).toUpperCase();
}

function snakeToCamelObject<T extends Record<string, unknown>>(
  obj: T,
): CamelCaseKeys<T> {
  const entries = Object.entries(obj).map(([key, val]) => [
    toCamelKey(key),
    val,
  ]);
  return Object.fromEntries(entries);
}

function camelToSnakeObject<T extends Record<string, unknown>>(
  obj: CamelCaseKeys<T>,
): T {
  const entries = Object.entries(obj).map(([key, val]) => [
    toSnakeKey(key),
    val,
  ]);
  return Object.fromEntries(entries);
}

export const TransformationExtensionImplementation = {
  toCamelKey,
  toSnakeKey,
  snakeToCamelObject,
  camelToSnakeObject,
};

export type TransformationExtension =
  typeof TransformationExtensionImplementation;
