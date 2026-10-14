import { Value } from "@sinclair/typebox/value";
import type { Static, TSchema, ValidationError } from "../..";

export function TryParse<T extends TSchema>(
  schema: TSchema,
  data: unknown,
): TryParseResponse<T> {
  const isValid = Value.Check(schema, data);

  if (!isValid) {
    const errors = [...Value.Errors(schema, data)];

    const errs: ValidationError[] = [];

    for (const err of errors) {
      const cleanPath = err.path
        ? err.path.replace(/^\//, "").replace(/\//g, ".")
        : "root";

      if (err.message?.includes("found: undefined")) {
        errs.push({
          name: cleanPath,
          message: `${cleanPath} is required but was not provided`,
          originalMessage: err.message,
        });
      } else {
        let cleanMessage = "";
        if (err.schema?.error && typeof err.schema.error === "string") {
          cleanMessage = err.schema.error;
        } else {
          cleanMessage = err.message || `${cleanPath} is invalid`;
        }

        errs.push({
          name: cleanPath,
          message: cleanMessage,
          originalMessage: err.message,
          originalExpected: err.schema.static,
          originalReceived: err.value,
          originalPath: err.path,
        });
      }
    }

    return {
      data: null,
      error: errs,
    };
  }

  return {
    data: Value.Decode(schema, data),
    error: null,
  };
}

export type TryParseResponse<T extends TSchema> = {
  data: Static<T> | null;
  error: ValidationError[] | null;
};
