import { Kind, Type as t, type TUnsafe } from "@sinclair/typebox";
import type { Options } from "../option";
import { Registry } from "../type_registration";
import type { TArray } from "../..";

export type _TFileSchema = TUnsafe<File> & {
  [Kind]: "File";
  type: "string";
  format: "binary";
  fileType: "file"; // for tailoring the error message based on the file type
};

export interface FileOptions extends Options {
  maxSizeInMb?: number;
  minSizeInMb?: number;
  allowedTypes?: string | string[];
}

export interface TFileSchema extends _TFileSchema, FileOptions {}

export const TFile = (options?: FileOptions): TFileSchema => {
  return t.Unsafe<File>({
    ...options,
    [Kind]: "File", // Triggers Elysia's multipart body parser upgrade
    default: "File",
    type: "string", // Triggers OpenAPI spec for file upload
    format: "binary", // Triggers OpenAPI spec for file upload
  }) as TFileSchema;
};

class FileRegistry extends Registry<TFileSchema, File, File> {
  validator(schema: TFileSchema, value: unknown): string | null {
    const isFile =
      (typeof File !== "undefined" && value instanceof File) ||
      (typeof Blob !== "undefined" && value instanceof Blob);

    if (!isFile) {
      return "Value is not a valid File or Blob.";
    }

    const file = value as File;

    if (schema.allowedTypes) {
      const allowedTypes = Array.isArray(schema.allowedTypes)
        ? schema.allowedTypes
        : [schema.allowedTypes];
      if (!allowedTypes.includes(file.type)) {
        return `File type must be one of: ${allowedTypes.join(", ")}.`;
      }
    }

    if (schema.maxSizeInMb !== undefined) {
      const maxSizeInBytes = schema.maxSizeInMb * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        return `File size must be less than or equal to ${schema.maxSizeInMb} MB.`;
      }
    }

    if (schema.minSizeInMb !== undefined) {
      const minSizeInBytes = schema.minSizeInMb * 1024 * 1024;
      if (file.size < minSizeInBytes) {
        return `File size must be at least ${schema.minSizeInMb} MB.`;
      }
    }

    return null;
  }

  encode(value: File): File {
    return value;
  }

  parse(value: unknown): File {
    if (value instanceof File) {
      return value;
    }
    throw new Error("Value is not a valid File.");
  }
}

const fileRegistry = new FileRegistry("File");

// 1. Define the runtime array as a read-only tuple
const imageMimeTypes = [
  // Standard & Common Formats
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "image/avif",

  // Icons
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "image/apng",

  // High Efficiency & Modern Formats
  "image/heif",
  "image/heic",
  "image/heif-sequence",
  "image/heic-sequence",
  "image/jxl", // JPEG XL

  // JPEG 2000 Variants
  "image/jp2",
  "image/jpx",
  "image/jpm",
  "image/jxs",

  // Texture & Graphics Formats (Web Studio / Gaming / Khronos)
  "image/ktx",
  "image/ktx2",
  "image/dds",
  "image/pkm",

  // Legacy / Vector / Others
  "image/icns",
  "image/flif",
  "image/wmf",
  "image/emf",
] as const;

// 2. Automatically derive the TypeScript Union type from the array values
export type ImageMimeType = (typeof imageMimeTypes)[number];

/**
 * Super reliable runtime validator that functions as a TypeScript Type Guard.
 * Works seamlessly in Node.js, Bun, and Browser environments.
 */
export function isImageMimeType(mimeType: string): mimeType is ImageMimeType {
  return (imageMimeTypes as readonly string[]).includes(mimeType);
}

export interface ImageFileOptions extends FileOptions {
  allowedTypes?: ImageMimeType | ImageMimeType[];
}

export type TImageFileSchema = TFileSchema & {
  [Kind]: "File";
  type: "string";
  format: "binary";
  allowedTypes?: ImageMimeType | ImageMimeType[];
};

export function ImageFile(options?: ImageFileOptions): TImageFileSchema {
  return t.Unsafe<File>({
    ...options,
    [Kind]: "File", // Triggers Elysia's multipart body parser upgrade
    default: "File",
    type: "string", // Triggers OpenAPI spec for file upload
    format: "binary", // Triggers OpenAPI spec for file upload
  }) as TImageFileSchema;
}

export function MultipleImageFiles(
  options?: ImageFileOptions,
): TArray<TImageFileSchema> {
  return t.Array(ImageFile(options));
}
