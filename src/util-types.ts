/**
 * @file this file contains the utilities for the whole app
 * for, e.g instead of defining the `String({ format: "email" })` in every file, we can use `emailType`
 * this keeps things central and one change in one place effects all
 *
 */

import {
	type NumberOptions,
	type SchemaOptions,
	type StringOptions,
	type TArray,
	type TLiteral,
	type TNumber,
	type TOptional,
	type TSchema,
	type TString,
	type TUnion,
	Type as t,
} from "@sinclair/typebox";

import type { FormatlessStringOption, OneOfOptions, Options, RangeOptions } from "./options";

/**
 * By default the typebox does not allow a value to be missing or null in an object.
 * providing this makes sure the value is undefined or null both cases included
 * @param schema the schema that needs to be validated if given
 * @param options the schema options
 * @returns The optional and nullable type
 */
export function Nullable<T extends TSchema>(schema: T, options?: SchemaOptions) {
	return t.Optional(t.Union([schema, t.Null()], options));
}

export const Email = (options?: FormatlessStringOption) =>
	t.String({
		format: "email",
		error: "Invalid email address must be a proper email address",
		examples: ["anakin@skywalker.com"],

		...options,
	});

export const Uuid = (options?: FormatlessStringOption) =>
	t.String({
		format: "uuid",
		...options,
	});

export const StringArray = (options?: Options) =>
	t
		.Transform(t.Union([t.String(), t.Array(t.String(), options)]))
		.Decode((v) => (Array.isArray(v) ? v : [v]) as string[])
		.Encode((v) => (Array.isArray(v) ? v : [v]) as string[]) as unknown as TArray<TString>;

export const OneOfArray = <ST extends readonly string[]>(
	values: ST,
	options?: OneOfOptions<ST>,
) => {
	return t.Union(
		values.map((it) => t.Literal(it) as TLiteral<ST[number]>),
		{
			description: `The value must be one of ${values.join(", ")}.`,
			error: `Invalid value, must be one of ${values.join(", ")}`,
			examples: values,
			...options,
		},
	);
};
export const OptionalOneOfArray = <ST extends readonly string[]>(
	values: ST,
	options?: OneOfOptions<ST>,
): TOptional<TUnion<TLiteral<ST[number]>[]>> => {
	return t.Optional(OneOfArray(values, options));
};

export * from "./password-types";
export * from "./url-type";

export const CoerecedString = (options?: StringOptions) =>
	t
		.Transform(t.Any(options))
		.Decode((v) => {
			if (typeof v === "string") return v;
			if (v === null || v === undefined) return "";
			return String(v);
		})
		.Encode((v) => v as string) as unknown as TString;

export const CoercedNumber = (options?: NumberOptions & Options) =>
	t
		.Transform(t.Union([t.Number(options), t.String()]))
		.Decode((v) => {
			const num = typeof v === "string" ? Number(v) : v;
			if (Number.isNaN(num)) throw new Error(`Expected numeric, got ${JSON.stringify(v)}`);
			return num;
		})
		.Encode((v) => v as number) as unknown as TNumber;

export function Range(options: RangeOptions) {
	return t.Object(
		{
			min: CoercedNumber({
				minimum: options.min,
			}),
			max: CoercedNumber({
				maximum: options.max,
			}),
		},
		{
			maxProperties: 2,
			minProperties: 2,
			description: "The range of values, with minimum and maximum values,",
			examples: [
				{ min: 2, max: 10 },
				{ min: 1, max: 5 },
			],
			...options,
		},
	);
}
