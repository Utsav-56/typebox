import { Kind, type TSchema } from "@sinclair/typebox";
import type { Options } from "../option";
import { Registry } from "../type_registration";

import { coerceToString } from "../utils";

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

export interface TPassword extends TSchema, PasswordOptions {
  [Kind]: "Password";
  static: string;
  type: "string";
  format: "string";
}

class PasswordRegistry extends Registry<TPassword, string, string> {
  validator(schema: TPassword, value: unknown): string | null {
    let finalValue: string;

    try {
      finalValue = coerceToString(value);
    } catch (error) {
      return `Invalid value, expected a string but received ${JSON.stringify(value)}`;
    }

    // all these security are default to true, if the user does not provide them, explicitly set them to false to disable them
    const requireUpperCase = schema.requireUpperCase ?? true;
    const requireDigit = schema.requireDigit ?? true;
    const requireSpecial = schema.requireSpecial ?? true;

    const errorDomain = [];

    if (requireDigit && !/[0-9]/.test(finalValue))
      errorDomain.push("one digit");
    if (requireUpperCase && !/[A-Z]/.test(finalValue))
      errorDomain.push("one uppercase letter");
    if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(finalValue))
      errorDomain.push("one special character");

    if (errorDomain.length > 0) {
      return `Password must contain at least ${this.joinArray(errorDomain)}.`;
    }

    return null;
  }

  encode(value: string): string {
    return value;
  }

  parse(value: unknown): string {
    if (typeof value === "string") {
      return value;
    }
    throw new Error(
      `Invalid value, expected a string but received ${JSON.stringify(value)}`,
    );
  }

  joinArray(arr: string[]): string {
    if (arr.length === 0) {
      return "";
    } else if (arr.length === 1) {
      return arr[0]!;
    } else if (arr.length === 2) {
      return `${arr[0]} and ${arr[1]}`;
    } else {
      const last = arr.pop();
      return `${arr.join(", ")}, and ${last}`;
    }
  }
}

const passwordRegistry = new PasswordRegistry("Password");

export function Password(options?: PasswordOptions): TPassword {
  let description = "A valid password, ";

  const neededDomains = [];

  if (options?.requireDigit ?? true) neededDomains.push("one digit");
  if (options?.requireUpperCase ?? true)
    neededDomains.push("one uppercase letter");
  if (options?.requireSpecial ?? true)
    neededDomains.push("one special character");

  if (neededDomains.length > 0) {
    description += `must contain at least ${passwordRegistry.joinArray(neededDomains)}.`;
  }

  const schema = {
    [Kind]: "Password",
    type: "string",
    format: "string",
    ...options,
  };

  return schema as TPassword;
}
