import { Csv } from "./csv";
import { UrlExtensionImplementation } from "./url";

export * from "./csv";

export const DataTypesExtensionImplementation = {
  Csv,
  ...UrlExtensionImplementation,
};

export type DataTypesExtension = typeof DataTypesExtensionImplementation;

export type * from "./csv";
export type * from "./url";
