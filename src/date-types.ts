import { type TDate, type TString, Type as t } from "@sinclair/typebox";

import type { Options } from "./option";

export const CoercedDate = (options?: Options) =>
  t
    .Transform(t.Union([t.Date(), t.String()], options))
    .Decode((v) => {
      const date = new Date(v);
      if (Number.isNaN(date.getTime()))
        throw new Error(`Invalid Date: ${JSON.stringify(v)}`);
      return date;
    })
    .Encode((v) => (v instanceof Date ? v : new Date(v))) as unknown as TDate;

export const PastDate = (options?: Options) =>
  t
    .Transform(t.Union([t.Date(), t.String()], options))
    .Decode((v) => {
      const date = new Date(v);
      if (Number.isNaN(date.getTime()))
        throw new Error(`Invalid Date: ${JSON.stringify(v)}`);
      if (date.getTime() >= Date.now())
        throw new Error("Date must be in the past");
      return date;
    })
    .Encode((v) => (v instanceof Date ? v : new Date(v))) as unknown as TDate;

export const FutureDate = (options?: Options) =>
  t
    .Transform(t.Union([t.Date(), t.String()], options))
    .Decode((v) => {
      const date = new Date(v);
      if (Number.isNaN(date.getTime()))
        throw new Error(`Invalid Date: ${JSON.stringify(v)}`);
      if (date.getTime() <= Date.now())
        throw new Error("Date must be in the future");
      return date;
    })
    .Encode((v) => (v instanceof Date ? v : new Date(v))) as unknown as TDate;

export const IsoTimestamp = (options?: Options) =>
  t.String({
    pattern:
      "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?([+-]\\d{2}:\\d{2})?Z?$",
    description: "The start date time, in ISO string format",
    error: "Start date time must be in ISO string format",
    examples: ["2024-12-25T10:00:00+05:45"],
    ...options,
  });

export const IsoTIme = (options?: Options) =>
  t
    .Transform(t.Union([t.Date(), t.String()], options))
    .Decode((v) => {
      if (!v) {
        throw new Error("No date provided");
      }

      const date = new Date(v);
      if (Number.isNaN(date.getTime()))
        throw new Error(`Invalid Date: ${JSON.stringify(v)}`);

      return date;
    })
    .Encode((v) => v.toISOString()) as unknown as TString;

const isoTimeStampSchema = IsoTIme();

export const TstzRange = (options?: Options) =>
  t.Object(
    {
      start: isoTimeStampSchema,
      end: isoTimeStampSchema,
    },
    {
      description: "postgres time stamp with time zone range",
      error:
        "both start and end date time is needed and both must have a valid ISO string format",
      examples: [
        {
          start: "2024-12-25T10:00:00+05:45",
          end: "2024-12-26T10:00:00+05:45",
        },
      ],
      ...options,
    },
  );

export const UnboundedTstzRange = (options?: Options) =>
  t.Object(
    {
      start: t.Optional(isoTimeStampSchema),
      end: t.Optional(isoTimeStampSchema),
    },
    {
      description: "postgres time stamp with time zone range",
      error:
        "both start and end date time is needed and both must have a valid ISO string format",
      examples: [
        {
          start: "2024-12-25T10:00:00+05:45",
          end: "2024-12-26T10:00:00+05:45",
        },
      ],
      ...options,
    },
  );
