import {
  decimal,
  format,
  formatMoney,
  formatNumber,
  formatNumberToParts,
  formatPercent,
  money,
  NumeratorError,
  percent,
  unit,
} from "../../index";

describe("formatNumber", () => {
  it("formats decimal values with locale grouping and separators", () => {
    expect(formatNumber(decimal("1234567.89"), { locale: "en-US" })).toBe(
      "1,234,567.89",
    );
    expect(formatNumber(decimal("1234567.89"), { locale: "tr-TR" })).toBe(
      "1.234.567,89",
    );
  });

  it("formats Indian grouping deterministically", () => {
    expect(formatNumber(decimal("12345678.9"), { locale: "en-IN" })).toBe(
      "1,23,45,678.9",
    );
  });

  it.each([
    ["de-DE", "1.234.567,89"],
    ["fr-FR", `1\u202f234\u202f567,89`],
    ["ru-RU", `1\u00a0234\u00a0567,89`],
    ["ar-EG", "1٬234٬567٫89"],
    ["fa-IR", "1٬234٬567٫89"],
    ["hi-IN", "12,34,567.89"],
    ["ja-JP", "1,234,567.89"],
    ["zh-CN", "1,234,567.89"],
  ])("formats CLDR-lite locale %s deterministically", (locale, expected) => {
    expect(formatNumber(decimal("1234567.89"), { locale })).toBe(expected);
  });

  it("rounds and pads fraction digits without using JavaScript number conversion", () => {
    expect(
      formatNumber(decimal("999999999999999999999.125"), {
        locale: "en-US",
        maximumFractionDigits: 2,
        roundingMode: "halfEven",
      }),
    ).toBe("999,999,999,999,999,999,999.12");

    expect(
      formatNumber(decimal("12.3"), {
        locale: "en-US",
        minimumFractionDigits: 4,
      }),
    ).toBe("12.3000");
  });

  it("supports grouping and sign display options", () => {
    expect(
      formatNumber(decimal("1234"), {
        locale: "en-US",
        useGrouping: false,
      }),
    ).toBe("1234");
    expect(
      formatNumber(decimal("1234"), {
        locale: "en-US",
        signDisplay: "always",
      }),
    ).toBe("+1,234");
  });

  it("formats scientific and engineering notation with the string engine", () => {
    expect(
      formatNumber(decimal("12345.678"), {
        locale: "en-US",
        notation: "scientific",
        maximumFractionDigits: 2,
      }),
    ).toBe("1.23E4");

    expect(
      formatNumber(decimal("12345.678"), {
        locale: "en-US",
        notation: "engineering",
        maximumFractionDigits: 3,
      }),
    ).toBe("12.346E3");

    expect(
      formatNumber(decimal("0.000123"), {
        locale: "en-US",
        notation: "engineering",
      }),
    ).toBe("123E-6");
  });

  it("formats compact notation from generated CLDR-lite patterns", () => {
    expect(
      formatNumber(decimal("1234"), {
        locale: "en-US",
        notation: "compact",
      }),
    ).toBe("1.2K");

    expect(
      formatNumber(decimal("12345"), {
        locale: "en-US",
        notation: "compact",
      }),
    ).toBe("12K");

    expect(
      formatNumber(decimal("1200000"), {
        locale: "tr-TR",
        notation: "compact",
      }),
    ).toBe("1,2\u00a0Mn");
  });

  it("supports compact display long and non-3-digit compact scales", () => {
    expect(
      formatNumber(decimal("1200000"), {
        compactDisplay: "long",
        locale: "en-US",
        notation: "compact",
      }),
    ).toBe("1.2 million");

    expect(
      formatNumber(decimal("12500000"), {
        locale: "en-IN",
        maximumFractionDigits: 2,
        notation: "compact",
      }),
    ).toBe("1.25Cr");
  });

  it("rolls compact output over after rounding", () => {
    expect(
      formatNumber(decimal("999950"), {
        locale: "en-US",
        notation: "compact",
      }),
    ).toBe("1M");
  });

  it("formats decimal output to parts", () => {
    expect(
      formatNumberToParts(decimal("-1234.56"), { locale: "en-US" }),
    ).toEqual([
      { type: "minusSign", value: "-" },
      { type: "integer", value: "1" },
      { type: "group", value: "," },
      { type: "integer", value: "234" },
      { type: "decimal", value: "." },
      { type: "fraction", value: "56" },
    ]);
  });

  it("formats scientific output to parts", () => {
    expect(
      formatNumberToParts(decimal("12345"), {
        locale: "en-US",
        notation: "scientific",
      }),
    ).toEqual([
      { type: "integer", value: "1" },
      { type: "decimal", value: "." },
      { type: "fraction", value: "2345" },
      { type: "exponentSeparator", value: "E" },
      { type: "exponentInteger", value: "4" },
    ]);
  });

  it("formats compact output to parts", () => {
    expect(
      formatNumberToParts(decimal("1234"), {
        locale: "en-US",
        notation: "compact",
      }),
    ).toEqual([
      { type: "integer", value: "1" },
      { type: "decimal", value: "." },
      { type: "fraction", value: "2" },
      { type: "compact", value: "K" },
    ]);
  });
});

describe("formatMoney", () => {
  it("formats money with currency minor units", () => {
    expect(formatMoney(money("1234567.89", "TRY"), { locale: "tr-TR" })).toBe(
      "₺1.234.567,89",
    );
    expect(formatMoney(money("1234.56", "USD"), { locale: "en-US" })).toBe(
      "$1,234.56",
    );
    expect(formatMoney(money("1234.56", "JPY"), { locale: "ja-JP" })).toBe(
      "¥1,235",
    );
  });

  it.each([
    ["tr-TR", "TRY"],
    ["de-DE", "EUR"],
    ["fr-FR", "EUR"],
    ["en-IN", "INR"],
    ["en-US", "USD"],
  ])("matches Intl currency symbol placement for %s %s", (locale, currency) => {
    expect(formatMoney(money("1234.56", currency), { locale })).toBe(
      new Intl.NumberFormat(locale, {
        currency,
        style: "currency",
      }).format(1234.56),
    );
  });

  it("supports currency code display and accounting negatives", () => {
    expect(
      formatMoney(money("1234.56", "USD"), {
        locale: "en-US",
        currencyDisplay: "code",
      }),
    ).toBe("USD 1,234.56");

    expect(
      formatMoney(money("-1234.56", "USD"), {
        locale: "en-US",
        currencySign: "accounting",
      }),
    ).toBe("($1,234.56)");
  });
});

describe("formatPercent", () => {
  it("formats percent values as value multiplied by 100", () => {
    expect(
      formatPercent(percent("0.125"), {
        locale: "tr-TR",
        maximumFractionDigits: 1,
      }),
    ).toBe("%12,5");

    expect(
      formatPercent(percent("0.125"), {
        locale: "en-US",
        maximumFractionDigits: 1,
      }),
    ).toBe("12.5%");
  });

  it("uses CLDR-lite percent affixes instead of locale-specific branches", () => {
    expect(
      formatPercent(percent("0.125"), {
        locale: "de-DE",
        maximumFractionDigits: 1,
      }),
    ).toBe(`12,5\u00a0%`);

    expect(
      formatPercent(percent("0.125"), {
        locale: "ar-EG",
        maximumFractionDigits: 1,
      }),
    ).toBe("12٫5٪؜");
  });
});

describe("unified format", () => {
  it("routes numeric values by kind", () => {
    expect(format(decimal("1234.5"), { locale: "en-US" })).toBe("1,234.5");
    expect(format(money("1234.5", "USD"), { locale: "en-US" })).toBe(
      "$1,234.50",
    );
    expect(format(percent("0.5"), { locale: "en-US" })).toBe("50%");
    expect(format(unit("12.5", "kilometer"), { locale: "en-US" })).toBe(
      "12.5 km",
    );
    expect(
      format(unit("12.5", "kilometer"), {
        locale: "en-US",
        unitDisplay: "long",
      }),
    ).toBe("12.5 kilometers");
    expect(
      format(decimal("12345"), {
        locale: "en-US",
        notation: "engineering",
      }),
    ).toBe("12.345E3");
    expect(
      format(decimal("1234"), {
        locale: "en-US",
        notation: "compact",
      }),
    ).toBe("1.2K");
    expect(() =>
      format(money("1234.5", "USD"), {
        locale: "en-US",
        notation: "scientific",
      }),
    ).toThrowError(
      expect.objectContaining({
        code: "UNSUPPORTED_NOTATION",
      }) as NumeratorError,
    );
  });
});
