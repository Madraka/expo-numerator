import {
  addDecimal,
  allocateMoney,
  compareDecimal,
  decimal,
  divideDecimal,
  formatMoney,
  fromMinorUnits,
  getCurrencyMeta,
  money,
  multiplyDecimal,
  percent,
  roundDecimal,
  safeDecimal,
  safeMoney,
  safeUnit,
  scaleDecimal,
  subtractDecimal,
  toMinorUnits,
  unit,
} from "expo-numerator";

import { DataTable, Metric, MetricGrid, PageScaffold, Section } from "../components";
import { useShowcase } from "../provider";

export function ValuesPage() {
  const { numerator } = useShowcase();
  const exact = decimal("000123.4500");
  const negativeZero = decimal("-0.000");
  const huge = decimal("999999999999999999999.123456789");
  const addCarry = addDecimal("999999999999999999999.99", "0.01");
  const subtract = subtractDecimal("1.20", "2.30");
  const product = multiplyDecimal("12.30", "3.0");
  const quotient = divideDecimal("2", "3", { scale: 2 });
  const rounded = roundDecimal("-1.255", {
    roundingMode: "halfEven",
    scale: 2,
  });
  const scaled = scaleDecimal("12.3", 4);
  const price = money("001234.5600", "TRY");
  const jpyExact = money("1234", "JPY");
  const jpyFraction = money("1234.56", "JPY");
  const uyw = money("1.2345", "UYW");
  const usdMinor = toMinorUnits("12.34", "USD");
  const usdMinorRounded = toMinorUnits("1.225", "USD", {
    roundingMode: "halfEven",
    scalePolicy: "round",
  });
  const usdFromMinor = fromMinorUnits(1234n, "USD");
  const usdAllocation = allocateMoney(money("0.10", "USD"), [1, 1, 1]);
  const ratio = percent("0.125");
  const distance = unit("12.5", "kilometer");
  const safeJpy = safeMoney("12.345", "JPY");
  const safeDecimalFailure = safeDecimal("1e3");
  const safeUnitFailure = safeUnit("1", "unknown-unit");
  const moneyExamples = [
    money("1234.56", "TRY"),
    money("1234.56", "USD"),
    money("1234.56", "EUR"),
    money("1234", "JPY"),
    money("1234.567", "KWD"),
  ];

  return (
    <PageScaffold
      pageId="values"
      title="Values"
      caption="Canonical decimal, money, percent, and unit values without silent precision loss."
    >
      <Section title="Canonical values">
        <DataTable
          rows={[
            ['decimal("000123.4500")', exact.value],
            ['decimal("-0.000")', negativeZero.value],
            ["huge decimal", huge.value],
            ['compareDecimal("1.10", "1.1")', String(compareDecimal("1.10", "1.1"))],
            ['scaleDecimal("12.3", 4)', scaled.value],
            ['roundDecimal("-1.255", halfEven)', rounded.value],
            ['money("001234.5600", "TRY")', `${price.amount} ${price.currency}`],
            ['percent("0.125")', ratio.value],
            ['unit("12.5", "kilometer")', `${distance.value} ${distance.unit}`],
          ]}
        />
      </Section>

      <Section title="Decimal arithmetic">
        <DataTable
          rows={[
            ['addDecimal("999999999999999999999.99", "0.01")', addCarry.value],
            ['subtractDecimal("1.20", "2.30")', subtract.value],
            ['multiplyDecimal("12.30", "3.0")', product.value],
            ['divideDecimal("2", "3", scale 2)', quotient.value],
          ]}
        />
      </Section>

      <Section title="Safe and exactness contracts">
        <DataTable
          rows={[
            ["JPY exact minor", jpyExact.minor?.toString() ?? "none"],
            ["JPY fractional minor", jpyFraction.minor?.toString() ?? "no minor"],
            ["UYW four-minor", uyw.minor?.toString() ?? "none"],
            ['toMinorUnits("12.34", "USD")', usdMinor.toString()],
            ['toMinorUnits("1.225", "USD", halfEven)', usdMinorRounded.toString()],
            ["fromMinorUnits(1234n, USD)", usdFromMinor.amount],
            [
              'allocateMoney("0.10", [1, 1, 1])',
              usdAllocation.map((share) => share.amount).join(" / "),
            ],
            ['safeMoney("12.345", "JPY")', safeJpy.ok ? "ok" : safeJpy.error.code],
            ['safeDecimal("1e3")', safeDecimalFailure.ok ? "ok" : safeDecimalFailure.error.code],
            [
              'safeUnit("1", "unknown-unit")',
              safeUnitFailure.ok ? "ok" : safeUnitFailure.error.code,
            ],
          ]}
        />
      </Section>

      <Section title={`Money formatting in ${numerator.locale}`}>
        <DataTable
          rows={moneyExamples.map((value) => [
            value.currency,
            formatMoney(value, { locale: numerator.locale }),
          ])}
        />
      </Section>

      <Section title="Currency metadata">
        <MetricGrid>
          <Metric label="TRY minor unit" value={String(getCurrencyMeta("TRY").minorUnit)} />
          <Metric label="JPY minor unit" value={String(getCurrencyMeta("JPY").minorUnit)} />
          <Metric label="KWD minor unit" value={String(getCurrencyMeta("KWD").minorUnit)} />
          <Metric label="UYW minor unit" value={String(getCurrencyMeta("UYW").minorUnit)} />
        </MetricGrid>
      </Section>
    </PageScaffold>
  );
}
