import type { SchemaOptions } from "@sinclair/typebox";
import type { TSchema } from "..";

export interface Options extends SchemaOptions {
  error?: string;

  message?: (value: unknown, schema: TSchema) => string;
}
