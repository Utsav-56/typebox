import type {
	Static,
	TArray,
	TLiteral,
	TNumber,
	TObject,
	TOptional,
	TRecord,
	TString,
	TTuple,
	TUnion,
} from "@sinclair/typebox";
import { Type as t } from "@sinclair/typebox";

import { Coordinate } from "./geography-types";
import { type Options } from "./options";
import { CoercedNumber, OneOfArray, Range } from "./util-types";

export function Seasons(options?: Options) {
	return OneOfArray(["Spring", "Summer", "Autumn", "Winter"] as const, options);
}

export function DifficultyLevels(options?: Options) {
	return OneOfArray(["Easy", "Moderate", "Hard"] as const, options);
}

export const tripSeasonSchema = Seasons();

export interface TripSchemaExtensions {
	tripOverviewSchema: TObject<{
		bestSeasonToVisit: TOptional<TUnion<TLiteral<"Spring" | "Summer" | "Autumn" | "Winter">[]>>;
		durationOfTrip: TOptional<TNumber>;
		difficultyLevel: TOptional<TUnion<TLiteral<"Easy" | "Moderate" | "Hard">[]>>;
		groupSize: TOptional<
			TObject<{
				min: TNumber;
				max: TNumber;
			}>
		>;
	}>;

	destinationInformationDetailsSchema: TObject<{
		geographicalInfo: TOptional<TString>;
		geographicalHazards: TOptional<TString>;
		extraInformation: TOptional<TRecord<TString, TString>>;
	}>;

	dayWiseScheduleSchema: TObject<{
		day: TNumber;
		title: TString;
		description: TString;
		altitude: TOptional<TNumber>;
	}>;

	tripRoutesSchema: TOptional<
		TArray<
			TObject<{
				name: TString;
				coordinates: TTuple<[TNumber, TNumber]>;
			}>
		>
	>;
	tripSeasonsSchema: TUnion<TLiteral<"Spring" | "Summer" | "Autumn" | "Winter">[]>;
}

export const tripOverviewSchema = t.Object({
	bestSeasonToVisit: t.Optional(Seasons()),

	durationOfTrip: t.Optional(
		CoercedNumber({
			description: "The duration of the trip to the destination, in days",
			examples: [3, 4, 5],
		}),
	),
	difficultyLevel: t.Optional(DifficultyLevels()),
	groupSize: t.Optional(
		Range({
			min: 1,
			description: "The group size for the trip to the destination, in number of people",
		}),
	),
});

export type TripOverview = Static<typeof tripOverviewSchema>;

export const destinationInformationDetailsSchema = t.Object({
	geographicalInfo: t.Optional(
		t.String({
			description:
				"The geographical information of the destination, for example, 'surrounded by mountains and rivers, with a temperate climate.'",
			examples: [
				"surrounded by mountains and rivers, with a temperate climate.",
				"Located in altitude, with a cold climate and snow-capped peaks.",
			],
		}),
	),
	geographicalHazards: t.Optional(
		t.String({
			description: "The geographical hazards of the destination",
			examples: [
				"prone to landslides and floods during the monsoon season.",
				"Located in a seismically active region, with a risk of earthquakes.",
			],
		}),
	),

	// extra random key value pairs, for example, flora and fauna, community and rules, etc.
	// the key is the title of the information, and the value is the description of the information
	extraInformation: t.Optional(
		t.Record(
			t.String({
				examples: ["Flora and Fauna", "Community and Rules", "History and Culture"],
				description:
					"The title of the information, for example, 'Flora and Fauna', 'Community and Rules', etc.",
			}),
			t.String({
				description: "The description of the information,",
				examples: [
					"Protects 88 mammal species including the Snow Leopard, Red Panda, and over 440 bird species including Spiny Babblers.",
				],
			}),
			{},
		),
	),
});

export type DestinationInformationDetails = Static<typeof destinationInformationDetailsSchema>;

export const dayWiseScheduleSchema = t.Object({
	day: CoercedNumber({
		description: "The day number in the destination trip, like day 1, day 2, etc.",
		error: "Day must be a positive number, starting from 1",
		minimum: 1,
	}),
	title: t.String({
		description:
			"The title of the day-wise schedule, like 'Arrival in Kathmandu', 'Trekking to Everest Base Camp', etc.",
		minLength: 3,
		error: "Title must be at least 3 characters long",
		examples: ["Arrival in Kathmandu", "Trekking to Everest Base Camp"],
	}),
	description: t.String({
		description: "The more detailed description of the day-wise schedule.",
		minLength: 10,
		error: "Description must be at least 10 characters long",
		examples: [
			"Arrive in Kathmandu and transfer to the hotel. Rest and prepare for the trek.",
			"Trek to Everest Base Camp, passing through beautiful landscapes and villages.",
		],
	}),
	altitude: t.Optional(
		CoercedNumber({
			description:
				"The altitude of the location for the day-wise schedule, if given will be used for the altitude chart.",
		}),
	),
});

export type DayWiseSchedule = Static<typeof dayWiseScheduleSchema>;

export const routeSchema = t.Object({
	name: t.String(),
	coordinates: Coordinate(),
});

export const tripRoutesSchema = t.Optional(
	t.Array(routeSchema, {
		description:
			"The array of geographical coordinates of the routes we will go in the destination trip, the order does not matter it is just a unordered list",
		error: "If given provide it in proper lat long array format, ",
	}),
);

export type TripRoutes = Static<typeof tripRoutesSchema>;
