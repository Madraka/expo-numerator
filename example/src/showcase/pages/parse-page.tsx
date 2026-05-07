import {
  normalizeDigits,
  parseMoney,
  resolveLocale,
  safeParseMoney,
  safeParseNumber,
} from "expo-numerator";

import { DataTable, PageScaffold, Section } from "../components";
import { useShowcase } from "../provider";

export function ParsePage() {
  const { numerator } = useShowcase();
  const localizedText = numerator.formatNumber("1234.56");
  const parsed = numerator.safeParseNumber(localizedText);
  const strictFailure = safeParseNumber("12,34,567", {
    locale: "en-US",
    mode: "strict",
  });
  const moneyParsed = parseMoney("₺1.234,56", {
    currency: "TRY",
    locale: "tr-TR",
  });
  const mismatch = safeParseMoney("$12.00", {
    currency: "TRY",
    locale: "en-US",
  });

  return (
    <PageScaffold
      pageId="parse"
      title="Parse"
      caption="Strict and loose parsing, non-Latin digit normalization, and typed safe failures."
    >
      <Section title="Parsing contracts">
        <DataTable
          rows={[
            [
              `safeParseNumber("${localizedText}")`,
              parsed.ok ? parsed.value.value : parsed.error.code,
            ],
            ["parseMoney(\"₺1.234,56\")", `${moneyParsed.amount} ${moneyParsed.currency}`],
            ['normalizeDigits("١٢٣۴۵")', normalizeDigits("١٢٣۴۵")],
            ['resolveLocale("fr")', resolveLocale({ locale: "fr" })],
            ["strict grouping failure", strictFailure.ok ? "ok" : strictFailure.error.code],
            ["currency mismatch", mismatch.ok ? "ok" : mismatch.error.code],
          ]}
        />
      </Section>
    </PageScaffold>
  );
}
