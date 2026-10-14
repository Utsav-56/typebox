import { TryParse } from "./checker";

export const ValidationExtensionImplementation = {
  TryParse,
};

export type ValidationExtension = typeof ValidationExtensionImplementation;
