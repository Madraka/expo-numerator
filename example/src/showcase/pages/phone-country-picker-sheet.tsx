import {
  getPhoneCountries,
  getPhoneCountryMeta,
  type PhoneCountryMeta,
} from "expo-numerator";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useShowcase } from "../provider";
import { getDefaultPhoneRegion } from "./phone-utils";

export function PhoneCountryPickerSheet() {
  const { numerator, phoneRegion, setPhoneRegion } = useShowcase();
  const insets = useSafeAreaInsets();
  const defaultRegion = getDefaultPhoneRegion(numerator.locale);
  const activeRegion = phoneRegion ?? defaultRegion;
  const activeCountry = getPhoneCountryMeta(activeRegion, {
    locale: numerator.locale,
  });
  const preferredRegions = useMemo(
    () => [defaultRegion, "US", "GB"],
    [defaultRegion],
  );
  const [query, setQuery] = useState("");
  const countries = useMemo(
    () =>
      filterCountries(
        getPhoneCountries({
          locale: numerator.locale,
          preferredRegions,
        }),
        query,
      ),
    [numerator.locale, preferredRegions, query],
  );

  const selectCountry = (country: PhoneCountryMeta) => {
    setPhoneRegion(country.region);
    router.back();
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: Math.max(insets.bottom, 16),
          paddingTop: Math.max(insets.top, 20) + 12,
        },
      ]}
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
      style={styles.container}
      testID="expo-numerator-phone-country-sheet"
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <Text style={styles.title}>Country</Text>
            <Text style={styles.subtitle}>Phone calling code</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.doneButton}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
        <View style={styles.selectedBlock}>
          <Text style={styles.selectedLabel}>Current selection</Text>
          <Text selectable style={styles.selectedValue}>
            {`${activeCountry.localizedName} +${activeCountry.countryCallingCode}`}
          </Text>
        </View>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          onChangeText={setQuery}
          placeholder="Search country or calling code"
          returnKeyType="search"
          style={styles.searchInput}
          testID="expo-numerator-phone-country-search"
          value={query}
        />
      </View>

      <View style={styles.list} testID="expo-numerator-phone-country-picker">
        {countries.length === 0 ? (
          <Text style={styles.emptyText}>No countries found</Text>
        ) : (
          countries.map((country) => (
            <CountryRow
              key={`${country.region}-${country.countryCallingCode}`}
              country={country}
              onSelect={selectCountry}
              selected={country.region === activeRegion}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function CountryRow(props: {
  readonly country: PhoneCountryMeta;
  readonly onSelect: (country: PhoneCountryMeta) => void;
  readonly selected: boolean;
}) {
  const { country, onSelect, selected } = props;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onSelect(country)}
      style={[styles.countryRow, selected ? styles.countryRowSelected : null]}
      testID={`expo-numerator-phone-country-${country.region}`}
    >
      <View style={styles.countryText}>
        <Text
          style={[
            styles.countryName,
            selected ? styles.countryNameSelected : null,
          ]}
        >
          {country.localizedName}
        </Text>
        <Text
          style={[
            styles.countryDetail,
            selected ? styles.countryDetailSelected : null,
          ]}
        >
          {country.region}
        </Text>
      </View>
      <Text
        style={[styles.callingCode, selected ? styles.callingCodeSelected : null]}
      >
        {`+${country.countryCallingCode}`}
      </Text>
    </Pressable>
  );
}

function filterCountries(
  countries: readonly PhoneCountryMeta[],
  query: string,
): PhoneCountryMeta[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return [...countries];
  }

  return countries.filter((country) =>
    [
      country.region,
      country.name,
      country.localizedName,
      `+${country.countryCallingCode}`,
    ]
      .join(" ")
      .toLocaleLowerCase()
      .includes(normalizedQuery),
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F7FA",
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  header: {
    gap: 12,
    maxWidth: 560,
    width: "100%",
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  titleText: {
    flex: 1,
  },
  title: {
    color: "#102A43",
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    color: "#627D98",
    fontSize: 13,
    fontWeight: "700",
  },
  doneButton: {
    alignItems: "center",
    backgroundColor: "#E6F6FF",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: 12,
  },
  doneButtonText: {
    color: "#0B6E99",
    fontSize: 14,
    fontWeight: "900",
  },
  selectedBlock: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D8DEE8",
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  selectedLabel: {
    color: "#627D98",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  selectedValue: {
    color: "#102A43",
    flexShrink: 1,
    fontSize: 18,
    fontWeight: "800",
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D8DEE8",
    borderRadius: 8,
    borderWidth: 1,
    color: "#102A43",
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  list: {
    gap: 8,
    maxWidth: 560,
    width: "100%",
  },
  countryRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D8DEE8",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: "100%",
  },
  countryRowSelected: {
    backgroundColor: "#102A43",
    borderColor: "#102A43",
  },
  countryText: {
    flex: 1,
    gap: 2,
  },
  countryName: {
    color: "#102A43",
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "800",
  },
  countryNameSelected: {
    color: "#FFFFFF",
  },
  countryDetail: {
    color: "#627D98",
    fontSize: 12,
    fontWeight: "700",
  },
  countryDetailSelected: {
    color: "#D9E2EC",
  },
  callingCode: {
    color: "#0B6E99",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right",
  },
  callingCodeSelected: {
    color: "#FFFFFF",
  },
  emptyText: {
    color: "#627D98",
    fontSize: 14,
    fontWeight: "700",
    paddingVertical: 24,
    textAlign: "center",
    width: "100%",
  },
});
