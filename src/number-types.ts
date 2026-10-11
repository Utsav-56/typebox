import { type NumberOptions, type TNumber, Type as t } from "@sinclair/typebox";

export const PositiveNumber = (options?: NumberOptions) =>
	t
		.Transform(t.Union([t.Number(options), t.String()]))
		.Decode((v) => {
			const num = typeof v === "string" ? Number(v) : v;
			if (Number.isNaN(num) || num < 0) throw new Error(`Expected positive number, got ${v}`);
			return num;
		})
		.Encode((v) => v as number) as unknown as TNumber;
