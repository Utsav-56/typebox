import {
  Kind,
  TypeRegistry,
  Type as t,
  type StringOptions,
  type TSchema,
  type TTransform,
} from "@sinclair/typebox";
import type { Options } from "../option"; // Ensure this path matches your directory setup
import {
  DefaultErrorFunction,
  SetErrorFunction,
} from "@sinclair/typebox/errors";
import { Registry } from "../type_registration";

// RFC 3339 strict regex for OpenAPI date-time validation
const RFC3339_REGEX =
  /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(\.\d+)?(Z|[+-]([01]\d|2[0-3]):[0-5]\d)$/i;

export interface DateTimeOptions extends Options {
  min?: Date;
  max?: Date;
}

export interface TDateTime extends TTransform<TSchema, Date>, DateTimeOptions {
  [Kind]: "DateTime";
  type: "string";
  format: "date-time";
  static: Date;
}

class DateTimeRegistry extends Registry<TDateTime, Date> {
  constructor() {
    super("DateTime", validateDate);
  }

  parse(value: unknown): Date {
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === "string") {
      return parseDate(value);
    }
    throw new Error(
      `Invalid type for DateTime: expected string or Date, got ${typeof value}`,
    );
  }

  encode(value: Date): string {
    return value.toISOString();
  }

  validator(schema: TDateTime, value: unknown): string | null {
    return validateDate(schema, value);
  }
}

const registry = new DateTimeRegistry();

export function DateTime(options?: DateTimeOptions): TDateTime {
  const schema: TSchema = {
    [Kind]: "DateTime",
    type: "string",
    static: Date,
    params: [],
    format: "date-time",
    ...options,
  };

  return t
    .Transform(t.Unsafe(schema))
    .Decode(registry.parse.bind(registry))
    .Encode(registry.encode.bind(registry)) as TDateTime;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parseDate(value: string | Date): Date {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      throw new Error("The provided date is invalid.");
    }
    return value;
  }

  const match = RFC3339_REGEX.exec(value);
  if (!match) {
    throw new Error(
      "Date must follow the standard format (e.g., 2023-01-01T12:00:00Z).",
    );
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const maxDaysInMonth = daysInMonth(year, month);

  if (day > maxDaysInMonth) {
    const monthName = MONTH_NAMES[month - 1];
    throw new Error(
      `${monthName} only has ${maxDaysInMonth} days in the year ${year} (you provided day ${day}).`,
    );
  }

  const parsedDate = new Date(value);
  if (isNaN(parsedDate.getTime())) {
    throw new Error("The provided date is invalid.");
  }

  return parsedDate;
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function validateDate(schema: TDateTime, value: unknown): string | null {
  if (!(value instanceof Date) && typeof value !== "string") {
    return `Invalid type for DateTime: expected string or Date, got ${typeof value}`;
  }

  let date: Date;
  try {
    date = parseDate(value);
  } catch (error) {
    return error instanceof Error ? error.message : "Invalid date format";
  }

  if (schema.min && date < schema.min) {
    return `Value must be greater than or equal to ${schema.min.toISOString()}`;
  }
  if (schema.max && date > schema.max) {
    return `Value must be less than or equal to ${schema.max.toISOString()}`;
  }
  return null;
}

function isLeapYear(year: number): boolean {
  // https://tools.ietf.org/html/rfc3339#appendix-C
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
