import { Kind } from "@sinclair/typebox/type";
import type { TSchema, TTransform } from "../..";
import type { Options } from "../option";
import type { NumberOptions } from "@sinclair/typebox";
import { Registry } from "../type_registration";
import { Type as t } from "@sinclair/typebox";

export interface NumericOptions
  extends
    Options<number, number[]>,
    Omit<NumberOptions, "default" | "examples"> {
  /**
   * The minimum value that can be present in the number
   */
  min?: number;

  /**
   * The maximum value that can be present in the number
   */
  max?: number;

  onlyEven?: boolean;
  onlyOdd?: boolean;

  onlyPositive?: boolean;
  onlyNegative?: boolean;

  onlyInteger?: boolean;

  onlyPrime?: boolean;
}

export type OpenApiNumberFormats = "integer" | "float" | "double" | "long";

export interface TNumeric extends TTransform<TSchema, number>, NumericOptions {
  [Kind]: "Numeric";
  type: "number";
  format?: OpenApiNumberFormats;
  static: number;

  default?: number;
  examples?: number[];
}

class NumericRegistry extends Registry<TNumeric, number, string> {
  validator(schema: TNumeric, value: unknown): string | null {
    const numberValue = typeof value === "number" ? value : Number(value);

    if (isNaN(numberValue)) {
      return `Invalid value, expected a number but received ${JSON.stringify(value)}`;
    }

    if (schema.min !== undefined && numberValue < schema.min) {
      return `Value must be greater than or equal to ${schema.min}.`;
    }

    if (schema.max !== undefined && numberValue > schema.max) {
      return `Value must be less than or equal to ${schema.max}.`;
    }

    if (schema.onlyEven && numberValue % 2 !== 0) {
      return "Value must be an even number.";
    }

    if (schema.onlyOdd && numberValue % 2 === 0) {
      return "Value must be an odd number.";
    }

    if (schema.onlyPositive && numberValue <= 0) {
      return "Value must be a positive number.";
    }

    if (schema.onlyNegative && numberValue >= 0) {
      return "Value must be a negative number.";
    }

    if (schema.onlyInteger && !Number.isInteger(numberValue)) {
      return "Value must be an integer.";
    }

    if (
      schema.multipleOf !== undefined &&
      numberValue % schema.multipleOf !== 0
    ) {
      return `Value must be a multiple of ${schema.multipleOf}.`;
    }

    // inline implementation of isPrime to avoid extra function call
    if (schema.onlyPrime) {
      if (numberValue <= 1) return "Value must be a prime number."; // 0 and 1 are not prime

      if (numberValue % 2 === 0 || numberValue % 3 === 0)
        return "Value must be a prime number.";

      const boundary = Math.floor(Math.sqrt(numberValue));
      for (let i = 5; i <= boundary; i += 6) {
        if (numberValue % i === 0 || numberValue % (i + 2) === 0) {
          return "Value must be a prime number.";
        }
      }
    }

    return null;
  }

  encode(value: number): string {
    return value.toString();
  }

  parse(value: unknown): number {
    const numberValue = typeof value === "number" ? value : Number(value);
    if (isNaN(numberValue)) {
      throw new Error(
        `Invalid value, expected a number but received ${JSON.stringify(value)}`,
      );
    }
    return numberValue;
  }
}

const registry = new NumericRegistry("Numeric");

export function Numeric(
  options?: NumericOptions,
  format: OpenApiNumberFormats = "double",
): TNumeric {
  const schema = {
    [Kind]: "Numeric",
    type: "number",
    static: Number,
    format: options?.onlyInteger ? "integer" : format,
    ...options,
  };

  return t
    .Transform(t.Unsafe(schema))
    .Decode(registry.parse.bind(registry))
    .Encode(registry.encode.bind(registry)) as TNumeric;
}

export function PositiveNumber(
  options?: Omit<NumericOptions, "onlyPositive">,
): TNumeric {
  return Numeric({
    description: "A positive number greater than zero.",
    ...options,
    onlyPositive: true,
  });
}

export function NegativeNumber(
  options?: Omit<NumericOptions, "onlyNegative">,
): TNumeric {
  return Numeric({
    description: "A negative number less than zero.",
    examples: [-1, -2, -3, -4, -5],
    ...options,
    onlyNegative: true,
  });
}

export function Integer(
  options?: Omit<NumericOptions, "onlyInteger">,
): TNumeric {
  return Numeric(
    {
      description: "An integer number, without any decimal part.",
      examples: [1, 2, 3, 4, 5],

      ...options,
      onlyInteger: true,
    },
    "integer",
  );
}

export function EvenNumber(
  options?: Omit<NumericOptions, "onlyEven">,
): TNumeric {
  return Numeric({
    description: "An even number.",
    examples: [2, 4, 6, 8, 10],

    ...options,
    onlyEven: true,
  });
}

export function OddNumber(options?: Omit<NumericOptions, "onlyOdd">): TNumeric {
  return Numeric({
    description: "An odd number.",
    examples: [1, 3, 5, 7, 9],
    ...options,
    onlyOdd: true,
  });
}

export function PrimeNumber(
  options?: Omit<NumericOptions, "onlyPrime">,
): TNumeric {
  return Numeric({
    description: "A prime number (Only divisible by 1 and itself).",
    examples: [2, 3, 5, 7, 11],
    ...options,
    onlyPrime: true,
  });
}

export const NumberExtensionImplementation = {
  Numeric,
  PositiveNumber,
  NegativeNumber,
  Integer,
  EvenNumber,
  OddNumber,
  PrimeNumber,
};

export type NumberExtension = typeof NumberExtensionImplementation;
