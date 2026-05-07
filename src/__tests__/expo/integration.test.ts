import {
  createExpoNumerator,
  getExpoLocalizationInfo,
  getNativePlatformInfo,
  NumeratorProvider,
  unit,
  useNumerator,
} from "../../index";

describe("Expo integration", () => {
  it("creates a locale-bound numerator instance", () => {
    const numerator = createExpoNumerator({
      locale: "tr-TR",
      useDeviceLocale: false,
    });

    expect(numerator.locale).toBe("tr-TR");
    expect(numerator.formatNumber("1234.56")).toBe("1.234,56");
    expect(numerator.parseNumber("1.234,56").value).toBe("1234.56");
    expect(numerator.safeParseNumber("1.234,56").ok).toBe(true);
    expect(numerator.safeParseMoney("$1.00", { currency: "USD" }).ok).toBe(
      false,
    );
    expect(
      numerator.convertUnit(unit("1", "kilometer"), "meter", { scale: 0 })
        .value,
    ).toBe("1000");
    expect(
      numerator.convertUnit(unit("0", "celsius"), "fahrenheit", { scale: 0 })
        .value,
    ).toBe("32");
    expect(numerator.getNumberInputOptions().locale).toBe("tr-TR");
  });

  it.each(["de-DE", "fr-FR", "ja-JP", "en-IN"])(
    "roundtrips formatted parse examples for locale %s",
    (locale) => {
      const numerator = createExpoNumerator({
        locale,
        useDeviceLocale: false,
      });
      const formatted = numerator.formatNumber("1234.56");
      const parsed = numerator.safeParseNumber(formatted);

      expect(parsed.ok).toBe(true);
      if (parsed.ok) {
        expect(parsed.value.value).toBe("1234.56");
      }
    },
  );

  it("falls back safely when native metadata is not available", () => {
    expect(getNativePlatformInfo()).toEqual(
      expect.objectContaining({
        moduleName: "ExpoNumeratorModule",
      }),
    );
    expect(getExpoLocalizationInfo()).toEqual(
      expect.objectContaining({
        source: expect.any(String),
      }),
    );
  });

  it("exports provider and hook entry points", () => {
    expect(typeof NumeratorProvider).toBe("function");
    expect(typeof useNumerator).toBe("function");
  });
});
