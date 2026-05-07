import {
  addDecimal,
  allocateMinorUnits,
  canConvertUnit,
  createNumberInputState,
  decimal,
  divideDecimal,
  formatMoney,
  formatNumber,
  formatPercent,
  formatUnitBestFit,
  formatUnitForLocale,
  getCurrencyMeta,
  getRegisteredCurrencyCodes,
  getRegisteredUnitCodes,
  money,
  percent,
  parseUnit,
  safeDecimal,
  safeMoney,
  safeParseMoney,
  safeParseNumber,
  toMinorUnits,
  unit,
} from "expo-numerator";

import {
  DataTable,
  Metric,
  MetricGrid,
  PageScaffold,
  Section,
} from "../components";

export function HardeningPage() {
  const packageState = createNumberInputState({
    defaultValue: "1",
    mode: "decimal",
  });

  return (
    <PageScaffold
      pageId="hardening"
      title="Hardening"
      caption="Release gates and smoke signals that keep the package shippable."
    >
      <Section title="Release gates">
        <DataTable
          rows={[
            ["typecheck", "npm run typecheck"],
            ["unit tests", "npm test -- --runInBand"],
            ["example app", "npm run example:typecheck"],
            ["api surface", "npm run api:surface"],
            ["value/format smoke", "npm run value-format:smoke"],
            ["arithmetic smoke", "npm run arithmetic:smoke"],
            ["currency registry", "npm run currency:registry"],
            ["unit registry", "npm run unit:registry"],
            ["showcase contract", "npm run showcase:contract"],
            ["hardening", "npm run hardening"],
            ["package smoke", "npm run package:smoke"],
            ["pack dry-run", "npm pack --dry-run"],
          ]}
        />
      </Section>

      <Section title="Smoke signals">
        <MetricGrid>
          <Metric label="Input state" value={packageState.isValid ? "valid" : "invalid"} />
          <Metric label="Safe parse" value={safeParseNumber("12.3").ok ? "ok" : "fail"} />
          <Metric label="Safe decimal" value={safeDecimal("1e3").ok ? "fail" : "ok"} />
          <Metric label="Safe money" value={safeMoney("12.30", "TRY").ok ? "ok" : "fail"} />
          <Metric label="Add carry" value={addDecimal("999.99", "0.01").value} />
          <Metric label="Divide" value={divideDecimal("2", "3", { scale: 2 }).value} />
          <Metric label="Minor units" value={toMinorUnits("12.34", "USD").toString()} />
          <Metric label="Allocation" value={allocateMinorUnits(10n, [1, 1, 1]).join(" / ")} />
          <Metric label="Compact" value={formatNumber("1234", { notation: "compact" })} />
          <Metric
            label="Accounting"
            value={formatMoney(money("-12.30", "USD"), {
              currencySign: "accounting",
              locale: "en-US",
            })}
          />
          <Metric
            label="Percent"
            value={formatPercent(percent("0.125"), {
              locale: "de-DE",
              maximumFractionDigits: 1,
            })}
          />
          <Metric
            label="Best fit"
            value={formatUnitBestFit(unit("1500", "meter"), { scale: 1 })}
          />
          <Metric
            label="Locale unit"
            value={formatUnitForLocale(unit("1", "bar"), {
              locale: "en-US",
              scale: 2,
            })}
          />
          <Metric label="Huge decimal" value={decimal("999999999999999999999.1").value} />
          <Metric label="Currencies" value={String(getRegisteredCurrencyCodes().length)} />
          <Metric label="JPY minor" value={String(getCurrencyMeta("JPY").minorUnit)} />
          <Metric
            label="Symbol guard"
            value={safeParseMoney("¥1", { currency: "CNY", locale: "en-US" }).ok ? "fail" : "ok"}
          />
          <Metric label="Units" value={String(getRegisteredUnitCodes().length)} />
          <Metric
            label="Alias split"
            value={
              parseUnit("1 kt").unit === "knot" &&
              parseUnit("1 kN").unit === "kilonewton"
                ? "ok"
                : "fail"
            }
          />
          <Metric
            label="Torque"
            value={canConvertUnit("newton-meter", "pound-foot") ? "ok" : "fail"}
          />
        </MetricGrid>
      </Section>
    </PageScaffold>
  );
}
