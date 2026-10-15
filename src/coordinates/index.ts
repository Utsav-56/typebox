import { Kind, type TTransform } from "@sinclair/typebox";
import type { Options, Transformed } from "../option";
import type { TSchema, TTuple } from "../..";
import { Registry } from "../type_registration";
import { coerceToNumber } from "../utils";

import { Type as t } from "@sinclair/typebox";

export interface LatitudeOptions extends Options<number, number[]> {
  min?: number;
  max?: number;
}

export interface TLatitude extends Transformed<number>, LatitudeOptions {
  [Kind]: "Latitude";
  type: "number";
  static: number;
  format: "integer";
}

export interface TLongitude extends Transformed<number>, LatitudeOptions {
  [Kind]: "Longitude";
  type: "number";
  static: number;
  format: "integer";
}

export type TCoordinate = TTuple<[TLongitude, TLatitude]>;

type Range = [number, number];

function validateRange(
  value: unknown,
  label: string,
  range: Range,
  min?: number,
  max?: number,
): string | null {
  let numberValue: number;

  try {
    numberValue = coerceToNumber(value);
  } catch (error) {
    return `Invalid value, expected a number but received ${JSON.stringify(value)}`;
  }

  /// very first check the range of the value, it should be between the specified range
  if (numberValue < range[0] || numberValue > range[1]) {
    return `${label} must be between ${range[0]} and ${range[1]} degrees.`;
  }

  if (min !== undefined && numberValue < min) {
    return `This Value must be greater than or equal to ${min}.`;
  }

  if (max !== undefined && numberValue > max) {
    return `This Value must be less than or equal to ${max}.`;
  }

  return null;
}

class CoordinateRegistry extends Registry<TSchema, number, string> {
  constructor(
    kind: string,
    private readonly range: Range,
  ) {
    super(kind);
  }

  validator(schema: TSchema, value: unknown): string | null {
    return validateRange(
      value,
      schema[Kind],
      this.range,
      schema.min,
      schema.max,
    );
  }

  encode(value: number): string {
    return value.toString();
  }

  parse(value: unknown): number {
    return coerceToNumber(value);
  }
}

const latitudeRegistry = new CoordinateRegistry("Latitude", [-90, 90]);
const longitudeRegistry = new CoordinateRegistry("Longitude", [-180, 180]);

function Latitude(options?: LatitudeOptions): TLatitude {
  const schema = {
    [Kind]: "Latitude",
    type: "number",
    static: Number,
    format: "integer",
    description: "A valid latitude value is always between -90 and 90 degrees.",
    ...options,
  };

  return t
    .Transform(t.Unsafe(schema))
    .Decode(latitudeRegistry.parse.bind(latitudeRegistry))
    .Encode(latitudeRegistry.encode.bind(latitudeRegistry)) as TLatitude;
}

function Longitude(options?: LatitudeOptions): TLongitude {
  const schema = {
    [Kind]: "Longitude",
    type: "number",
    static: Number,
    format: "integer",
    description:
      "A valid longitude value is always between -180 and 180 degrees.",
    ...options,
  };

  return t
    .Transform(t.Unsafe(schema))
    .Decode(longitudeRegistry.parse.bind(longitudeRegistry))
    .Encode(longitudeRegistry.encode.bind(longitudeRegistry)) as TLongitude;
}

export interface CoordinateOptions extends Options<number, number[]> {
  /**
   * The minimum bounds for the longitude and latitude values.
   *
   * This will be passed to the `min` option of the `Latitude` and `Longitude` types, and will be used to validate the values.
   *
   * @example
   * ```ts
   * const coordinateSchema = Coordinate({ minBounds: [-180, -90] });
   * ```
   */
  minBounds?: Range;
  /**
   * The maximum bounds for the longitude and latitude values.
   *
   * This will be passed to the `max` option of the `Latitude` and `Longitude` types, and will be used to validate the values.
   *
   * @example
   * ```ts
   * const coordinateSchema = Coordinate({ maxBounds: [180, 90] });
   * ```
   */
  maxBounds?: Range;
}

export function Coordinate(options?: CoordinateOptions): TCoordinate {
  return t.Tuple(
    [
      Longitude({
        min: options?.minBounds?.[0],
        max: options?.maxBounds?.[0],
      }),
      Latitude({
        min: options?.minBounds?.[1],
        max: options?.maxBounds?.[1],
      }),
    ],
    {
      description:
        "Geographic point formatted as [longitude, latitude], (Note that this is the standard GeoJSON order not human order of first latitude then longitude).",
      ...options,
    },
  );
}

// export interface CoordinateExtension {
//   Coordinate: (options?: CoordinateOptions) => TTuple<[TLongitude, TLatitude]>;
//   Latitude: (options?: LatitudeOptions) => TLatitude;
//   Longitude: (options?: LatitudeOptions) => TLongitude;
// }

export const CoordinateExtensionImplementation = {
  Coordinate,
  Latitude,
  Longitude,
};

export type CoordinateExtension = typeof CoordinateExtensionImplementation;
