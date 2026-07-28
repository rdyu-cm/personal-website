import { describe, expect, test } from "vitest";

import { formatBehavioralDate } from "../src/lib/dates";
import { resolveFigureSource, validateFigure } from "../src/lib/figure";

describe("behavioral project dates", () => {
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

describe("figure contract", () => {
  test("rejects blank text and invalid dimensions", () => {
    expect(() =>
      validateFigure({
        src: "/images/figure.png",
        alt: " ",
        caption: "Caption",
        width: 1,
        height: 1,
      }),
    ).toThrow("alt");
    expect(() =>
      validateFigure({
        src: "/images/figure.png",
        alt: "Alt",
        caption: "\n",
        width: 1,
        height: 1,
      }),
    ).toThrow("caption");
    expect(() =>
      validateFigure({
        src: "/images/figure.png",
        alt: "Alt",
        caption: "Caption",
        width: 0,
        height: 1,
      }),
    ).toThrow("width");
    expect(() =>
      validateFigure({
        src: "/images/figure.png",
        alt: "Alt",
        caption: "Caption",
        width: 1,
        height: Infinity,
      }),
    ).toThrow("height");
  });

  test("uses the deployment base for local sources but retains absolute web URLs", () => {
    expect(
      resolveFigureSource("/images/figure.png", "/personal-website/"),
    ).toBe("/personal-website/images/figure.png");
    expect(resolveFigureSource("images/figure.png", "/personal-website/")).toBe(
      "/personal-website/images/figure.png",
    );
    expect(
      resolveFigureSource(
        "https://example.com/figure.png",
        "/personal-website/",
      ),
    ).toBe("https://example.com/figure.png");
  });
});
