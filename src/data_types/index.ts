import { Csv } from "./csv";

export * from "./csv";

export const DataTypesExtensionImplementation = {
  Csv,
};

export type DataTypesExtension = typeof DataTypesExtensionImplementation;
