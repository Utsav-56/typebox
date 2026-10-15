import { Type as t, type TOptional, type TSchema } from "@sinclair/typebox";
import type { TLiteral, TNull, TUnion } from "..";

export function Nullable<T extends TSchema>(schema: T): TUnion<[T, TNull]> {
  return t.Union([schema, t.Null()]);
}

export type CustomUnion<T extends readonly string[]> = TUnion<
  TLiteral<T[number]>[]
> & {
  options: T;
}; // store the options in the schema for later use

function _makeLiterals<ST extends readonly string[]>(
  values: ST,
  defaultVal?: ST[number],
): CustomUnion<ST> {
  const schema = t.Union(
    values.map((it) => t.Literal(it) as TLiteral<ST[number]>),
    {
      description: `The value must be one of ${values.join(", ")}.${defaultVal ? ` Defaults to ${defaultVal}` : ""}`,
      error: `Invalid value, must be one of ${values.join(", ")}`,
      default: defaultVal,
      examples: values,
    },
  );

  return Object.assign(schema, {
    options: values,
  }) as unknown as CustomUnion<ST>;
}

/**
 * Creates a union type from a list of possible string values.
 *
 * The any of means this is not a optional field, but the value must be one of the provided values only.
 *
 * @param values the possible values in the literal
 * @returns
 */
function AnyOf<T extends readonly string[]>(
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
function AnyOfOptional<T extends readonly string[]>(
  values: T,
  defaultVal?: T[number],
): TOptional<CustomUnion<T>> {
  return t.Optional(_makeLiterals(values, defaultVal));
}

export const UtilsExtensionImplementation = {
  AnyOf,
  AnyOfOptional,
  Nullable,
};

export type UtilsExtension = typeof UtilsExtensionImplementation;
