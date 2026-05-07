import { NumeratorError } from "../../core/errors/NumeratorError";
import {
  formatMoney,
  formatNumber,
  formatPercent,
  money,
  parse,
  parseMoney,
  parseNumber,
  parsePercent,
  parseUnit,
  percent,
} from "../../index";

describe("parseNumber", () => {
  it("parses locale separators and grouping in strict mode", () => {
    expect(parseNumber("1,234,567.89", { locale: "en-US" }).value).toBe(
      "1234567.89",
    );
    expect(parseNumber("1.234.567,89", { locale: "tr-TR" }).value).toBe(
      "1234567.89",
    );
    expect(parseNumber("12,34,567.89", { locale: "en-IN" }).value).toBe(
      "1234567.89",
    );
  });

  it("normalizes supported non-Latin digits before parsing", () => {
    expect(parseNumber("١٢٣٤.٥٦", { locale: "en-US" }).value).toBe("1234.56");
    expect(parseNumber("१२,३४,५६७.८९", { locale: "en-IN" }).value).toBe(
      "1234567.89",
    );
    expect(parseNumber("١٬٢٣٤٬٥٦٧٫٨٩", { locale: "ar-EG" }).value).toBe(
      "1234567.89",
    );
    expect(parseNumber("۱٬۲۳۴٬۵۶۷٫۸۹", { locale: "fa-IR" }).value).toBe(
      "1234567.89",
    );
  });

  it("rejects invalid grouping in strict mode", () => {
    expect(() => parseNumber("12,34,567.89", { locale: "en-US" })).toThrowError(
      expect.objectContaining({
        code: "INVALID_GROUPING",
      }) as NumeratorError,
    );
  });

  it("allows loose copy-paste separators without changing precision through number", () => {
    expect(
      parseNumber("  999.999.999.999.999,125  ", {
        locale: "en-US",
        mode: "loose",
      }).value,
    ).toBe("999999999999999.125");
  });
});

describe("parseMoney", () => {
  it("parses localized money with symbol or code", () => {
    expect(
      parseMoney("₺1.234,56", { locale: "tr-TR", currency: "TRY" }).amount,
    ).toBe("1234.56");
    expect(
      parseMoney("USD 1,234.56", { locale: "en-US", currency: "USD" }).amount,
    ).toBe("1234.56");
  });

  it("parses accounting negatives", () => {
    expect(
      parseMoney("($1,234.56)", { locale: "en-US", currency: "USD" }).amount,
    ).toBe("-1234.56");
  });

  it("rejects mismatched currency markers", () => {
    expect(() =>
      parseMoney("€1,234.56", { locale: "en-US", currency: "USD" }),
    ).toThrowError(
      expect.objectContaining({
        code: "INVALID_CURRENCY",
      }) as NumeratorError,
    );
  });

  it("uses longest currency symbol markers before mismatch detection", () => {
    expect(
      parseMoney("A$1,234.56", { locale: "en-US", currency: "AUD" }).amount,
    ).toBe("1234.56");

    expect(() =>
      parseMoney("¥1,234", { locale: "en-US", currency: "CNY" }),
    ).toThrowError(
      expect.objectContaining({
        code: "INVALID_CURRENCY",
      }) as NumeratorError,
    );
  });
});

describe("parsePercent", () => {
  it("parses locale percent placement into ratio values", () => {
    expect(parsePercent("%12,5", { locale: "tr-TR" }).value).toBe("0.125");
    expect(parsePercent("12.5%", { locale: "en-US" }).value).toBe("0.125");
    expect(parsePercent(`12,5\u00a0%`, { locale: "de-DE" }).value).toBe(
      "0.125",
    );
    expect(parsePercent("١٢٫٥٪؜", { locale: "ar-EG" }).value).toBe("0.125");
  });
});

describe("parseUnit", () => {
  it("parses canonical units, aliases, and area symbols", () => {
    expect(parseUnit("12.5 km").unit).toBe("kilometer");
    expect(parseUnit("1,5 m²", { locale: "tr-TR" }).value).toBe("1.5");
    expect(parseUnit("1500", { unit: "square-meter" }).dimension).toBe("area");
  });
});

describe("unified parse", () => {
  it("routes parse requests by kind", () => {
    expect(parse("1,234.5", { locale: "en-US" }).value).toBe("1234.5");
    expect(
      parse("$1,234.50", {
        kind: "money",
        locale: "en-US",
        currency: "USD",
      }).kind,
    ).toBe("money");
    expect(parse("50%", { kind: "percent", locale: "en-US" }).kind).toBe(
      "percent",
    );
    expect(parse("12.5 km", { kind: "unit", locale: "en-US" }).kind).toBe(
      "unit",
    );
  });
});

describe("format/parse roundtrip", () => {
  it("roundtrips formatted number, money, and percent strings", () => {
    const formattedNumber = formatNumber("1234567.89", { locale: "tr-TR" });
    const formattedMoney = formatMoney(money("1234.56", "TRY"), {
      locale: "tr-TR",
    });
    const formattedPercent = formatPercent(percent("0.125"), {
      locale: "tr-TR",
      maximumFractionDigits: 1,
    });

    expect(parseNumber(formattedNumber, { locale: "tr-TR" }).value).toBe(
      "1234567.89",
    );
    expect(
      parseMoney(formattedMoney, { locale: "tr-TR", currency: "TRY" }).amount,
    ).toBe("1234.56");
    expect(parsePercent(formattedPercent, { locale: "tr-TR" }).value).toBe(
      "0.125",
    );
  });

  it.each([
    "de-DE",
    "fr-FR",
    "es-ES",
    "it-IT",
    "pt-BR",
    "nl-NL",
    "ru-RU",
    "ar-EG",
    "fa-IR",
    "hi-IN",
    "ja-JP",
    "ko-KR",
    "zh-CN",
    "id-ID",
  ])("roundtrips CLDR-lite number and percent locale %s", (locale) => {
    const formattedNumber = formatNumber("1234567.89", { locale });
    const formattedPercent = formatPercent(percent("0.125"), {
      locale,
      maximumFractionDigits: 1,
    });

    expect(parseNumber(formattedNumber, { locale }).value).toBe("1234567.89");
    expect(parsePercent(formattedPercent, { locale }).value).toBe("0.125");
  });
});
