import type {
  Kind,
  SchemaOptions,
  StringOptions,
  TSchema,
  TTransform,
  TUnsafe,
} from "@sinclair/typebox";
import type { Options } from "./option";

export type { Options };

// export interface Options extends SchemaOptions {
// 	error?: string;
// }

export type FormatlessStringOption = Exclude<
  StringOptions,
  "format" | "pattern"
>;

export interface OneOfOptions<ST extends readonly string[]> extends Options {
  default?: ST[number];
}

// Definition for custom TypeBox File options
export interface CustomFileOptions extends Options {
  maxSize?: string | number;
  minSize?: string | number;
  types?: string | string[];
}

export type TFileSchema = TUnsafe<File> & {
  [Kind]: "File";
  type: "string";
  format: "binary";
};

export interface PasswordOptions extends Options {
  /** The maximum string length
   *
   * must be at least 8 same as min length
   *
   */
  maxLength?: number;

  /** The minimum string length
   *
   * Must bee less then 8 characters long
   * if passed anything less than 8 we reject it and fallback to 8 as default
   *
   */
  minLength?: number;

  /**
   * defaults to true, must explicitly set to false to disable
   */
  requireSpecial?: boolean;

  /**
   * defaults to true, must explicitly set to false to disable
   */
  requireDigit?: boolean;

  /**
   * defaults to true, must explicitly set to false to disable
   */
  requireUpperCase?: boolean;
}

export interface TPassword extends TSchema {
  [Kind]: "Password";
  options: PasswordOptions;
  static: string;
  type: "string";
}

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

export interface TCsv extends TTransform<TSchema, string[]> {
  [Kind]: "Csv";
  options?: CsvOptions;
  static: string[];
  type: "string";
}

export type { TUrl } from "./url-type";

export interface RangeOptions extends Options {
  max?: number;
  min?: number;
}

export type {
  DayWiseSchedule,
  DestinationInformationDetails,
  TripOverview,
  TripRoutes,
  TripSchemaExtensions,
} from "./trip-types";
