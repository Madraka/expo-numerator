import {
  NumeratorError,
  addDecimal,
  compareDecimal,
  decimal,
  divideDecimal,
  hasScale,
  isDecimal,
  multiplyDecimal,
  normalizeDecimal,
  safeDecimal,
  safeMoney,
  safePercent,
  safeUnit,
  subtractDecimal,
} from "../../index";

describe("decimal value model", () => {
  it("normalizes leading zeros while preserving explicit fractional precision", () => {
    expect(decimal("000123.4500")).toEqual({
      kind: "decimal",
      value: "123.4500",
      scale: 4,
      sign: 1,
    });
  });

  it("normalizes negative zero to canonical zero", () => {
    expect(decimal("-0.000")).toEqual({
      kind: "decimal",
      value: "0",
      sign: 0,
    });
  });

  it.each([
    ["+00123", "123", 1],
    ["-00123", "-123", -1],
    ["+000.500", "0.500", 1],
    ["-000.500", "-0.500", -1],
    ["000000", "0", 0],
  ])("normalizes signed fixture %s", (input, value, sign) => {
    expect(decimal(input)).toMatchObject({ value, sign });
  });

  it("preserves large decimal strings without number conversion", () => {
    expect(decimal("999999999999999999999999.123456789").value).toBe(
      "999999999999999999999999.123456789",
    );
  });

  it("accepts only safe integers through the number convenience path", () => {
    expect(decimal(123).value).toBe("123");
    expect(() => decimal(123.45)).toThrow(NumeratorError);
  });

  it.each([
    "",
    " ",
    ".1",
    "1.",
    "1,234.56",
    "1_000",
    "1e3",
    "NaN",
    "Infinity",
    "１２３",
    "1\u200B2",
    "1\u00A02",
    "💸",
  ])("throws typed INVALID_DECIMAL for malformed fixture %p", (input) => {
    expect(() => decimal(input)).toThrow(NumeratorError);

    const result = safeDecimal(input);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INVALID_DECIMAL");
    }
  });

  it("throws typed errors for length limits", () => {
    try {
      normalizeDecimal("1".repeat(129));
    } catch (error) {
      expect(error).toBeInstanceOf(NumeratorError);
      expect((error as NumeratorError).code).toBe("VALUE_OUT_OF_RANGE");
    }
  });

  it("compares decimals with different scales deterministically", () => {
    expect(compareDecimal("1.10", "1.1")).toBe(0);
    expect(compareDecimal("-2", "-1")).toBe(-1);
    expect(
      compareDecimal("999999999999999999999.1", "999999999999999999999.01"),
    ).toBe(1);
  });

  it("adds and subtracts decimals without floating point conversion", () => {
    expect(addDecimal("999999999999999999999.99", "0.01").value).toBe(
      "1000000000000000000000.00",
    );
    expect(addDecimal("1.20", "2.3").value).toBe("3.50");
    expect(subtractDecimal("1.20", "2.30").value).toBe("-1.10");
    expect(subtractDecimal("2.30", "1.20").value).toBe("1.10");
  });

  it("multiplies decimals with deterministic scale", () => {
    expect(multiplyDecimal("12.30", "3.0").value).toBe("36.900");
    expect(multiplyDecimal("-0.5", "0.20").value).toBe("-0.100");
  });

  it("divides decimals with explicit scale and rounding", () => {
    expect(divideDecimal("1", "3", { scale: 4 }).value).toBe("0.3333");
    expect(
      divideDecimal("2", "3", { roundingMode: "halfExpand", scale: 2 }).value,
    ).toBe("0.67");
    expect(
      divideDecimal("-2", "3", { roundingMode: "ceil", scale: 0 }).value,
    ).toBe("0");
    expect(
      divideDecimal("-2", "3", { roundingMode: "floor", scale: 0 }).value,
    ).toBe("-1");
  });

  it("throws typed arithmetic errors for invalid division", () => {
    expect(() => divideDecimal("1", "0", { scale: 2 })).toThrow(NumeratorError);

    try {
      divideDecimal("1", "0", { scale: 2 });
    } catch (error) {
      expect((error as NumeratorError).code).toBe("ARITHMETIC_FAILED");
    }
  });

  it("exposes guard helpers for core values", () => {
    const value = decimal("12.30");

    expect(isDecimal(value)).toBe(true);
    expect(hasScale(value, 2)).toBe(true);
  });

  it("returns non-throwing results for safe constructors", () => {
    expect(safeDecimal("12.30")).toEqual({
      ok: true,
      value: {
        kind: "decimal",
        value: "12.30",
        scale: 2,
        sign: 1,
      },
    });

    expect(safeMoney("12.30", "TRY")).toMatchObject({
      ok: true,
      value: {
        kind: "money",
        amount: "12.30",
        currency: "TRY",
      },
    });

    expect(safePercent("0.125")).toEqual({
      ok: true,
      value: {
        kind: "percent",
        value: "0.125",
      },
    });

    expect(safeUnit("12.5", "kilometer")).toEqual({
      ok: true,
      value: {
        dimension: "length",
        kind: "unit",
        unit: "kilometer",
        value: "12.5",
      },
    });
  });

  it("returns typed failures from safe constructors", () => {
    const invalidMoney = safeMoney("1", "FOO");
    const invalidUnit = safeUnit("1", "");

    expect(invalidMoney.ok).toBe(false);
    expect(invalidUnit.ok).toBe(false);

    if (!invalidMoney.ok) {
      expect(invalidMoney.error.code).toBe("INVALID_CURRENCY");
    }

    if (!invalidUnit.ok) {
      expect(invalidUnit.error.code).toBe("VALUE_OUT_OF_RANGE");
    }
  });
});
