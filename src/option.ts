import type { SchemaOptions } from "@sinclair/typebox";

export interface Options<
  // oxlint-disable-next-line typescript/no-explicit-any as the main typebox allows any we cannot fight agains it
  Default = any,
  example = Default[],
> extends SchemaOptions {
  error?: string;

  default?: Default;
  examples?: example;
}
