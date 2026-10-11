/**
 * @file this file contains the utilities for the whole app
 * for, e.g instead of defining the `String({ format: "email" })` in every file, we can use `emailType`
 * this keeps things central and one change in one place effects all
 *
 */

import { type TArray, Kind, Type as t, TypeRegistry } from "@sinclair/typebox";

import type { CustomFileOptions, Options, TFileSchema } from "./options";

if (!TypeRegistry.Has("File")) {
  // Note: We type the schema argument generically to avoid `any`
  TypeRegistry.Set(
    "File",
    (schema: Record<string, unknown>, value: unknown) => {
      const isFile =
        (typeof File !== "undefined" && value instanceof File) ||
        (typeof Blob !== "undefined" && value instanceof Blob);

      if (!isFile) return false;

      const file = value as File;

      // RHF Instant Feedback: Validate MIME type if specified in schema
      if (schema.types) {
        const allowedTypes = Array.isArray(schema.types)
          ? schema.types
          : [schema.types];
        if (!allowedTypes.includes(file.type)) return false;
      }

      // Backend Elysia compiler handles robust maxSize checks natively,
      // but it passes this `instanceof` check safely.
      return true;
    },
  );
}

if (!TypeRegistry.Has("Unsafe")) {
  TypeRegistry.Set("Unsafe", (_schema, value) => {
    if (typeof value !== "object" || value === null) return false;
    if (typeof File !== "undefined" && File.prototype.isPrototypeOf(value))
      return true;
    if (typeof Blob !== "undefined" && Blob.prototype.isPrototypeOf(value))
      return true;
    return true;
  });
}

export const TFile = (options?: CustomFileOptions): TFileSchema => {
  return t.Unsafe<File>({
    ...options,
    [Kind]: "File", // Triggers Elysia's multipart body parser upgrade
    default: "File",
    type: "string", // Triggers OpenAPI spec for file upload
    format: "binary", // Triggers OpenAPI spec for file upload
  }) as unknown as TFileSchema;
};

export const createImageSchema = (
  maxSize: string | number = "10m",
  options?: CustomFileOptions,
): TFileSchema =>
  TFile({
    maxSize,
    types: ["image/jpeg", "image/png", "image/webp"],
    ...options,
  });

// oxlint-disable-next-line typescript/no-unsafe-assignment
const imageFileSchema = createImageSchema("10m", {
  error:
    "Invalid file. Must be a valid JPEG, PNG, or WEBP under the size limit.",
});

export const Image = (options?: Options): TFileSchema =>
  createImageSchema("10m", {
    description: "A valid image file, must be a image",
    error:
      "Invalid file. Must be a valid JPEG, PNG, or WEBP under the size limit.",
    ...options,
  });

export const MultipleImages = (options?: Options): TArray<TFileSchema> =>
  t
    .Transform(t.Union([imageFileSchema, t.Array(imageFileSchema)], options))
    .Decode((v) => (Array.isArray(v) ? v : [v]) as File[])
    .Encode(
      (v) => (Array.isArray(v) ? v : [v]) as File[],
    ) as unknown as TArray<TFileSchema>;
