import { Link, usePathname } from "expo-router";
import type React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  type StyleProp,
  Text,
  type ViewStyle,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { localeOptions, showcasePages, type ShowcaseRoute } from "./routes";
import { useShowcase } from "./provider";

export function PageScaffold(props: {
  pageId: string;
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.pageContent,
        { paddingBottom: Math.max(insets.bottom, 16) + 24 },
      ]}
      style={styles.page}
      testID={`expo-numerator-screen-${props.pageId}`}
    >
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.kicker}>expo-numerator</Text>
          <Text style={styles.pageTitle}>{props.title}</Text>
          <Text style={styles.pageCaption}>{props.caption}</Text>
        </View>
        <LocalePicker />
      </View>
      <RouteStrip />
      {props.children}
    </ScrollView>
  );
}

export function HomeScaffold(props: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.pageContent,
        { paddingBottom: Math.max(insets.bottom, 16) + 24 },
      ]}
      style={styles.page}
      testID="expo-numerator-screen-overview"
    >
      <View style={styles.homeHero}>
        <Text style={styles.kicker}>Expo SDK 55 showcase</Text>
        <Text style={styles.homeTitle}>expo-numerator</Text>
        <Text style={styles.homeCaption}>
          A route-based product gallery and test center for numeric values,
          locale formatting, parsing, React Native input, Expo integration, and
          release hardening.
        </Text>
        <LocalePicker />
      </View>
      {props.children}
    </ScrollView>
  );
}

export function RouteGrid() {
  return (
    <View style={styles.routeGrid}>
      {showcasePages
        .filter((page) => page.href !== "/")
        .map((page) => (
          <Link key={page.href} href={page.href} asChild>
            <Pressable
              accessibilityRole="button"
              testID={`expo-numerator-page-${page.id}`}
              style={styles.routeCard}
            >
              <Text style={styles.routeTitle}>{page.title}</Text>
              <Text style={styles.routeCaption}>{page.caption}</Text>
              <Text style={styles.routeAction}>Open page</Text>
            </Pressable>
          </Link>
        ))}
    </View>
  );
}

export function RouteStrip() {
  const pathname = usePathname() as ShowcaseRoute;
  const { width } = useWindowDimensions();
  const compact = width < 720;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.routeStrip}
    >
      {showcasePages.map((page) => {
        const active = pathname === page.href;

        return (
          <Link key={page.href} href={page.href} asChild>
            <Pressable
              accessibilityRole="button"
              testID={`expo-numerator-page-${page.id}`}
              style={flattenStyle([
                styles.routePill,
                active ? styles.routePillActive : null,
              ])}
            >
              <Text
                style={[
                  styles.routePillText,
                  active ? styles.routePillTextActive : null,
                ]}
              >
                {compact ? page.title.replace("Input Lab", "Input") : page.title}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </ScrollView>
  );
}

export function LocalePicker() {
  const showcase = useShowcase();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.localePicker}
    >
      {localeOptions.map((locale) => {
        const active = showcase.locale === locale;

        return (
          <Pressable
            key={locale}
            accessibilityRole="button"
            testID={`expo-numerator-locale-${locale}`}
            onPress={() => showcase.setLocale(locale)}
            style={flattenStyle([
              styles.localeButton,
              active ? styles.localeButtonActive : null,
            ])}
          >
            <Text
              style={[
                styles.localeButtonText,
                active ? styles.localeButtonTextActive : null,
              ]}
            >
              {locale}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{props.title}</Text>
      {props.children}
    </View>
  );
}

export function Metric(props: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{props.label}</Text>
      <Text selectable style={styles.metricValue}>
        {props.value}
      </Text>
    </View>
  );
}

export function MetricGrid(props: { children: React.ReactNode }) {
  return <View style={styles.metricGrid}>{props.children}</View>;
}

export function FeatureCard(props: {
  title: string;
  detail: string;
  value: string;
}) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureTitle}>{props.title}</Text>
      <Text style={styles.featureDetail}>{props.detail}</Text>
      <Text selectable style={styles.featureValue}>
        {props.value}
      </Text>
    </View>
  );
}

export function FeatureGrid(props: { children: React.ReactNode }) {
  return <View style={styles.featureGrid}>{props.children}</View>;
}

export function DataTable(props: { rows: Array<[string, string]> }) {
  return (
    <View style={styles.table}>
      {props.rows.map(([label, value], index) => (
        <View key={`${label}-${index}`} style={styles.tableRow}>
          <Text style={styles.tableLabel}>{label}</Text>
          <Text selectable style={styles.tableValue}>
            {value}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function ActionButton(props: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      style={styles.actionButton}
    >
      <Text style={styles.actionButtonText}>{props.label}</Text>
    </Pressable>
  );
}

export function InlineActions(props: { children: React.ReactNode }) {
  return <View style={styles.inlineActions}>{props.children}</View>;
}

export function DataLine(props: {
  children: string;
  testID?: string;
}) {
  return (
    <Text selectable style={styles.dataLine} testID={props.testID}>
      {props.children}
    </Text>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#F5F7FA",
    flex: 1,
  },
  pageContent: {
    gap: 18,
    padding: 18,
  },
  hero: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D8DEE8",
    borderRadius: 8,
    borderWidth: 1,
    gap: 16,
    padding: 16,
  },
  heroText: {
    gap: 4,
  },
  homeHero: {
    backgroundColor: "#102A43",
    borderRadius: 8,
    gap: 14,
    padding: 20,
  },
  kicker: {
    color: "#55708E",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  homeTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
  },
  homeCaption: {
    color: "#D9E6F2",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 760,
  },
  pageTitle: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "900",
  },
  pageCaption: {
    color: "#586174",
    fontSize: 15,
    lineHeight: 22,
  },
  localePicker: {
    gap: 8,
  },
  localeButton: {
    backgroundColor: "#F3F5F8",
    borderColor: "#D8DEE8",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  localeButtonActive: {
    backgroundColor: "#2F6FED",
    borderColor: "#2F6FED",
  },
  localeButtonText: {
    color: "#435066",
    fontSize: 13,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
  localeButtonTextActive: {
    color: "#FFFFFF",
  },
  routeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  routeCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D8DEE8",
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 220,
    flexGrow: 1,
    gap: 8,
    padding: 16,
  },
  routeTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "900",
  },
  routeCaption: {
    color: "#586174",
    fontSize: 13,
    lineHeight: 19,
  },
  routeAction: {
    color: "#154EB8",
    fontSize: 13,
    fontWeight: "800",
  },
  routeStrip: {
    gap: 8,
  },
  routePill: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D8DEE8",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  routePillActive: {
    backgroundColor: "#E9F2FF",
    borderColor: "#2F6FED",
  },
  routePillText: {
    color: "#435066",
    fontSize: 13,
    fontWeight: "800",
  },
  routePillTextActive: {
    color: "#154EB8",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E7EF",
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "900",
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metric: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E1E7EF",
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 150,
    flexGrow: 1,
    gap: 6,
    padding: 14,
  },
  metricLabel: {
    color: "#677386",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metricValue: {
    color: "#111827",
    fontSize: 19,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureCard: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E1E7EF",
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 220,
    flexGrow: 1,
    gap: 8,
    padding: 14,
  },
  featureTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  },
  featureDetail: {
    color: "#586174",
    fontSize: 13,
    lineHeight: 19,
  },
  featureValue: {
    color: "#154EB8",
    fontSize: 16,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
  },
  table: {
    borderColor: "#E1E7EF",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  tableRow: {
    borderBottomColor: "#E1E7EF",
    borderBottomWidth: 1,
    gap: 8,
    padding: 12,
  },
  tableLabel: {
    color: "#586174",
    fontSize: 12,
    fontWeight: "800",
  },
  tableValue: {
    color: "#111827",
    fontSize: 15,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
    lineHeight: 21,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#AAB4C2",
    borderRadius: 8,
    borderWidth: 1,
    color: "#111827",
    fontSize: 18,
    fontVariant: ["tabular-nums"],
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  actionButton: {
    backgroundColor: "#102A43",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  inlineActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  dataLine: {
    color: "#111827",
    fontSize: 14,
    fontVariant: ["tabular-nums"],
    lineHeight: 20,
  },
});

export const showcaseStyles = styles;

function flattenStyle<T extends ViewStyle>(style: StyleProp<T>): T {
  return StyleSheet.flatten(style) as T;
}
