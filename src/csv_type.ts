import { Kind, TypeRegistry, Type as t } from "@sinclair/typebox";
import {
  DefaultErrorFunction,
  SetErrorFunction,
} from "@sinclair/typebox/errors";

import type { CsvOptions, TCsv } from "./options";

TypeRegistry.Set<string>("Csv", (schema: unknown, value: unknown) => {
  if (
    (typeof value === "object" && !Array.isArray(value)) ||
    typeof value === "function" ||
    value === null
  ) {
    return false;
  }

  let finalValue: string[] = [];

  if (Array.isArray(value)) {
    finalValue = value as string[];
  }

  if (typeof value == "string") {
    finalValue = value.split(",").map((v) => v.trim());
  }

  const opts = (schema as TCsv).options || {};

  if (opts.minValues !== undefined && finalValue.length < opts.minValues) {
    return false;
  }

  if (opts.maxValues !== undefined && finalValue.length > opts.maxValues) {
    return false;
  }

  for (const val of finalValue) {
    if (
      opts.minLengthPerValue !== undefined &&
      val.length < opts.minLengthPerValue
    ) {
      return false;
    }

    if (
      opts.maxLengthPerValue !== undefined &&
      val.length > opts.maxLengthPerValue
    ) {
      return false;
    }

    if (opts.blockedWords && opts.blockedWords.includes(val)) {
      return false;
    }
  }

  return true;
});

SetErrorFunction((error) => {
  if (error.schema[Kind] === "Csv" && typeof error.value === "string") {
    const opts = (error.schema as TCsv).options || {};

    const value = error.value;

    if (
      (typeof value === "object" && !Array.isArray(value)) ||
      typeof value === "function" ||
      value === null
    ) {
      return `Object, function, or null values are not allowed for CSV.`;
    }

    let finalValue: string[] = [];

    if (Array.isArray(value)) {
      finalValue = value as string[];
    }

    if (typeof value == "string") {
      finalValue = value.split(",").map((v) => v.trim());
    }

    if (opts.minValues !== undefined && finalValue.length < opts.minValues) {
      return `must have at least ${opts.minValues} values.`;
    }

    if (opts.maxValues !== undefined && finalValue.length > opts.maxValues) {
      return `maximum of ${opts.maxValues} values are allowed.`;
    }

    for (const val of finalValue) {
      if (
        opts.minLengthPerValue !== undefined &&
        val.length < opts.minLengthPerValue
      ) {
        return `each value must be at least ${opts.minLengthPerValue} characters long.`;
      }

      if (
        opts.maxLengthPerValue !== undefined &&
        val.length > opts.maxLengthPerValue
      ) {
        return `each value must be at most ${opts.maxLengthPerValue} characters long.`;
      }

      if (opts.blockedWords && opts.blockedWords.includes(val)) {
        return `the values like "${opts.blockedWords.join(", ")}" is not allowed.`;
      }
    }

    return "Invalid Csv format.";
  }

  return DefaultErrorFunction(error);
});

function parseAndCleanCsv(value: unknown): string[] {
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0); // Drop empty values
  }
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter((v) => v.length > 0); // Clean provided array items
  }
  return [];
}

export function Csv(options?: CsvOptions) {
  // First: Generate an Unsafe base schema wrapping the input shape (string or string[])
  // while assigning the proper metadata fields TypeBox requires for validation lookup.
  const unsafeSchema = t.Unsafe<string | string[]>({
    [Kind]: "Csv",
    type: "string", // Kept for openAPI/JSON Schema compatibility
    options: options || {},
  });

  // Second: Chain the Transform onto the Unsafe schema.
  // This naturally changes the target type output inside compilation to string[]
  return t
    .Transform(unsafeSchema)
    .Decode((value) => parseAndCleanCsv(value))
    .Encode((value) => value) as TCsv;
}

// export function Csv(options?: CsvOptions): TCsv {
// 	return {
// 		[Kind]: "Csv",
// 		type: "string",
// 		options: options || {},
// 	} as unknown as TCsv;
// }
