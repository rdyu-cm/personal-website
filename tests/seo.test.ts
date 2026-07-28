import { describe, expect, test } from "vitest";

import { resolveSocialImage, serializeJsonLd } from "../src/lib/seo";

describe("serializeJsonLd", () => {
  test("escapes script-breaking characters in JSON-LD output", () => {
    const serialized = serializeJsonLd({
      value: "<script></script>  ",
    });

    expect(serialized).not.toContain("<");
    expect(serialized).not.toContain("</script>");
    expect(serialized).not.toContain(" ");
    expect(serialized).not.toContain(" ");
    expect(serialized).toContain("\\u003c/script>");
    expect(serialized).toContain("\\u2028");
    expect(serialized).toContain("\\u2029");
  });
});

describe("resolveSocialImage", () => {
  test("preserves absolute http(s) image URLs", () => {
    expect(
      resolveSocialImage(
        "https://cdn.example.com/images/social-card.png",
        "https://research.example.com",
        "/",
      ),
    ).toBe("https://cdn.example.com/images/social-card.png");
  });

  test.each([
    [
      "/images/social-card.png",
      "https://research.example.com/images/social-card.png",
    ],
    [
      "images/social-card.png",
      "https://research.example.com/images/social-card.png",
    ],
  ])("resolves root-domain site-local path %s", (image, expected) => {
    expect(resolveSocialImage(image, "https://research.example.com", "/")).toBe(
      expected,
    );
  });

  test.each([
    [
      "/images/social-card.png",
      "https://rdyu-cm.github.io/personal-website/images/social-card.png",
    ],
    [
      "images/social-card.png",
      "https://rdyu-cm.github.io/personal-website/images/social-card.png",
    ],
  ])("resolves GitHub Pages site-local path %s", (image, expected) => {
    expect(
      resolveSocialImage(
        image,
        "https://rdyu-cm.github.io/personal-website",
        "/personal-website/",
      ),
    ).toBe(expected);
  });
});
