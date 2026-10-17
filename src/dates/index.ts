import { DateTime, FutureDateTime, PastDateTime } from "./date_time";

export * from "./date_time";
export type * from "./date_time";

// export interface DateExtension {
//   DateTime: (options?: DateTimeOptions) => TDateTime;
//   PastDateTime: (options?: Omit<DateTimeOptions, "max">) => TDateTime;
//   FutureDateTime: (options?: Omit<DateTimeOptions, "min">) => TDateTime;
// }

export const DateExtensionImplementation = {
  DateTime,
  PastDateTime,
  FutureDateTime,
};

/**
 * Make it infer from the object rather then hardcoded interface, so that we can add more date types in the future without changing this interface.
 */
export type DateExtension = typeof DateExtensionImplementation;

export type * from "./date_time";
