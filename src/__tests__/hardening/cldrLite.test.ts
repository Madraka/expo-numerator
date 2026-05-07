import { generatedLocaleSymbols } from "../../locale/generatedLocaleSymbols";
import { initialLocaleSymbols } from "../../locale/localeRegistry";

describe("CLDR-lite generated data", () => {
  it("is the locale registry seed", () => {
    expect(initialLocaleSymbols).toBe(generatedLocaleSymbols);
  });

  it("keeps the initial locale footprint explicitly curated", () => {
    expect(Object.keys(generatedLocaleSymbols).sort()).toEqual([
      "ar-EG",
      "de-DE",
      "en-IN",
      "en-US",
      "es-ES",
      "fa-IR",
      "fr-FR",
      "hi-IN",
      "id-ID",
      "it-IT",
      "ja-JP",
      "ko-KR",
      "nl-NL",
      "pt-BR",
      "ru-RU",
      "tr-TR",
      "zh-CN",
    ]);
  });

  it("ships compact notation patterns for representative locale families", () => {
    expect(generatedLocaleSymbols["en-US"].compactPatterns?.short.length).toBe(
      4,
    );
    expect(generatedLocaleSymbols["tr-TR"].compactPatterns?.short[1]).toEqual(
      expect.objectContaining({
        divisorPower: 6,
        other: { suffix: "\u00a0Mn" },
        thresholdPower: 6,
      }),
    );
    expect(generatedLocaleSymbols["en-IN"].compactPatterns?.short[1]).toEqual(
      expect.objectContaining({
        divisorPower: 5,
        other: { suffix: "L" },
        thresholdPower: 5,
      }),
    );
    expect(generatedLocaleSymbols["ja-JP"].compactPatterns?.short[0]).toEqual(
      expect.objectContaining({
        divisorPower: 4,
        other: { suffix: "万" },
        thresholdPower: 4,
      }),
    );
  });
});
