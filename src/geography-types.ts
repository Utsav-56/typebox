import { Type as t } from "@sinclair/typebox";

import type { Options } from "./options";
import { CoercedNumber } from "./util-types";

export const CoercedLongitude = CoercedNumber({
	minimum: -180,
	maximum: 180,
	description: "Longitude between -180 and 180",
});

export const CoercedLatitude = CoercedNumber({
	minimum: -90,
	maximum: 90,
	description: "Latitude between -90 and 90",
});

export const Coordinate = (option?: Options) =>
	t.Tuple([CoercedLongitude, CoercedLatitude], {
		description: "Geographic point formatted as [longitude, latitude]",
		...option,
	});

// Single source of truth for [lng, lat] arrays (Standard GeoJSON order)
// Handles incoming string/number unions natively via the Coerced children.
export const GeographyPointTuple = t.Tuple([CoercedLongitude, CoercedLatitude], {
	description: "Geographic point formatted as [longitude, latitude]",
});

// Single source of truth for {lat, lng} objects
export const LatLngObject = (option?: Options) =>
	t.Object(
		{
			lat: CoercedLatitude,
			lng: CoercedLongitude,
		},
		option,
	);
