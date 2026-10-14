import { Type as t, type TSchema } from "@sinclair/typebox";
import type { TNull, TUnion } from "..";

export function Nullable<T extends TSchema>(schema: T): TUnion<[T, TNull]> {
  return t.Union([schema, t.Null()]);
}
