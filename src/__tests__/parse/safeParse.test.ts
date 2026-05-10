import {
  safeParse,
  safeParseMoney,
  safeParseNumber,
  safeParsePercent,
} from "../../index";

describe("safe parse APIs", () => {
  it("returns a success result for valid localized numbers", () => {
    const result = safeParseNumber("1.234,56", { locale: "tr-TR" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("1234.56");
    }
  });

  it("returns a typed failure for invalid strict grouping", () => {
    const result = safeParseNumber("12,34,567.89", { locale: "en-US" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INVALID_GROUPING");
    }
  });

  it("returns a typed failure for mismatched money markers", () => {
    const result = safeParseMoney("€1,234.56", {
      currency: "USD",
      locale: "en-US",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INVALID_CURRENCY");
    }
  });

  it("returns a typed failure when a number parser receives percent text", () => {
    const result = safeParseNumber("12%", { locale: "en-US" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INVALID_PERCENT");
    }
  });

  it("parses percent text without throwing", () => {
    const result = safeParsePercent("%12,5", { locale: "tr-TR" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("0.125");
    }
  });

  it("returns a typed failure for misplaced percent markers", () => {
    const result = safeParsePercent("12%5", { locale: "en-US" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INVALID_PERCENT");
    }
  });

  it("routes unified safe parse requests by kind", () => {
    const numberResult = safeParse("1,234.5", { locale: "en-US" });
    const moneyResult = safeParse("$1,234.50", {
      currency: "USD",
      kind: "money",
      locale: "en-US",
    });
    const percentResult = safeParse("50%", {
      kind: "percent",
      locale: "en-US",
    });

    expect(numberResult.ok).toBe(true);
    expect(moneyResult.ok).toBe(true);
    expect(percentResult.ok).toBe(true);

    if (numberResult.ok) {
      expect(numberResult.value.value).toBe("1234.5");
    }
    if (moneyResult.ok) {
      expect(moneyResult.value.kind).toBe("money");
    }
    if (percentResult.ok) {
      expect(percentResult.value.value).toBe("0.50");
    }
  });
});
