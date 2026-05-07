import {
  decimal,
  formatMoney,
  formatNumber,
  formatNumberToParts,
  formatPercent,
  formatUnitBestFit,
  formatUnitForLocale,
  money,
  percent,
  unit,
} from "expo-numerator";

import { DataTable, PageScaffold, Section } from "../components";
import { useShowcase } from "../provider";

export function FormatPage() {
  const { numerator } = useShowcase();
  const value = decimal("1234567.89");
  const compact = numerator.formatNumber("1234567", { notation: "compact" });
  const formattedForLocale = numerator.formatNumber("1234567.89");
  const roundtrip = numerator.safeParseNumber(formattedForLocale);
  const scientific = formatNumber("12345.678", {
    maximumFractionDigits: 2,
    notation: "scientific",
  });
  const engineering = formatNumber("12345.678", {
    maximumFractionDigits: 3,
    notation: "engineering",
  });
  const parts = formatNumberToParts("-1234.56", { locale: "en-US" })
    .map((part) => `${part.type}:${part.value}`)
    .join(" | ");

  return (
    <PageScaffold
      pageId="format"
      title="Format"
      caption="Locale-aware decimal output, compact notation, scientific notation, and deterministic parts."
    >
      <Section title="Locale output">
        <DataTable
          rows={[
            [`${numerator.locale} decimal`, formattedForLocale],
            [
              `${numerator.locale} roundtrip`,
              roundtrip.ok ? roundtrip.value.value : roundtrip.error.code,
            ],
            [`${numerator.locale} compact`, compact],
            ["en-US compact", formatNumber("1200000", { locale: "en-US", notation: "compact" })],
            ["tr-TR compact", formatNumber("1200000", { locale: "tr-TR", notation: "compact" })],
            [
              "en-IN compact",
              formatNumber("12500000", {
                locale: "en-IN",
                maximumFractionDigits: 2,
                notation: "compact",
              }),
            ],
            [
              "ja-JP compact",
              formatNumber("1234567", {
                locale: "ja-JP",
                maximumFractionDigits: 1,
                notation: "compact",
              }),
            ],
          ]}
        />
      </Section>

      <Section title="Advanced notation">
        <DataTable
          rows={[
            ["scientific", scientific],
            ["engineering", engineering],
            ["formatNumberToParts", parts],
          ]}
        />
      </Section>

      <Section title="Money, percent, unit">
        <DataTable
          rows={[
            [
              "accounting money",
              formatMoney(money("-1234.56", "USD"), {
                currencySign: "accounting",
                locale: "en-US",
              }),
            ],
            ["JPY zero minor", formatMoney(money("1234", "JPY"), { locale: "ja-JP" })],
            [
              "de-DE percent",
              formatPercent(percent("0.125"), {
                locale: "de-DE",
                maximumFractionDigits: 1,
              }),
            ],
            [
              "bar in en-US",
              formatUnitForLocale(unit("1", "bar"), {
                locale: "en-US",
                scale: 4,
              }),
            ],
            [
              "best-fit distance",
              formatUnitBestFit(unit("1500", "meter"), {
                scale: 1,
              }),
            ],
          ]}
        />
      </Section>
    </PageScaffold>
  );
}
