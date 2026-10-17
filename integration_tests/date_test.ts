import { t, type Static } from "../src";

const userSchema = t.Object({
  date: t.DateTime({
    min: new Date("2020-01-01T00:00:00Z"),
    max: new Date("2025-01-01T00:00:00Z"),
  }),
  name: t.String(),
  password: t.Password({
    requireDigit: false,
  }),
});

const validData = {
  date: "2023-08-15T12:34:56Z",
  name: "John Doe",
  password: "password123",
};

const invalidData = {
  date: "2024-01-30T12:34:56Z", // Invalid date because February 30th does not exist
  name: "John Doe",
};

const invalidTypeData = {
  date: 1234567890, // Invalid type because date should be a string or Date object
  name: "John Doe",
};

const outOfRangeData = {
  date: "2025-02-05T00:00:00Z", // Out of range if max is set to a date before this
  name: "John Doe",
};

const { data, error } = t.TryParse(userSchema, validData); // Should pass without errors

type UserType = Static<typeof userSchema>;

if (error) {
  console.error("Validation failed:", error);
  process.exit(1);
} else {
  console.log("Validation succeeded:", data);
}

if (!data) {
  throw new Error("Data is undefined, validation failed.");
}
