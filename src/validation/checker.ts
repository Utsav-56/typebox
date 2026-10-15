import { Value } from "@sinclair/typebox/value";
import type { Static, TSchema } from "../..";

import { TransformDecodeError } from "@sinclair/typebox/value";

export type ValidationError = {
  name: string;
  message: string;
  originalMessage?: string;
  originalExpected?: unknown;
  originalReceived?: unknown;
  originalPath?: string;
};

export type TryParseResponse<T extends TSchema> = {
  data: Static<T> | null;
  error: ValidationError[] | null;
};

function formatErrorPath(path?: string): string {
  return path ? path.replace(/^\//, "").replace(/\//g, ".") : "root";
}

export function TryParse<T extends TSchema>(
  schema: T,
  data: unknown,
): TryParseResponse<T> {
  const isValid = Value.Check(schema, data);

  if (!isValid) {
    const errors = [...Value.Errors(schema, data)];
    const errs: ValidationError[] = [];

    for (const err of errors) {
      const cleanPath = formatErrorPath(err.path);

      if (err.message?.includes("found: undefined")) {
        errs.push({
          name: cleanPath,
          message: `${cleanPath} is required but was not provided`,
          originalMessage: err.message,
        });
      } else {
        const cleanMessage =
          typeof err.schema?.error === "string"
            ? err.schema.error
            : err.message || `${cleanPath} is invalid`;

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

  // Safe Decode phase: catches any exception thrown inside registry.parse()
  try {
    return {
      data: Value.Decode(schema, data),
      error: null,
    };
  } catch (err) {
    if (err instanceof TransformDecodeError) {
      const cleanPath = formatErrorPath(err.path);
      const innerMessage =
        err.error instanceof Error ? err.error.message : err.message;

      const cleanMessage =
        typeof err.schema?.error === "string"
          ? err.schema.error
          : innerMessage || `${cleanPath} failed to decode`;

      return {
        data: null,
        error: [
          {
            name: cleanPath,
            message: cleanMessage,
            originalMessage: innerMessage,
            originalExpected: err.schema?.static,
            originalReceived: err.value,
            originalPath: err.path,
          },
        ],
      };
    }

    // Fallback for any unexpected non-TypeBox runtime error
    const fallbackMessage =
      err instanceof Error ? err.message : "Unknown decoding error occurred";

    return {
      data: null,
      error: [
        {
          name: "root",
          message: fallbackMessage,
          originalMessage: fallbackMessage,
          originalReceived: data,
          originalPath: "",
        },
      ],
    };
  }
}
