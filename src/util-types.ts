import { Type as t, type TOptional, type TSchema } from "@sinclair/typebox";
import type {
  SchemaOptions,
  StringContentEncodingOption,
  StringFormatOption,
  StringOptions,
  TLiteral,
  TNull,
  TUnion,
} from "@sinclair/typebox";

export function Nullable<T extends TSchema>(schema: T): TUnion<[T, TNull]> {
  return t.Union([schema, t.Null()]);
}

export type CustomUnion<T extends readonly string[]> = TUnion<
  TLiteral<T[number]>[]
> & {
  options: T;
}; // store the options in the schema for later use

// Custom type structure for TypeBox

// The secret is using a deeply inferred string literal constraint
function _makeLiterals<V extends string, ST extends readonly [V, ...V[]]>(
  values: ST,
  defaultVal?: ST[number],
): CustomUnion<ST> {
  // Using TypeBox's native mapped arrays for literals
  const schema = t.Union(
    values.map((it) => t.Literal(it)),
    {
      description: `The value must be one of ${values.join(", ")}.${defaultVal ? ` Defaults to \${defaultVal}` : ""}`,
      error: `Invalid value, must be one of ${values.join(", ")}`,
      default: defaultVal,
      examples: values as unknown as string[],
    },
  );

  return Object.assign(schema, {
    options: values,
  }) as unknown as CustomUnion<ST>;
}

// Update the wrappers with the exact same generic constraints
export function AnyOf<V extends string, T extends readonly [V, ...V[]]>(
  values: T,
  defaultVal?: T[number],
): CustomUnion<T> {
  return _makeLiterals(values, defaultVal);
}

export function OneOf<V extends string, T extends readonly [V, ...V[]]>(
  values: T,
  defaultVal?: T[number],
): CustomUnion<T> {
  return _makeLiterals(values, defaultVal);
}

/**
 * Creates an optional union type from a list of possible string values.
 *
 * it is optional, but if provided, the value must be one of the provided values only.
 *
 * @param values the possible values in the literal
 * @returns
 */
export function AnyOfOptional<V extends string, T extends readonly [V, ...V[]]>(
  values: T,
  defaultVal?: T[number],
): TOptional<CustomUnion<T>> {
  return t.Optional(_makeLiterals(values, defaultVal));
}

export interface FixedLengthStringOptions extends SchemaOptions {
  /** A regular expression pattern this string should match */
  pattern?: string;
  /** A format this string should match */
  format?: StringFormatOption;
  /** The content encoding for this string */
  contentEncoding?: StringContentEncodingOption;
  /** The content media type for this string */
  contentMediaType?: string;
}

function FixedLengthString<T extends string>(
  length: number,
  options?: FixedLengthStringOptions,
) {
  return t.String({
    minLength: length,
    maxLength: length,
    description: `A string of exactly ${length} characters.`,
    error: `Invalid length, must be exactly ${length} characters.`,
    ...options,
  });
}

function FixedSizeArray<T extends TSchema>(item: T, size: number) {
  return t.Array(item, {
    minItems: size,
    maxItems: size,
    description: `An array of exactly ${size} items.`,
    error: `Invalid length, must be exactly ${size} items.`,
  });
}

function Uuid() {
  return t.String({
    format: "uuid",
    description: "A string that must be a valid UUID.",
    error: "Invalid UUID format.",
  });
}

export const UtilsExtensionImplementation = {
  /**
   * Creates an  union type from a list of possible string values.
   *
   * it is optional, but if provided, the value must be one of the provided values only.
   *
   * @param values the possible values in the literal
   * @returns
   */
  AnyOf,
  OneOf,
  AnyOfOptional,
  Nullable,
  FixedLengthString,
  FixedSizeArray,
  Uuid,
};

export type UtilsExtension = typeof UtilsExtensionImplementation;
