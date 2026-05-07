import { createNumerator } from "../../index";

describe("createNumerator", () => {
  it("groups common money operations behind a locale-bound domain facade", () => {
    const numerator = createNumerator({ locale: "tr-TR" });

    expect(numerator.locale).toBe("tr-TR");
    expect(numerator.money.format("1234.56", "TRY")).toBe("₺1.234,56");
    expect(numerator.money.parse("₺1.234,56", "TRY").amount).toBe("1234.56");
    expect(numerator.money.safeParse("€1.234,56", "TRY").ok).toBe(false);
    expect(numerator.money.toMinorUnits("12.34", "USD")).toBe(1234n);
    expect(
      numerator.money
        .allocate(numerator.money.create("0.10", "USD"), [1, 1, 1])
        .map((share) => share.amount),
    ).toEqual(["0.04", "0.03", "0.03"]);
    expect(numerator.money.input("JPY").allowDecimal).toBe(false);
    expect(numerator.money.input("TRY").locale).toBe("tr-TR");
  });

  it("keeps decimal, percent, unit, input, and locale helpers discoverable", () => {
    const numerator = createNumerator({ locale: "en-US" });

    expect(numerator.decimal.format("1234567.89")).toBe("1,234,567.89");
    expect(numerator.decimal.add("999.99", "0.01").value).toBe("1000.00");
    expect(numerator.decimal.round("1.235", { scale: 2 }).value).toBe("1.24");
    expect(
      numerator.percent.format("0.125", { maximumFractionDigits: 1 }),
    ).toBe("12.5%");
    expect(numerator.unit.format("1500", "meter")).toBe("1,500 m");
    expect(numerator.unit.formatBestFit("1500", "meter", { scale: 1 })).toBe(
      "1,640.4 yd",
    );
    expect(
      numerator.unit.convertForLocale(numerator.unit.create("1", "bar")).unit,
    ).toBe("psi");
    expect(numerator.input.integer({ allowNegative: false }).locale).toBe(
      "en-US",
    );
    expect(numerator.locales.normalizeDigits("١٢٣")).toBe("123");
  });
});
