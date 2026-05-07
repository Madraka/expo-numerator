import {
  applyNumberInputNativeTextChange,
  compareDecimal,
  createNumberInputState,
  decimal,
  getRegisteredCurrencies,
  getRegisteredLocaleCodes,
  money,
} from "expo-numerator";
import { View } from "react-native";

import {
  FeatureCard,
  FeatureGrid,
  HomeScaffold,
  Metric,
  MetricGrid,
  RouteGrid,
  Section,
} from "../components";
import { getShowcaseCurrencyForLocale } from "../money-examples";
import { useShowcase } from "../provider";

export function OverviewPage() {
  const { numerator } = useShowcase();
  const compact = numerator.formatNumber("1200000", {
    notation: "compact",
  });
  const showcaseCurrency = getShowcaseCurrencyForLocale(numerator.locale);
  const moneyValue = numerator.formatMoney(
    money(showcaseCurrency === "JPY" ? "1234" : "1234.56", showcaseCurrency),
  );
  const inputState = applyNumberInputNativeTextChange(
    createNumberInputState({ locale: numerator.locale }),
    numerator.locale === "tr-TR" ? "1234,56" : "1234.56",
    { locale: numerator.locale },
  );

  return (
    <HomeScaffold>
      <MetricGrid>
        <Metric label="Active locale" value={numerator.locale} />
        <Metric label="Curated locales" value={String(getRegisteredLocaleCodes().length)} />
        <Metric label="Currencies" value={String(getRegisteredCurrencies().length)} />
        <Metric label="Input valid" value={inputState.isValid ? "yes" : "no"} />
      </MetricGrid>

      <Section title="Showcase pages">
        <RouteGrid />
      </Section>

      <Section title="Production surface">
        <View>
          <FeatureGrid>
            <FeatureCard
              title="String decimal core"
              detail="No implicit floating-point conversion for decimal strings."
              value={compareDecimal(decimal("1.10"), "1.1") === 0 ? "stable" : "check"}
            />
            <FeatureCard
              title="Locale formatting"
              detail="Grouping, percent affixes, compact notation, and parts."
              value={compact}
            />
            <FeatureCard
              title="Money domain"
              detail={`${showcaseCurrency} formatted with the active locale.`}
              value={moneyValue}
            />
            <FeatureCard
              title="RN input"
              detail="Headless state, styles-free component, caret matrix."
              value={inputState.text}
            />
          </FeatureGrid>
        </View>
      </Section>
    </HomeScaffold>
  );
}
