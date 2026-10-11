import { Kind, TypeRegistry } from "@sinclair/typebox";
import {
  DefaultErrorFunction,
  SetErrorFunction,
} from "@sinclair/typebox/errors";

import type { PasswordOptions, TPassword } from "./options";

TypeRegistry.Set<string>("Password", (schema: unknown, value: unknown) => {
  if (typeof value !== "string") return false;

  const opts = (schema as TPassword).options || {};

  let minLength = 8;
  let maxLength = 64;

  const requireUpperCase = opts.requireUpperCase ?? true;
  const requireDigit = opts.requireDigit ?? true;
  const requireSpecial = opts.requireSpecial ?? true;

  if (minLength !== undefined && value.length < minLength) return false;
  if (maxLength !== undefined && value.length > maxLength) return false;

  if (requireDigit && !/[0-9]/.test(value)) return false;
  if (requireUpperCase && !/[A-Z]/.test(value)) return false;
  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) return false;

  return true;
});

SetErrorFunction((error) => {
  if (error.schema[Kind] === "Password" && typeof error.value === "string") {
    const opts = (error.schema as TPassword).options || {};

    let minLength = 8;
    let maxLength = 64;

    const requireUpperCase = opts.requireUpperCase ?? true;
    const requireDigit = opts.requireDigit ?? true;
    const requireSpecial = opts.requireSpecial ?? true;

    const value = error.value;

    if (value.length > maxLength || value.length < minLength) {
      return `Password must be at least ${minLength} and at most ${maxLength} characters long.`;
    }

    const errorDomain = [];

    if (requireDigit && !/[0-9]/.test(value)) errorDomain.push("one digit");
    if (requireUpperCase && !/[A-Z]/.test(value))
      errorDomain.push("one uppercase letter");
    if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(value))
      errorDomain.push("one special character");

    if (errorDomain.length > 0) {
      return `Password must contain ${errorDomain.join(", ")}.`;
    }

    return "Invalid password format.";
  }

  return DefaultErrorFunction(error);
});

export function Password(options?: PasswordOptions): TPassword {
  return {
    [Kind]: "Password",
    type: "string",
    options: options || {},
  } as unknown as TPassword;
}
