import {
  allocateMoney,
  fromMinorUnits,
  formatMoney,
  getCurrencyMeta,
  getRegisteredCurrencies,
  money,
  safeParseMoney,
  toMinorUnits,
} from "expo-numerator";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  DataTable,
  FeatureCard,
  FeatureGrid,
  Metric,
  MetricGrid,
  PageScaffold,
  Section,
} from "../components";
import { useShowcase } from "../provider";

const criticalCurrencyCodes = [
  "TRY",
  "USD",
  "EUR",
  "JPY",
  "KRW",
  "CLP",
  "VND",
  "KWD",
  "OMR",
  "UYW",
] as const;

const currencyFilters = [
  { id: "all", label: "All" },
  { id: "zero", label: "0 minor" },
  { id: "three", label: "3 minor" },
  { id: "four", label: "4 minor" },
] as const;

type CurrencyFilter = (typeof currencyFilters)[number]["id"];

export function CurrencyPage() {
  const { numerator } = useShowcase();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CurrencyFilter>("all");
  const currencies = getRegisteredCurrencies();
  const zeroMinorCount = currencies.filter((currency) => currency.minorUnit === 0).length;
  const threeMinorCount = currencies.filter((currency) => currency.minorUnit === 3).length;
  const fourMinorCount = currencies.filter((currency) => currency.minorUnit === 4).length;
  const filteredCurrencies = useMemo(() => {
    const normalizedQuery = query.trim().toUpperCase();

    return currencies
      .filter((currency) => {
        if (filter === "zero" && currency.minorUnit !== 0) {
          return false;
        }

        if (filter === "three" && currency.minorUnit !== 3) {
          return false;
        }

        if (filter === "four" && currency.minorUnit !== 4) {
          return false;
        }

        if (normalizedQuery.length === 0) {
          return true;
        }

        return [
          currency.code,
          currency.numeric ?? "",
          currency.name ?? "",
          currency.symbol ?? "",
        ].some((value) => value.toUpperCase().includes(normalizedQuery));
      })
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [currencies, filter, query]);
  const jpy = money("1234", "JPY");
  const jpyFraction = money("1234.56", "JPY");
  const kwd = money("1.234", "KWD");
  const uyw = money("1.2345", "UYW");
  const usdMinor = toMinorUnits("12.34", "USD");
  const usdRoundedMinor = toMinorUnits("1.225", "USD", {
    roundingMode: "halfEven",
    scalePolicy: "round",
  });
  const usdFromMinor = fromMinorUnits(1234n, "USD");
  const usdAllocation = allocateMoney(money("0.10", "USD"), [1, 1, 1]);
  const usdSubMinor = (() => {
    try {
      toMinorUnits("1.234", "USD");
      return "ok";
    } catch (error) {
      return error instanceof Error ? error.message : "failed";
    }
  })();
  const audParse = safeParseMoney("A$1,234.56", {
    currency: "AUD",
    locale: "en-US",
  });
  const cnySymbolGuard = safeParseMoney("¥1", {
    currency: "CNY",
    locale: "en-US",
  });
  const mismatchGuard = safeParseMoney("€1,234.56", {
    currency: "USD",
    locale: "en-US",
  });

  return (
    <PageScaffold
      pageId="currency"
      title="Currency"
      caption="ISO 4217 registry coverage, minor-unit behavior, and parser guards."
    >
      <Section title="Registry coverage">
        <MetricGrid>
          <Metric label="Currencies" value={String(currencies.length)} />
          <Metric label="Zero minor" value={String(zeroMinorCount)} />
          <Metric label="Three minor" value={String(threeMinorCount)} />
          <Metric label="Four minor" value={String(fourMinorCount)} />
          <Metric label="Filtered" value={String(filteredCurrencies.length)} />
        </MetricGrid>
      </Section>

      <Section title="Registry lab">
        <TextInput
          accessibilityLabel="Currency registry search"
          autoCapitalize="characters"
          autoCorrect={false}
          onChangeText={setQuery}
          placeholder="Search code, numeric, name, symbol"
          style={styles.searchInput}
          testID="expo-numerator-currency-search"
          value={query}
        />
        <View style={styles.filterRow}>
          {currencyFilters.map((item) => {
            const active = item.id === filter;

            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => setFilter(item.id)}
                style={[styles.filterButton, active ? styles.filterButtonActive : null]}
                testID={`expo-numerator-currency-filter-${item.id}`}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    active ? styles.filterButtonTextActive : null,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <DataTable
          rows={filteredCurrencies.slice(0, 24).map((currency) => [
            currency.code,
            `${currency.name ?? currency.code} · numeric ${
              currency.numeric ?? "-"
            } · minor ${currency.minorUnit}${
              currency.symbol ? ` · ${currency.symbol}` : ""
            }`,
          ])}
        />
      </Section>

      <Section title="Critical entries">
        <DataTable
          rows={criticalCurrencyCodes.map((code) => {
            const meta = getCurrencyMeta(code);

            return [
              code,
              `${meta.name ?? code} · numeric ${meta.numeric ?? "-"} · minor ${
                meta.minorUnit
              }`,
            ];
          })}
        />
      </Section>

      <Section title="Minor-unit contract">
        <FeatureGrid>
          <FeatureCard
            title="Zero minor"
            detail="JPY emits minor only when the amount has no fraction."
            value={`${jpy.minor?.toString() ?? "-"} / ${
              jpyFraction.minor?.toString() ?? "no minor"
            }`}
          />
          <FeatureCard
            title="Three minor"
            detail="KWD keeps three decimal places without rounding."
            value={kwd.minor?.toString() ?? "-"}
          />
          <FeatureCard
            title="Four minor"
            detail="UYW proves the registry gate is not hardcoded to 0-3."
            value={uyw.minor?.toString() ?? "-"}
          />
        </FeatureGrid>
        <DataTable
          rows={[
            ['toMinorUnits("12.34", "USD")', usdMinor.toString()],
            ['toMinorUnits("1.234", "USD")', usdSubMinor],
            ['toMinorUnits("1.225", halfEven)', usdRoundedMinor.toString()],
            ["fromMinorUnits(1234n, USD)", usdFromMinor.amount],
            [
              'allocateMoney("0.10", [1, 1, 1])',
              usdAllocation.map((share) => share.amount).join(" / "),
            ],
          ]}
        />
      </Section>

      <Section title="Parser guards">
        <DataTable
          rows={[
            [
              "AUD symbol",
              audParse.ok ? `${audParse.value.amount} ${audParse.value.currency}` : "fail",
            ],
            ["CNY vs ¥", cnySymbolGuard.ok ? "fail" : cnySymbolGuard.error.code],
            ["USD vs €", mismatchGuard.ok ? "fail" : mismatchGuard.error.code],
          ]}
        />
      </Section>

      <Section title="Locale display">
        <FeatureGrid>
          <FeatureCard
            title="Active locale"
            detail="Money display uses the selected showcase locale."
            value={numerator.locale}
          />
          <FeatureCard
            title="TRY"
            detail="Local symbol, canonical currency metadata."
            value={formatMoney(money("1234.56", "TRY"), { locale: numerator.locale })}
          />
          <FeatureCard
            title="JPY"
            detail="Zero-minor display remains fraction-free."
            value={formatMoney(jpy, { locale: numerator.locale })}
          />
        </FeatureGrid>
      </Section>
    </PageScaffold>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "#AAB4C2",
    borderRadius: 8,
    borderWidth: 1,
    color: "#111827",
    fontSize: 16,
    fontVariant: ["tabular-nums"],
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    backgroundColor: "#F8FAFC",
    borderColor: "#D8DEE8",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  filterButtonActive: {
    backgroundColor: "#E9F2FF",
    borderColor: "#2F6FED",
  },
  filterButtonText: {
    color: "#435066",
    fontSize: 13,
    fontWeight: "900",
  },
  filterButtonTextActive: {
    color: "#154EB8",
  },
});
