import { expect, test, describe } from "bun:test";
import { Value } from "@sinclair/typebox/value";
import { DateTime } from "../src/dates/date_time"; // Adjust path to your file location

describe("DateTime Custom TypeBox Type", () => {
  describe("Basic Validation & Types", () => {
    const schema = DateTime();

    test("Accepts valid RFC 3339 UTC string and converts to Date", () => {
      const input = "2026-10-09T21:25:43Z";
      expect(Value.Check(schema, input)).toBe(true);

      const decoded = Value.Decode(schema, input);
      expect(decoded).toBeInstanceOf(Date);
      expect(decoded.toISOString()).toBe("2026-10-09T21:25:43.000Z");
    });

    test("Accepts valid ISO string with milliseconds and offset", () => {
      const input = "2026-10-09T21:25:43.511+02:00";
      expect(Value.Check(schema, input)).toBe(true);

      const decoded = Value.Decode(schema, input);
      expect(decoded.getTime()).not.toBeNaN();
    });

    test("Accepts runtime native Date objects", () => {
      const input = new Date();
      expect(Value.Check(schema, input)).toBe(true);
    });

    test("Rejects invalid non-date types", () => {
      expect(Value.Check(schema, 123456789)).toBe(false);
      expect(Value.Check(schema, null)).toBe(false);
      expect(Value.Check(schema, {})).toBe(false);
    });

    test("Rejects non-RFC3339 strings (even if native JS parser allows it)", () => {
      expect(Value.Check(schema, "2026")).toBe(false);
      expect(Value.Check(schema, "2026-10-09")).toBe(false); // Valid date but missing time
      expect(Value.Check(schema, "Friday, October 9, 2026")).toBe(false);
    });

    test("Rejects structurally valid but impossible dates", () => {
      expect(Value.Check(schema, "2026-02-31T10:00:00Z")).toBe(false); // No Feb 31
      expect(Value.Check(schema, "2026-13-10T10:00:00Z")).toBe(false); // No Month 13
    });
  });

  describe("Min / Max Bounds Constraints", () => {
    const minDate = new Date("2026-01-01T00:00:00Z");
    const maxDate = new Date("2026-12-31T23:59:59Z");
    const schema = DateTime({ min: minDate, max: maxDate });

    test("Accepts values perfectly inside the bound limits", () => {
      expect(Value.Check(schema, "2026-06-15T12:00:00Z")).toBe(true);
    });

    test("Accepts exact boundary values", () => {
      expect(Value.Check(schema, "2026-01-01T00:00:00Z")).toBe(true);
      expect(Value.Check(schema, "2026-12-31T23:59:59Z")).toBe(true);
    });

    test("Rejects values that drop below the minimum date bound", () => {
      expect(Value.Check(schema, "2025-12-31T23:59:59Z")).toBe(false);
    });

    test("Rejects values that go beyond the maximum date bound", () => {
      expect(Value.Check(schema, "2027-01-01T00:00:00Z")).toBe(false);
    });
  });
});
