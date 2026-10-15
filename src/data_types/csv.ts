import { Kind, Type as t } from "@sinclair/typebox";
import type { Options, Transformed } from "../option";
import { Registry } from "../type_registration";

export interface CsvOptions extends Options {
  minValues?: number;

  /**
   * The max amount of values that can be present in the CSV array
   */
  maxValues?: number;

  /**
   * The minimum length of each value in the CSV array
   */
  minLengthPerValue?: number;

  maxLengthPerValue?: number;

  blockedWords?: string[];
}

export interface TCsv extends Transformed<string[]>, CsvOptions {
  [Kind]: "Csv";
  static: string[];
  type: "string";
}

class CsvRegistry extends Registry<TCsv, string[], string> {
  validator(schema: TCsv, value: unknown): string | null {
    if (value === null || value === undefined) {
      return "This field cannot be null or undefined";
    }

    if (typeof value !== "string") {
      return `Invalid value, expected a comma seperated string but received ${JSON.stringify(value)}`;
    }

    const values = value.split(",").map((v) => v.trim());

    if (schema.minValues !== undefined && values.length < schema.minValues) {
      return `mimimum ${schema.minValues} values are needed`;
    }

    if (schema.maxValues !== undefined && values.length > schema.maxValues) {
      return `maximum ${schema.maxValues} values are allowed`;
    }

    for (const val of values) {
      if (
        schema.minLengthPerValue !== undefined &&
        val.length < schema.minLengthPerValue
      ) {
        return `minimum length of each value should be ${schema.minLengthPerValue}`;
      }

      if (
        schema.maxLengthPerValue !== undefined &&
        val.length > schema.maxLengthPerValue
      ) {
        return `maximum length of each value should be ${schema.maxLengthPerValue}`;
      }

      if (schema.blockedWords?.includes(val)) {
        return `the values like "${schema.blockedWords.join(", ")}" is not allowed.`;
      }
    }

    return null;
  }

  parse(value: unknown): string[] {
    if (typeof value !== "string") {
      throw new Error(
        `Invalid value, expected a comma seperated string but received ${JSON.stringify(value)}`,
      );
    }

    return value.split(",").map((v) => v.trim());
  }

  encode(value: string[]): string {
    return value.join(",");
  }
}

const registry = new CsvRegistry("Csv");

export function Csv(options?: CsvOptions): TCsv {
  const schema = {
    [Kind]: "Csv",
    type: "string",
    format: "string",
    description: "A comma seperated string",
    examples: ["value1,value2,value3"],
    ...options,
  };

  return t
    .Transform(t.Unsafe(schema))
    .Decode(registry.parse.bind(registry))
    .Encode(registry.encode.bind(registry)) as TCsv;
}
