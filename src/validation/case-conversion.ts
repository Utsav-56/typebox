import { Type, type TObject, type TProperties } from "@sinclair/typebox";
import { type TSchema } from "@unseen/typebox";

// Correctly handles deep recursive snake_case to camelCase conversion for types
type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
	? `${Lowercase<T>}${Capitalize<SnakeToCamel<U>>}`
	: Lowercase<S>;

type CamelCaseProperties<T extends TProperties> = {
	[K in keyof T as K extends string ? SnakeToCamel<K> : K]: T[K];
};

// Maps a TObject schema structure to a new TObject schema structure with camelCase keys
export type CamelCaseSchema<T extends TObject<TProperties>> = TObject<
	CamelCaseProperties<T["properties"]>
>;

export type CamelCaseKeys<T> = {
	[K in keyof T as K extends string ? SnakeToCamel<K> : K]: T[K];
};

// Runtime converter
export function asCamelCaseSchema<T extends TObject<TProperties>>(schema: T): CamelCaseSchema<T> {
	const sourceProperties = schema.properties;
	const targetProperties = {} as Record<string, TSchema>;

	for (const key in sourceProperties) {
		if (Object.prototype.hasOwnProperty.call(sourceProperties, key)) {
			// Convert snake_case key to camelCase
			const camelKey = key
				.toLowerCase()
				.replaceAll(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase());

			// Direct assignment keeps exact original sub-schema validator reference intact
			targetProperties[camelKey] = sourceProperties[key]!;
		}
	}

	// Create a new clone using TypeBox's native composition safely
	// Copy over original schema options (like description, additionalProperties, etc.)
	const transformed = Type.Object(targetProperties as CamelCaseProperties<T["properties"]>, {
		...schema.options,
	});

	return transformed as unknown as CamelCaseSchema<T>;
}
