import { describe, expect, test } from "vitest";

import { formatBehavioralDate } from "../src/lib/dates";

describe("behavioral record dates", () => {
  test("uses precision for both visible and machine-readable dates", () => {
    const date = new Date("2024-01-15T00:00:00.000Z");

    expect(formatBehavioralDate(date, "year")).toEqual({
      visible: "2024",
      datetime: "2024",
    });
    expect(formatBehavioralDate(date, "month")).toEqual({
      visible: "January 2024",
      datetime: "2024-01",
    });
    expect(formatBehavioralDate(date, "day")).toEqual({
      visible: "January 15, 2024",
      datetime: "2024-01-15",
    });
  });
});
