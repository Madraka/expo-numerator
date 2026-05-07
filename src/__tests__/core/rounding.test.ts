import { roundDecimal, scaleDecimal } from "../../index";
import type { RoundingMode } from "../../index";

describe("internal string rounding engine", () => {
  it("rounds with halfExpand by default", () => {
    expect(roundDecimal("1234.567", { scale: 2 }).value).toBe("1234.57");
  });

  it("supports halfEven ties", () => {
    expect(
      roundDecimal("1.245", { scale: 2, roundingMode: "halfEven" }).value,
    ).toBe("1.24");
    expect(
      roundDecimal("1.255", { scale: 2, roundingMode: "halfEven" }).value,
    ).toBe("1.26");
  });

  it("supports directional modes for signed values", () => {
    expect(
      roundDecimal("-1.21", { scale: 1, roundingMode: "ceil" }).value,
    ).toBe("-1.2");
    expect(
      roundDecimal("-1.21", { scale: 1, roundingMode: "floor" }).value,
    ).toBe("-1.3");
  });

  it("pads when scaling up without changing value magnitude", () => {
    expect(scaleDecimal("12.3", 4).value).toBe("12.3000");
  });

  it.each([
    ["ceil", "1.25", "1.3"],
    ["floor", "1.25", "1.2"],
    ["expand", "1.25", "1.3"],
    ["trunc", "1.25", "1.2"],
    ["halfCeil", "1.25", "1.3"],
    ["halfFloor", "1.25", "1.2"],
    ["halfExpand", "1.25", "1.3"],
    ["halfTrunc", "1.25", "1.2"],
    ["halfEven", "1.25", "1.2"],
    ["ceil", "-1.25", "-1.2"],
    ["floor", "-1.25", "-1.3"],
    ["expand", "-1.25", "-1.3"],
    ["trunc", "-1.25", "-1.2"],
    ["halfCeil", "-1.25", "-1.2"],
    ["halfFloor", "-1.25", "-1.3"],
    ["halfExpand", "-1.25", "-1.3"],
    ["halfTrunc", "-1.25", "-1.2"],
    ["halfEven", "-1.25", "-1.2"],
  ] satisfies [RoundingMode, string, string][])(
    "rounds %s tie fixture %s to %s",
    (roundingMode, input, expected) => {
      expect(roundDecimal(input, { scale: 1, roundingMode }).value).toBe(
        expected,
      );
    },
  );

  it.each([
    ["halfCeil", "1.26", "1.3"],
    ["halfFloor", "1.26", "1.3"],
    ["halfExpand", "1.26", "1.3"],
    ["halfTrunc", "1.26", "1.3"],
    ["halfEven", "1.26", "1.3"],
    ["halfCeil", "-1.26", "-1.3"],
    ["halfFloor", "-1.26", "-1.3"],
    ["halfExpand", "-1.26", "-1.3"],
    ["halfTrunc", "-1.26", "-1.3"],
    ["halfEven", "-1.26", "-1.3"],
  ] satisfies [RoundingMode, string, string][])(
    "rounds %s above-half fixture %s to nearest %s",
    (roundingMode, input, expected) => {
      expect(roundDecimal(input, { scale: 1, roundingMode }).value).toBe(
        expected,
      );
    },
  );

  it.each([
    ["halfCeil", "1.24", "1.2"],
    ["halfFloor", "1.24", "1.2"],
    ["halfExpand", "1.24", "1.2"],
    ["halfTrunc", "1.24", "1.2"],
    ["halfEven", "1.24", "1.2"],
    ["halfCeil", "-1.24", "-1.2"],
    ["halfFloor", "-1.24", "-1.2"],
    ["halfExpand", "-1.24", "-1.2"],
    ["halfTrunc", "-1.24", "-1.2"],
    ["halfEven", "-1.24", "-1.2"],
  ] satisfies [RoundingMode, string, string][])(
    "rounds %s below-half fixture %s to nearest %s",
    (roundingMode, input, expected) => {
      expect(roundDecimal(input, { scale: 1, roundingMode }).value).toBe(
        expected,
      );
    },
  );

  it("rejects unsupported rounding increments explicitly", () => {
    expect(() =>
      roundDecimal("1.25", {
        scale: 1,
        roundingIncrement: 5,
      }),
    ).toThrow("ROUNDING_FAILED");
  });
});
