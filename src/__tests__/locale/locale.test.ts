import {
  NumeratorError,
  getLocaleSymbols,
  getRegisteredLocaleCodes,
  normalizeDigits,
  registerLocaleSymbols,
  resolveLocale,
  validateGrouping,
} from "../../index";

describe("locale registry and resolution", () => {
  it("resolves exact and language-only locale matches", () => {
    expect(resolveLocale({ locale: "tr-TR" })).toBe("tr-TR");
    expect(resolveLocale({ locale: "tr" })).toBe("tr-TR");
  });

  it("falls back to the configured fallback locale", () => {
    expect(resolveLocale({ locale: "sv-SE", fallbackLocale: "en-US" })).toBe(
      "en-US",
    );
  });

  it("throws typed errors for invalid locale tags", () => {
    expect(() => resolveLocale({ locale: "" })).toThrow(NumeratorError);

    try {
      resolveLocale({ locale: "not a locale" });
    } catch (error) {
      expect(error).toBeInstanceOf(NumeratorError);
      expect((error as NumeratorError).code).toBe("INVALID_LOCALE");
    }
  });

  it("returns registered locale symbols", () => {
    expect(getLocaleSymbols("tr-TR")).toMatchObject({
      decimal: ",",
      group: ".",
      percentPattern: {
        prefix: "%",
        suffix: "",
      },
      grouping: {
        primary: 3,
        separator: ".",
      },
    });
  });

  it("ships the initial CLDR-lite locale coverage set", () => {
    expect(getRegisteredLocaleCodes()).toEqual(
      expect.arrayContaining([
        "en-US",
        "tr-TR",
        "en-IN",
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
      ]),
    );
  });

  it("allows explicit locale registration", () => {
    registerLocaleSymbols({
      locale: "de-DE",
      decimal: ",",
      group: ".",
      plusSign: "+",
      minusSign: "-",
      percentSign: "%",
      grouping: { primary: 3, separator: "." },
    });

    expect(getRegisteredLocaleCodes()).toContain("de-DE");
    expect(resolveLocale({ locale: "de" })).toBe("de-DE");
  });
});

describe("digit normalization", () => {
  it.each([
    ["١٢٣٤٥٦", "123456"],
    ["۱۲۳۴۵۶", "123456"],
    ["१२३४५६", "123456"],
    ["A١B۲C३", "A1B2C3"],
  ])("normalizes supported digit fixture %s", (input, expected) => {
    expect(normalizeDigits(input)).toBe(expected);
  });

  it("can normalize only a requested numbering system", () => {
    expect(normalizeDigits("١٢۳", { numberingSystem: "arab" })).toBe("12۳");
  });

  it("throws typed errors for unsupported numbering systems", () => {
    expect(() => normalizeDigits("123", { numberingSystem: "thai" })).toThrow(
      NumeratorError,
    );
  });
});

describe("grouping validation", () => {
  it.each([
    ["en-US", "1,234,567", true],
    ["en-US", "1234", true],
    ["en-US", "12,34,567", false],
    ["en-US", "1,,234", false],
    ["tr-TR", "1.234.567", true],
    ["tr-TR", "-1.234,56", true],
    ["tr-TR", "12.34.567", false],
    ["de-DE", "1.234.567", true],
    ["fr-FR", `1\u202f234\u202f567`, true],
    ["ru-RU", `1\u00a0234\u00a0567`, true],
    ["ar-EG", "1٬234٬567", true],
    ["fa-IR", "1٬234٬567", true],
    ["en-IN", "1,23,45,678", true],
    ["en-IN", "12,34,567", true],
    ["en-IN", "123,45,678", false],
    ["hi-IN", "12,34,567", true],
  ])("validates grouping for %s fixture %s", (locale, input, expected) => {
    expect(validateGrouping(input, { locale })).toBe(expected);
  });
});
