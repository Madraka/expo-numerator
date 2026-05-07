import {
  NumeratorError,
  decimal,
  money,
  parseNumber,
  roundDecimal,
  safeDecimal,
  safeMoney,
  safeParseMoney,
  safeParseNumber,
} from "expo-numerator";

import { DataTable, Metric, MetricGrid, PageScaffold, Section } from "../components";

export function ErrorsPage() {
  const invalidDecimal = captureNumeratorError(() => decimal("12..3"));
  const unsafeNumber = captureNumeratorError(() => decimal(12.3));
  const invalidMoney = captureNumeratorError(() => money("1", "FOO"));
  const invalidGrouping = captureNumeratorError(() =>
    parseNumber("12,34,567", { locale: "en-US", mode: "strict" }),
  );
  const invalidRounding = captureNumeratorError(() =>
    roundDecimal("1.25", { scale: -1 }),
  );
  const safeInvalidDecimal = safeDecimal("12..3");
  const safeInvalidMoney = safeMoney("12.30", "FOO");
  const safeCurrencyMismatch = safeParseMoney("$12.00", {
    currency: "TRY",
    locale: "en-US",
  });
  const safeInvalidGrouping = safeParseNumber("12,34,567", {
    locale: "en-US",
    mode: "strict",
  });

  return (
    <PageScaffold
      pageId="errors"
      title="Errors"
      caption="Stable NumeratorError codes, safe result APIs, and explicit no-float-loss behavior."
    >
      <Section title="Throwing API failures">
        <DataTable
          rows={[
            ['decimal("12..3")', invalidDecimal],
            ["decimal(12.3)", unsafeNumber],
            ['money("1", "FOO")', invalidMoney],
            ['parseNumber("12,34,567", strict en-US)', invalidGrouping],
            ["roundDecimal scale -1", invalidRounding],
          ]}
        />
      </Section>

      <Section title="Safe API failures">
        <MetricGrid>
          <Metric
            label="safeDecimal"
            value={safeInvalidDecimal.ok ? "ok" : safeInvalidDecimal.error.code}
          />
          <Metric
            label="safeMoney"
            value={safeInvalidMoney.ok ? "ok" : safeInvalidMoney.error.code}
          />
          <Metric
            label="safeParseMoney"
            value={safeCurrencyMismatch.ok ? "ok" : safeCurrencyMismatch.error.code}
          />
          <Metric
            label="safeParseNumber"
            value={safeInvalidGrouping.ok ? "ok" : safeInvalidGrouping.error.code}
          />
        </MetricGrid>
      </Section>

      <Section title="Failure contract">
        <DataTable
          rows={[
            ["error class", "NumeratorError"],
            ["stable field", "code"],
            ["debug field", "details"],
            ["unexpected errors", "normalized by safe APIs"],
            ["unsafe floats", "rejected"],
          ]}
        />
      </Section>
    </PageScaffold>
  );
}

function captureNumeratorError(operation: () => unknown): string {
  try {
    operation();
    return "ok";
  } catch (error) {
    if (error instanceof NumeratorError) {
      return error.code;
    }

    return "unexpected";
  }
}
