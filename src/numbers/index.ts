import { Kind } from "@sinclair/typebox/type";
import type { TSchema, TTransform } from "../..";
import type { Options } from "../option";
import type { NumberOptions } from "@sinclair/typebox";
import { Registry } from "../type_registration";
import { Type as t } from "@sinclair/typebox";

export interface IntegerTypesOptions
  extends
    Options<number, number[]>,
    Omit<NumberOptions, "default" | "examples"> {
  onlyEven?: boolean;
  onlyOdd?: boolean;

  onlyPositive?: boolean;
  onlyNegative?: boolean;

  onlyPrime?: boolean;
}

export interface IntegerOptions extends IntegerTypesOptions {
  /**
   * The minimum value that can be present in the number
   */
  min?: number | bigint;

  /**
   * The maximum value that can be present in the number
   */
  max?: number | bigint;
}

export interface NumericOptions extends IntegerOptions {
  onlyInteger?: boolean;
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

    const isOnlyPositive = schema.onlyPositive || schema.unsigned;

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

    if (isOnlyPositive && numberValue <= 0) {
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

export function Integer(options?: IntegerOptions): TNumeric {
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

export const INT8_MIN = -128;
export const INT8_MAX = 127;
export const UINT8_MAX = 255;

export const INT16_MIN = -32768;
export const INT16_MAX = 32767;
export const UINT16_MAX = 65535;

export const INT24_MIN = -8388608;
export const INT24_MAX = 8388607;
export const UINT24_MAX = 16777215;

export const INT32_MIN = -2147483648;
export const INT32_MAX = 2147483647;
export const UINT32_MAX = 4294967295;

export const INT64_MIN = -9223372036854775808n;
export const INT64_MAX = 9223372036854775807n;
export const UINT64_MAX = 18446744073709551615n;

interface MakeDescriptionOptions {
  description: string;
  examples: number[];
  error: string;
}

export function makeDescriptiveOptions(
  label: string,
  isUnsigned: boolean,
  min: number | bigint | undefined,
  max: number | bigint | undefined,
): MakeDescriptionOptions {
  let description: string;

  if (isUnsigned) {
    description = `An unsigned (non-negative)  ${label || "integer"} number between ${min} and ${max}.`;
  }
  description = `An ${label || "integer"} number between ${min} and ${max}.`;

  return {
    description,
    error: `The value must be between ${min} and ${max}.`,
    examples: [Number(min), Number(max)],
  };
}

export function TinyInteger(options?: IntegerTypesOptions): TNumeric {
  const isUnsigned = options?.onlyPositive || false;

  return Numeric(
    {
      ...makeDescriptiveOptions(
        "tiny integer",
        isUnsigned,
        isUnsigned ? 0 : INT8_MIN,
        isUnsigned ? UINT8_MAX : INT8_MAX,
      ),
      ...options,
      examples: [1, 2, 3, 4, 5],
      minimum: isUnsigned ? 0 : INT8_MIN,
      maximum: isUnsigned ? UINT8_MAX : INT8_MAX,

      onlyInteger: true,
    },
    "integer",
  );
}

export function SmallInteger(options?: IntegerTypesOptions): TNumeric {
  const isUnsigned = options?.onlyPositive || false;

  return Numeric(
    {
      ...makeDescriptiveOptions(
        "small integer",
        isUnsigned,
        isUnsigned ? 0 : INT16_MIN,
        isUnsigned ? UINT16_MAX : INT16_MAX,
      ),

      min: isUnsigned ? 0 : INT16_MIN,
      max: isUnsigned ? UINT16_MAX : INT16_MAX,
      ...options,
      onlyInteger: true,
    },
    "integer",
  );
}

export function MediumInteger(options?: IntegerTypesOptions): TNumeric {
  const isUnsigned = options?.onlyPositive || false;

  return Numeric({
    ...makeDescriptiveOptions(
      "medium integer",
      isUnsigned,
      isUnsigned ? 0 : INT24_MIN,
      isUnsigned ? UINT24_MAX : INT24_MAX,
    ),
    ...options,

    min: isUnsigned ? 0 : INT24_MIN,
    max: isUnsigned ? UINT24_MAX : INT24_MAX,
  });
}

export function Integer32(options?: IntegerTypesOptions): TNumeric {
  const isUnsigned = options?.onlyPositive || false;

  return Numeric({
    ...makeDescriptiveOptions(
      "32-bit integer",
      isUnsigned,
      isUnsigned ? 0 : INT32_MIN,
      isUnsigned ? UINT32_MAX : INT32_MAX,
    ),
    ...options,

    min: isUnsigned ? 0 : INT32_MIN,
    max: isUnsigned ? UINT32_MAX : INT32_MAX,
  });
}

export function BigInteger(options?: IntegerTypesOptions): TNumeric {
  const isUnsigned = options?.onlyPositive || false;

  return Numeric({
    ...makeDescriptiveOptions(
      "64-bit integer",
      isUnsigned,
      isUnsigned ? 0n : INT64_MIN,
      isUnsigned ? UINT64_MAX : INT64_MAX,
    ),
    ...options,
    min: options?.onlyPositive ? 0n : INT64_MIN,
    max: options?.onlyPositive ? UINT64_MAX : INT64_MAX,
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

  TinyInteger,
  SmallInteger,
  MediumInteger,
  Integer32,
  BigInteger,
};

export type NumberExtension = typeof NumberExtensionImplementation;
