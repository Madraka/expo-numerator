import {
  NumeratorError,
  allocateMinorUnits,
  allocateMoney,
  getCurrencyMeta,
  getRegisteredCurrencyCodes,
  fromMinorUnits,
  isCurrencyCode,
  money,
  registerCurrency,
  toMinorUnits,
} from "../../index";

describe("money value model and currency registry", () => {
  it("creates money values with ISO currency metadata", () => {
    expect(money("1234.56", "try")).toEqual({
      kind: "money",
      amount: "1234.56",
      currency: "TRY",
      scale: 2,
      minor: 123456n,
    });
  });

  it("uses zero minor unit currencies without silent rounding", () => {
    expect(money("1234", "JPY")).toEqual({
      kind: "money",
      amount: "1234",
      currency: "JPY",
      scale: 0,
      minor: 1234n,
    });

    expect(money("1234.56", "JPY").minor).toBeUndefined();
  });

  it("supports three-decimal currencies", () => {
    expect(money("12.345", "KWD").minor).toBe(12345n);
  });

  it("converts money amounts to and from minor units with explicit policy", () => {
    expect(toMinorUnits("12.34", "USD")).toBe(1234n);
    expect(toMinorUnits("-12.34", "USD")).toBe(-1234n);
    expect(fromMinorUnits(1234n, "USD")).toEqual({
      kind: "money",
      amount: "12.34",
      currency: "USD",
      scale: 2,
      minor: 1234n,
    });
    expect(fromMinorUnits("1234", "JPY").amount).toBe("1234");
  });

  it("rejects or rounds sub-minor money values by policy", () => {
    expect(() => toMinorUnits("1.234", "USD")).toThrow(NumeratorError);
    expect(
      toMinorUnits("1.235", "USD", {
        roundingMode: "halfExpand",
        scalePolicy: "round",
      }),
    ).toBe(124n);
    expect(
      toMinorUnits("1.225", "USD", {
        roundingMode: "halfEven",
        scalePolicy: "round",
      }),
    ).toBe(122n);
  });

  it("allocates integer minor units by stable largest remainder", () => {
    expect(allocateMinorUnits(10n, [1, 1, 1])).toEqual([4n, 3n, 3n]);
    expect(allocateMinorUnits(-10n, [1, 1, 1])).toEqual([-4n, -3n, -3n]);
    expect(allocateMinorUnits("100", ["1", "2", "3"])).toEqual([17n, 33n, 50n]);
    expect(allocateMinorUnits(10n, [1, 0, 1])).toEqual([5n, 0n, 5n]);
  });

  it("allocates money values without losing minor-unit totals", () => {
    const shares = allocateMoney(money("0.10", "USD"), [1, 1, 1]);

    expect(shares.map((share) => share.amount)).toEqual([
      "0.04",
      "0.03",
      "0.03",
    ]);
    expect(
      shares.reduce(
        (sum, share) => sum + toMinorUnits(share.amount, "USD"),
        0n,
      ),
    ).toBe(10n);
  });

  it("throws typed errors for invalid allocation ratios", () => {
    expect(() => allocateMinorUnits(10n, [])).toThrow(NumeratorError);
    expect(() => allocateMinorUnits(10n, [0, 0])).toThrow(NumeratorError);
    expect(() => allocateMinorUnits(10n, [1, -1])).toThrow(NumeratorError);
  });

  it("ships a broad ISO currency seed with zero, three, and four minor units", () => {
    expect(getRegisteredCurrencyCodes().length).toBeGreaterThanOrEqual(150);
    expect(getCurrencyMeta("CLP")).toMatchObject({
      code: "CLP",
      minorUnit: 0,
      numeric: "152",
    });
    expect(getCurrencyMeta("OMR")).toMatchObject({
      code: "OMR",
      minorUnit: 3,
      numeric: "512",
    });
    expect(getCurrencyMeta("UYW")).toMatchObject({
      code: "UYW",
      minorUnit: 4,
      numeric: "927",
    });
    expect(money("1.2345", "UYW").minor).toBe(12345n);
  });

  it("throws typed errors for unknown currencies", () => {
    expect(() => money("123.45", "FOO")).toThrow(NumeratorError);

    try {
      getCurrencyMeta("FOO");
    } catch (error) {
      expect(error).toBeInstanceOf(NumeratorError);
      expect((error as NumeratorError).code).toBe("INVALID_CURRENCY");
    }
  });

  it("allows explicit custom currency registration", () => {
    registerCurrency({ code: "XBT", minorUnit: 8, name: "Bitcoin" });

    expect(isCurrencyCode("XBT")).toBe(true);
    expect(money("0.00000001", "XBT").minor).toBe(1n);
  });
});
