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
  originalMessage: t.Optional(t.String()),
  originalSummary: t.Optional(t.String()),
  originalPath: t.Optional(t.String()),
  originalExpected: t.Optional(t.Unknown()),
  originalReceived: t.Optional(t.Unknown()),
  // Added optional type code so RHF criteriaMode="all" can group by error type
  type: t.Optional(t.String()),
});

export type ValidationError = Static<typeof validationErrorSchema>;

export const appErrorResponseSchema = t.Object({
  message: t.String({
    description: "A detailed message indicating that an error occurred",
  }),
  validationErrors: Nullable(t.Array(validationErrorSchema)),
});

export type AppErrorResponse = Static<typeof appErrorResponseSchema>;
export type ValidationErrorResponse = AppErrorResponse;

export type GenericMessageResponse = AppErrorResponse & {
  validationErrors: null;
};
export type GenericValidationResponse = AppErrorResponse & {
  validationErrors: ValidationError[];
};

export const encodeAppErrorMessage = (
  message: string,
): GenericMessageResponse => ({
  message,
  validationErrors: null,
});

export const encodeValidationErrorMessage = (
  validationErrors: ValidationError[],
): GenericValidationResponse => ({
  message:
    "Request could not be processed due to validation errors. Fix the errors and try again.",
  validationErrors,
});
