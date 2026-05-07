import { DataTable, PageScaffold, Section } from "../components";
import { useShowcase } from "../provider";

export function ExpoPage() {
  const { numerator } = useShowcase();
  const separators = numerator.getNumberSeparators(numerator.locale);

  return (
    <PageScaffold
      pageId="expo"
      title="Expo"
      caption="Provider-bound helpers, optional native metadata, and crash-safe fallbacks."
    >
      <Section title="Provider-bound adapter">
        <DataTable
          rows={[
            ["locale", numerator.locale],
            ["fallbackLocale", numerator.fallbackLocale],
            ["platform", numerator.platform.platform],
            ["native module", numerator.platform.native ? "available" : "fallback"],
            ["decimal separator", separators?.decimal ?? numerator.symbols.decimal],
            ["group separator", separators?.grouping ?? numerator.symbols.group],
            ["localization source", numerator.localization.source],
          ]}
        />
      </Section>

      <Section title="Bound helpers">
        <DataTable
          rows={[
            ['formatNumber("1234.56")', numerator.formatNumber("1234.56")],
            [
              'safeParseNumber("1.234,56")',
              numerator.safeParseNumber("1.234,56").ok ? "ok" : "error",
            ],
            ["input locale option", numerator.getNumberInputOptions().locale ?? "none"],
          ]}
        />
      </Section>
    </PageScaffold>
  );
}
