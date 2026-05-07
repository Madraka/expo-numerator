import {
  formatNumber,
  getLocaleSymbols,
  getRegisteredLocaleCodes,
  normalizeDigits,
  validateGrouping,
} from "expo-numerator";

import { DataTable, Metric, MetricGrid, PageScaffold, Section } from "../components";
import { localeOptions } from "../routes";
import { useShowcase } from "../provider";

export function LocalePage() {
  const { numerator } = useShowcase();
  const symbols = getLocaleSymbols(numerator.locale);

  return (
    <PageScaffold
      pageId="locale"
      title="Locale"
      caption="Generated CLDR-lite symbols, grouping strategies, digit normalization, and locale fallback behavior."
    >
      <Section title="Active locale symbols">
        <MetricGrid>
          <Metric label="locale" value={symbols.locale} />
          <Metric label="decimal" value={symbols.decimal} />
          <Metric label="group" value={symbols.group} />
          <Metric label="percent" value={symbols.percentSign} />
        </MetricGrid>
      </Section>

      <Section title="Curated locale matrix">
        <DataTable
          rows={localeOptions.map((locale) => [
            locale,
            formatNumber("1234567.89", { locale }),
          ])}
        />
      </Section>

      <Section title="Digit and grouping acceptance">
        <DataTable
          rows={[
            ['normalizeDigits("١٢٣۴۵६")', normalizeDigits("١٢٣۴۵६")],
            [
              'validateGrouping("1,234,567", en-US)',
              validateGrouping("1,234,567", { locale: "en-US" }) ? "valid" : "invalid",
            ],
            [
              'validateGrouping("12,34,567", en-IN)',
              validateGrouping("12,34,567", { locale: "en-IN" }) ? "valid" : "invalid",
            ],
            [
              'validateGrouping("12,34,567", en-US)',
              validateGrouping("12,34,567", { locale: "en-US" }) ? "valid" : "invalid",
            ],
            ["registered locales", String(getRegisteredLocaleCodes().length)],
          ]}
        />
      </Section>
    </PageScaffold>
  );
}
