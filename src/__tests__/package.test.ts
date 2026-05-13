import packageJson from "../../package.json";
import * as numerator from "../index";

describe("public package surface", () => {
  it("exports the v0.1 Foundation+Core API without generated module examples", () => {
    expect(numerator.decimal("1").value).toBe("1");
    expect(numerator.addDecimal("1.20", "2.3").value).toBe("3.50");
    expect(numerator.subtractDecimal("1.20", "2.30").value).toBe("-1.10");
    expect(numerator.multiplyDecimal("12.30", "3.0").value).toBe("36.900");
    expect(numerator.divideDecimal("2", "3", { scale: 2 }).value).toBe("0.67");
    expect(numerator.money("1", "USD").currency).toBe("USD");
    expect(numerator.toMinorUnits("1.23", "USD")).toBe(123n);
    expect(numerator.fromMinorUnits(123n, "USD").amount).toBe("1.23");
    expect(numerator.allocateMinorUnits(10n, [1, 1, 1])).toEqual([4n, 3n, 3n]);
    expect(
      numerator
        .allocateMoney(numerator.money("0.10", "USD"), [1, 1, 1])
        .map((share) => share.amount),
    ).toEqual(["0.04", "0.03", "0.03"]);
    expect(numerator.formatMoney(numerator.money("1", "USD"))).toBe("$1.00");
    expect(numerator.formatUnit(numerator.unit("1", "kilometer"))).toBe("1 km");
    expect(numerator.formatNumberToParts(numerator.decimal("1.2"))).toEqual([
      { type: "integer", value: "1" },
      { type: "decimal", value: "." },
      { type: "fraction", value: "2" },
    ]);
    expect(numerator.parseMoney("$1.00", { currency: "USD" }).amount).toBe(
      "1.00",
    );
    expect(numerator.safeParseNumber("1.00").ok).toBe(true);
    expect(numerator.safeParseMoney("$1.00", { currency: "USD" }).ok).toBe(
      true,
    );
    expect(numerator.parseUnit("1 km").unit).toBe("kilometer");
    expect(numerator.safeParseUnit("1 km").ok).toBe(true);
    expect(
      numerator.convertUnit(numerator.unit("1", "kilometer"), "meter", {
        scale: 0,
      }).value,
    ).toBe("1000");
    expect(
      numerator.convertUnit(numerator.unit("0", "celsius"), "fahrenheit", {
        scale: 0,
      }).value,
    ).toBe("32");
    expect(numerator.createUnitInputOptions("m²").unit).toBe("square-meter");
    expect(numerator.parsePhone("+905012345678").e164).toBe("+905012345678");
    expect(numerator.formatPhone("+905012345678", { format: "rfc3966" })).toBe(
      "tel:+905012345678",
    );
    expect(
      numerator.safeParsePhone("05012345678", { defaultRegion: "TR" }).ok,
    ).toBe(true);
    expect(
      numerator.createPhoneInputState({ defaultRegion: "TR" }).isValid,
    ).toBe(true);
    expect(typeof numerator.createPhoneVerificationCheckRequest).toBe(
      "function",
    );
    expect(typeof numerator.createPhoneVerificationResendRequest).toBe(
      "function",
    );
    expect(numerator.createMoneyInputOptions("JPY").allowDecimal).toBe(false);
    expect(numerator.createPercentInputOptions().mode).toBe("percent");
    expect(numerator.createIntegerInputOptions().allowDecimal).toBe(false);
    expect(typeof numerator.MoneyInput).toBe("object");
    expect(typeof numerator.PercentInput).toBe("object");
    expect(typeof numerator.IntegerInput).toBe("object");
    expect(typeof numerator.UnitInput).toBe("object");
    expect(typeof numerator.PhoneInput).toBe("object");
    expect(typeof numerator.PhoneOtpInput).toBe("object");
    expect(numerator.getRegisteredUnitCodes()).toContain("square-meter");
    expect(numerator.createNumberInputState({ initialValue: "1" }).text).toBe(
      "1",
    );
    expect(
      numerator.applyNumberInputNativeTextChange(
        numerator.createNumberInputState(),
        "1",
      ).text,
    ).toBe("1");
    expect(
      numerator.commitNumberInputState(
        numerator.applyNumberInputText(numerator.createNumberInputState(), "2"),
      ).isDirty,
    ).toBe(false);
    expect(
      numerator.resetNumberInputState(
        numerator.applyNumberInputText(
          numerator.createNumberInputState({ defaultValue: "1" }),
          "2",
        ),
      ).text,
    ).toBe("1");
    expect(
      numerator.setNumberInputSelection(
        numerator.createNumberInputState({ initialValue: "1" }),
        { start: 0, end: 1 },
      ).selection,
    ).toEqual({ start: 0, end: 1 });
    expect(typeof numerator.NumberInput).toBe("object");
    expect(typeof numerator.useNumberInput).toBe("function");
    expect(typeof numerator.usePhoneVerification).toBe("function");
    expect(numerator.createExpoNumerator({ locale: "tr-TR" }).locale).toBe(
      "tr-TR",
    );
    const easy = numerator.createNumerator({ locale: "tr-TR" });
    expect(easy.money.format("1234.56", "TRY")).toBe("₺1.234,56");
    expect(easy.money.parse("₺1.234,56", "TRY").amount).toBe("1234.56");
    expect(easy.phone.parse("05012345678").e164).toBe("+905012345678");
    expect(easy.input.money("TRY").locale).toBe("tr-TR");
    expect(typeof numerator.NumeratorProvider).toBe("function");
    expect(typeof numerator.useNumerator).toBe("function");
    expect(numerator.resolveLocale({ locale: "en" })).toBe("en-US");
    expect(numerator.normalizeDigits("١٢٣")).toBe("123");
    expect("ExpoNumeratorModuleView" in numerator).toBe(false);
  });

  it("declares separate publish entrypoints for ESM, CJS, and Metro source", () => {
    expect(packageJson.main).toBe("build/cjs/index.cjs");
    expect(packageJson.module).toBe("build/esm/index.mjs");
    expect(packageJson["react-native"]).toBe("src/index.ts");
    expect(packageJson.homepage).toBe(
      "https://www.npmjs.com/package/expo-numerator",
    );
    expect(packageJson.exports["."].import).toBe("./build/esm/index.mjs");
    expect(packageJson.exports["."].require).toBe("./build/cjs/index.cjs");
    expect(packageJson.exports["."]["react-native"]).toBe("./src/index.ts");
    expect(packageJson.exports["./app.plugin.js"]).toBe("./app.plugin.js");
    expect(packageJson.exports["./plugin/withExpoNumerator"]).toBe(
      "./plugin/withExpoNumerator.js",
    );
    expect(packageJson.exports["./plugin/withExpoNumerator.js"]).toBe(
      "./plugin/withExpoNumerator.js",
    );
    for (const subpath of [
      "core",
      "money",
      "rounding",
      "locale",
      "format",
      "parse",
      "unit",
      "phone",
      "input",
      "expo",
    ]) {
      const exportKey = `./${subpath}` as keyof typeof packageJson.exports;
      const entry = packageJson.exports[exportKey] as {
        import: string;
        "react-native": string;
        require: string;
        types: string;
      };

      expect(entry.types).toBe(`./build/${subpath}/index.d.ts`);
      expect(entry.import).toBe(`./build/esm/${subpath}/index.mjs`);
      expect(entry.require).toBe(`./build/cjs/${subpath}/index.cjs`);
      expect(entry["react-native"]).toBe(`./src/${subpath}/index.ts`);
    }
    expect(packageJson.scripts["value-format:smoke"]).toBe(
      "npm run build && node scripts/check-value-format-smoke.js",
    );
    expect(packageJson.scripts["value-format:report"]).toBe(
      "npm run --silent build >/dev/null && node scripts/check-value-format-smoke.js --json",
    );
    expect(packageJson.scripts["arithmetic:smoke"]).toBe(
      "npm run build && node scripts/check-arithmetic-smoke.js",
    );
    expect(packageJson.scripts["benchmark:report"]).toBe(
      "npm run --silent build >/dev/null && node scripts/benchmark.js --json",
    );
    expect(packageJson.scripts["benchmark:budget"]).toBe(
      "npm run build && node scripts/check-benchmark-budget.js",
    );
    expect(packageJson.scripts["input:replay:report"]).toBe(
      "npm run --silent build >/dev/null && node scripts/input-replay-smoke.js --json",
    );
    expect(packageJson.scripts["report:contracts"]).toBe(
      "npm run build && node scripts/check-report-contracts.js",
    );
    expect(packageJson.scripts["expo:check"]).toBe(
      "node scripts/check-expo-install.js root --allow-typescript-latest",
    );
    expect(packageJson.scripts["example:expo-check"]).toBe(
      "node scripts/check-expo-install.js example",
    );
    expect(packageJson.scripts.hardening).toContain(
      "node scripts/check-value-format-smoke.js",
    );
    expect(packageJson.scripts.hardening).toContain(
      "node scripts/check-arithmetic-smoke.js",
    );
    expect(packageJson.scripts.hardening).toContain("npm run benchmark:budget");
    expect(packageJson.scripts.hardening).toContain(
      "npm run example:typecheck",
    );
    expect(packageJson.scripts.hardening).toContain("npm run expo:check");
    expect(packageJson.scripts.hardening).toContain(
      "npm run example:expo-check",
    );
    expect(packageJson.scripts.hardening).toContain(
      "node scripts/check-report-contracts.js",
    );
  });
});
