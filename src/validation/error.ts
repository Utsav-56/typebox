import { type Static, Type as t } from "@sinclair/typebox";
import { Nullable } from "../util-types";

export const validationErrorSchema = t.Object({
  name: t.String({
    description: "The name of the field that failed validation",
    examples: ["email", "password", "username"],
  }),
  message: t.String({
    description: "The validation error message",
    examples: [
      "Invalid email format",
      "Password must be at least 8 characters long",
    ],
  }),

  originalMessage: t.Optional(
    t.String({
      description: "The original validation error message from the schema",
      examples: [
        "Invalid email format",
        "Password must be at least 8 characters long",
      ],
    }),
  ),

  originalSummary: t.Optional(
    t.String({
      description: "The original validation error summary from the schema",
      examples: [
        "Invalid email format",
        "Password must be at least 8 characters long",
      ],
    }),
  ),
  originalPath: t.Optional(
    t.String({
      description: "The original validation error path from the schema",
      examples: ["email", "password", "username"],
    }),
  ),

  originalExpected: t.Optional(
    t.Unknown({
      description:
        "The original validation error expected value from the schema",
      examples: ["string", "number", "boolean"],
    }),
  ),

  originalReceived: t.Optional(
    t.Unknown({
      description:
        "The original validation error received value from the schema",
      examples: ["undefined", "null", "object"],
    }),
  ),
});

export type ValidationError = Static<typeof validationErrorSchema>;

export const validationErrorResponseSchema = t.Object({
  message: t.String({
    description:
      "A small message indicating that a validation error occurred, in validation error this is not what we shall focus on and the validationErrors array is what we should focus on",
    examples: [
      "Request could not be processed due to validation errors. Fix the errors and try again.",
    ],
  }),

  validationErrors: Nullable(
    t.Array(validationErrorSchema, {
      description:
        "An array of validation errors, if any, in case of when there is no validation error this is null",
      examples: [
        [
          {
            name: "email",
            message: "Invalid email format",
          },
          {
            name: "password",
            message: "Password must be at least 8 characters long",
          },
        ],
      ],
    }),
  ),
});

export type ValidationErrorResponse = Static<
  typeof validationErrorResponseSchema
>;

export const appErrorResponseSchema = t.Object({
  message: t.String({
    description:
      "A detailed message indicating that an error occurred, this is the main message we should focus on",
    examples: [
      "The post you tried to search does not exist",
      "We cannot process your request due to an unexpected server error. Please try again later.",
    ],
  }),

  validationErrors: Nullable(t.Array(validationErrorSchema)),
});

export type AppErrorResponse = Static<typeof appErrorResponseSchema>;

// Exact Type matches for our response constraints
export type GenericMessageResponse = AppErrorResponse & {
  validationErrors: null;
};

export type GenericValidationResponse = AppErrorResponse & {
  validationErrors: ValidationError[];
};

export function encodeAppErrorMessage(message: string): GenericMessageResponse {
  return {
    message,
    validationErrors: null,
  };
}

export function encodeValidationErrorMessage(
  errors: ValidationError[],
): GenericValidationResponse {
  return {
    message:
      "Request could not be processed due to validation errors. Fix the errors and try again.",
    validationErrors: errors,
  };
}
