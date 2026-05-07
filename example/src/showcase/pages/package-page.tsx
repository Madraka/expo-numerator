import { DEFAULT_MAX_DECIMAL_INPUT_LENGTH } from "expo-numerator/core";
import {
  createExpoNumerator,
  getNativePlatformInfo,
} from "expo-numerator/expo";
import { formatMoney, formatNumber } from "expo-numerator/format";
import {
  createMoneyInputOptions,
  createNumberInputState,
} from "expo-numerator/input";
import { DEFAULT_LOCALE } from "expo-numerator/locale";
import { money, toMinorUnits } from "expo-numerator/money";
import { parseNumber, safeParseNumber } from "expo-numerator/parse";
import { DEFAULT_ROUNDING_MODE } from "expo-numerator/rounding";
import { convertUnit } from "expo-numerator/unit";

import { DataTable, Metric, MetricGrid, PageScaffold, Section } from "../components";

export function PackagePage() {
  const numerator = createExpoNumerator({ locale: "en-US" });
  const inputState = createNumberInputState({ defaultValue: "1234.56" });
  const moneyInput = createMoneyInputOptions("JPY");
  const nativeInfo = getNativePlatformInfo();

  return (
    <PageScaffold
      pageId="package"
      title="Package"
      caption="Export map discipline, runtime smoke coverage, bundle gates, and Metro-safe source entry."
    >
      <Section title="Package contract">
        <DataTable
          rows={[
            ["main", "build/cjs/index.cjs"],
            ["module", "build/esm/index.mjs"],
            ["types", "build/index.d.ts"],
            ["react-native", "src/index.ts"],
            ["sideEffects", "false"],
            ["core dependencies", "0"],
            ["optional native", "expo-localization"],
            ["subpaths", "core, money, rounding, locale, format, parse, unit, input, expo"],
          ]}
        />
      </Section>

      <Section title="Runtime smoke">
        <MetricGrid>
          <Metric label="default locale" value={DEFAULT_LOCALE} />
          <Metric label="rounding" value={DEFAULT_ROUNDING_MODE} />
          <Metric label="max input" value={String(DEFAULT_MAX_DECIMAL_INPUT_LENGTH)} />
          <Metric label="native" value={nativeInfo.native ? "available" : "fallback"} />
        </MetricGrid>
      </Section>

      <Section title="Public export checks">
        <DataTable
          rows={[
            ['formatNumber("1234.56")', formatNumber("1234.56")],
            ['formatMoney(money("1", "USD"))', formatMoney(money("1", "USD"))],
            ['parseNumber("1,234.56")', parseNumber("1,234.56").value],
            ["safeParseNumber", safeParseNumber("1,234.56").ok ? "ok" : "error"],
            ["createNumberInputState", inputState.text],
            ["createExpoNumerator locale", numerator.locale],
          ]}
        />
      </Section>

      <Section title="Domain subpaths">
        <DataTable
          rows={[
            ["expo-numerator/core", DEFAULT_MAX_DECIMAL_INPUT_LENGTH.toString()],
            ["expo-numerator/money", toMinorUnits("1.23", "USD").toString()],
            ["expo-numerator/rounding", DEFAULT_ROUNDING_MODE],
            ["expo-numerator/locale", DEFAULT_LOCALE],
            ["expo-numerator/format", formatMoney(money("1", "USD"))],
            ["expo-numerator/parse", parseNumber("1,234.56").value],
            [
              "expo-numerator/unit",
              convertUnit(
                {
                  dimension: "length",
                  kind: "unit",
                  unit: "kilometer",
                  value: "1",
                },
                "meter",
                { scale: 0 },
              ).value,
            ],
            ["expo-numerator/input", moneyInput.allowDecimal === false ? "JPY integer" : "decimal"],
            ["expo-numerator/expo", numerator.locale],
          ]}
        />
      </Section>

      <Section title="Release gates">
        <DataTable
          rows={[
            ["TypeScript", "npm run typecheck"],
            ["Jest", "npm test -- --runInBand"],
            ["Showcase contract", "npm run showcase:contract"],
            ["Expo Doctor", "npm run example:doctor"],
            ["Bundle budget", "npm run bundle:budget"],
            ["Package smoke", "npm run package:smoke"],
            ["Full hardening", "npm run hardening"],
          ]}
        />
      </Section>
    </PageScaffold>
  );
}
