import type { StaticDecode, TSchema } from "@sinclair/typebox";
import { TypeCheck } from "@sinclair/typebox/compiler";
import {
  TransformDecodeError,
  Value,
  type ValueError,
} from "@sinclair/typebox/value";
import type { ValidationError } from "./error";

export type TryParseResponse<T extends TSchema> =
  | { data: StaticDecode<T>; error: null }
  | { data: null; error: ValidationError[] };

const formatPath = (path?: string): string =>
  path ? path.replace(/^\//, "").replace(/\//g, ".") : "root";

const resolveMessage = (
  schema: TSchema | undefined,
  fallbackMessage: string | undefined,
  defaultLabel: string,
): string =>
  typeof schema?.error === "string"
    ? schema.error
    : fallbackMessage || defaultLabel;

function formatValueError(err: ValueError): ValidationError {
  const name = formatPath(err.path);

  if (err.message?.includes("found: undefined")) {
    return {
      name,
      message: `${name} is required but was not provided`,
      originalMessage: err.message,
      type: String(err.type),
    };
  }

  return {
    name,
    message: resolveMessage(err.schema, err.message, `${name} is invalid`),
    originalMessage: err.message,
    originalExpected: err.schema?.static,
    originalReceived: err.value,
    originalPath: err.path,
    type: String(err.type),
  };
}

export function TryParse<T extends TSchema>(
  schema: T | TypeCheck<T>,
  data: unknown,
): TryParseResponse<T> {
  const isCompiled = schema instanceof TypeCheck;
  const isValid = isCompiled ? schema.Check(data) : Value.Check(schema, data);

  if (!isValid) {
    const rawErrors = isCompiled
      ? schema.Errors(data)
      : Value.Errors(schema, data);
    return {
      data: null,
      error: Array.from(rawErrors, formatValueError),
    };
  }

  try {
    return {
      data: isCompiled ? schema.Decode(data) : Value.Decode(schema, data),
      error: null,
    };
  } catch (err) {
    if (err instanceof TransformDecodeError) {
      const name = formatPath(err.path);
      const innerMsg =
        err.error instanceof Error ? err.error.message : err.message;

      return {
        data: null,
        error: [
          {
            name,
            message: resolveMessage(
              err.schema,
              innerMsg,
              `${name} failed to decode`,
            ),
            originalMessage: innerMsg,
            originalExpected: err.schema?.static,
            originalReceived: err.value,
            originalPath: err.path,
            type: "decode",
          },
        ],
      };
    }

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
          type: "exception",
        },
      ],
    };
  }
}
