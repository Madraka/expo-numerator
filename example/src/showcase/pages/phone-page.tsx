import {
  applyPhoneInputText,
  createPhoneInputState,
  formatPhone,
  getPhoneCountries,
  getPhoneCountryMeta,
  getPhoneExampleNumber,
  getPhoneMetadataInfo,
  parsePhone,
  safeParsePhone,
  PhoneInput,
  type PhoneMetadataProfile,
  type PhoneValue,
  type PhoneInputState,
} from "expo-numerator";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  DataLine,
  DataTable,
  PageScaffold,
  Section,
  showcaseStyles,
} from "../components";
import { useShowcase } from "../provider";
import { getDefaultPhoneRegion } from "./phone-utils";

export function PhonePage() {
  const { numerator, phoneRegion, setPhoneRegion } = useShowcase();
  const defaultRegion = getDefaultPhoneRegion(numerator.locale);
  const [metadataProfile, setMetadataProfile] =
    useState<PhoneMetadataProfile>("lite");
  const [phoneValue, setPhoneValue] = useState<string | null>(null);
  const [phoneState, setPhoneState] = useState<PhoneInputState | null>(null);
  const activeRegion = phoneRegion ?? defaultRegion;
  const activeCountry = getPhoneCountryMeta(activeRegion, {
    locale: numerator.locale,
  });
  const parsed = getPhoneShowcaseExample(activeRegion, metadataProfile);
  const metadataInfo = getPhoneMetadataInfo(metadataProfile);
  const nationalExample = formatPhone(parsed, {
    format: "national",
    metadataProfile,
    region: activeRegion,
  });
  const asYouTypeRows = useMemo(
    () => getAsYouTypeRows(activeRegion, metadataProfile),
    [activeRegion, metadataProfile]
  );
  const typeRows = useMemo(
    () => getTypeRows(activeRegion, metadataProfile),
    [activeRegion, metadataProfile]
  );
  const countries = useMemo(
    () =>
      getPhoneCountries({
        locale: numerator.locale,
        preferredRegions: [defaultRegion, "US", "GB"],
      }).slice(0, 6),
    [defaultRegion, numerator.locale]
  );

  return (
    <PageScaffold
      pageId="phone"
      title="Phone"
      caption="E.164 storage, mobile-first validation, country metadata, and styles-free React Native input."
    >
      <Section title="Canonical formats">
        <View
          style={styles.profileTabs}
          testID="expo-numerator-phone-profile-switch"
        >
          {(["lite", "mobile", "max"] as const).map((profile) => (
            <Pressable
              key={profile}
              accessibilityRole="button"
              onPress={() => setMetadataProfile(profile)}
              style={[
                styles.profileTab,
                metadataProfile === profile ? styles.profileTabActive : null,
              ]}
              testID={
                profile === "max"
                  ? "expo-numerator-phone-profile-max"
                  : `expo-numerator-phone-profile-${profile}`
              }
            >
              <Text
                style={[
                  styles.profileTabText,
                  metadataProfile === profile
                    ? styles.profileTabTextActive
                    : null,
                ]}
              >
                {profile}
              </Text>
            </Pressable>
          ))}
        </View>
        <DataTable
          rows={[
            ["input", nationalExample],
            ["region", activeRegion],
            ["metadata profile", metadataInfo.profile],
            [
              "size hint",
              `${Math.round(metadataInfo.sizeHintBytes / 1024)} KB`,
            ],
            ["E.164", parsed.e164],
            ["national", nationalExample],
            [
              "international",
              formatPhone(parsed, {
                format: "international",
                metadataProfile,
                region: activeRegion,
              }),
            ],
            ["RFC3966", formatPhone(parsed, { format: "rfc3966" })],
            ["type", parsed.type ?? "unknown"],
          ]}
        />
      </Section>

      <Section title="Mobile-first input">
        <PhoneInput
          key={`phone-${activeRegion}`}
          defaultRegion={activeRegion}
          metadataProfile={metadataProfile}
          onInputStateChange={setPhoneState}
          onValueChange={(value) => setPhoneValue(value?.e164 ?? null)}
          placeholder={nationalExample}
          style={showcaseStyles.input}
          testID="expo-numerator-phone-input"
          validationMode="mobile"
        />
        <DataLine testID="expo-numerator-phone-parsed">
          {`e164=${phoneValue ?? "empty"}`}
        </DataLine>
        <DataLine testID="expo-numerator-phone-state">
          {`text=${phoneState?.text ?? ""} valid=${
            phoneState?.isValid ?? true
          } country=${phoneState?.country ?? activeRegion}`}
        </DataLine>
      </Section>

      <Section title="As-you-type parity">
        <DataTable rows={asYouTypeRows} />
        <DataLine testID="expo-numerator-phone-asyoutype">
          {asYouTypeRows.map((row) => row[1]).join(" -> ")}
        </DataLine>
      </Section>

      <Section title="Type detection">
        <DataTable rows={typeRows} />
        <DataLine testID="expo-numerator-phone-type-table">
          {typeRows.map((row) => `${row[0]}=${row[1]}`).join(" | ")}
        </DataLine>
      </Section>

      <Section title="Country picker">
        <Link href="/phone-country-picker" asChild>
          <Pressable
            accessibilityRole="button"
            style={styles.sheetButton}
            testID="expo-numerator-phone-country-open"
          >
            <View>
              <Text style={styles.sheetButtonLabel}>Selected country</Text>
              <Text style={styles.sheetButtonValue}>
                {`${activeCountry.localizedName} +${activeCountry.countryCallingCode}`}
              </Text>
            </View>
            <Text style={styles.sheetButtonIcon}>Change</Text>
          </Pressable>
        </Link>
        <View style={styles.countryPreview}>
          {countries.map((country) => (
            <Pressable
              key={`${country.region}-${country.countryCallingCode}`}
              accessibilityRole="button"
              onPress={() => setPhoneRegion(country.region)}
              style={[
                styles.countryButton,
                country.region === activeRegion
                  ? styles.countryButtonActive
                  : null,
              ]}
              testID={`expo-numerator-phone-country-preview-${country.region}`}
            >
              <Text
                style={[
                  styles.countryButtonText,
                  country.region === activeRegion
                    ? styles.countryButtonTextActive
                    : null,
                ]}
              >
                {`${country.localizedName} +${country.countryCallingCode}`}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="Validation policy">
        <DataTable
          rows={[
            [
              "possible landline",
              String(
                numerator.phone.safeParse("02123456789", {
                  defaultRegion: "TR",
                  validationMode: "possible",
                }).ok
              ),
            ],
            [
              "mobile default",
              String(
                numerator.phone.safeParse("05012345678", {
                  defaultRegion: "TR",
                }).ok
              ),
            ],
            [
              "mobile rejects landline",
              String(
                numerator.phone.safeParse("02123456789", {
                  defaultRegion: "TR",
                }).ok
              ),
            ],
            ["NANP ambiguity", getNanpAmbiguityRegions()],
            [
              "non-geographic hidden",
              String(
                getPhoneCountries().some((country) => country.region === "001")
              ),
            ],
          ]}
        />
      </Section>
    </PageScaffold>
  );
}

function getPhoneShowcaseExample(
  region: string,
  metadataProfile: PhoneMetadataProfile
): PhoneValue {
  const result = safeParsePhone(getPhoneExampleNumber(region), {
    metadataProfile,
    validationMode: "possible",
  });

  if (result.ok) {
    return result.value;
  }

  return parsePhone("+12015550123");
}

function getAsYouTypeRows(
  region: string,
  metadataProfile: PhoneMetadataProfile
): Array<[string, string]> {
  const options = {
    defaultRegion: region,
    metadataProfile,
  };
  const example = safeParsePhone(getPhoneExampleNumber(region), {
    metadataProfile,
    validationMode: "possible",
  });
  const digits = example.ok ? example.value.nationalNumber : "";
  let state = createPhoneInputState(options);

  return digits
    .slice(0, 8)
    .split("")
    .map((digit, index) => {
      const raw =
        state.text.slice(0, state.selection.start) +
        digit +
        state.text.slice(state.selection.end);
      state = applyPhoneInputText(
        state,
        raw,
        { start: state.selection.start + 1, end: state.selection.start + 1 },
        options
      );

      return [`${index + 1}`, state.text || digit];
    });
}

function getTypeRows(
  region: string,
  metadataProfile: PhoneMetadataProfile
): Array<[string, string]> {
  return (["mobile", "fixedLine", "tollFree"] as const).map((type) => {
    const result = safeParsePhone(getPhoneExampleNumber(region, { type }), {
      metadataProfile,
      validationMode: "strict",
    });

    return [type, result.ok ? result.value.type ?? "unknown" : "unavailable"];
  });
}

function getNanpAmbiguityRegions(): string {
  const result = safeParsePhone("+12015550123", {
    validationMode: "possible",
  });

  return result.ok ? result.value.possibleRegions.join(", ") : "unavailable";
}

const styles = StyleSheet.create({
  sheetButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D8DEE8",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  sheetButtonLabel: {
    color: "#627D98",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  sheetButtonValue: {
    color: "#102A43",
    fontSize: 16,
    fontWeight: "800",
  },
  sheetButtonIcon: {
    color: "#0B6E99",
    fontSize: 14,
    fontWeight: "800",
  },
  countryPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  profileTabs: {
    flexDirection: "row",
    gap: 8,
  },
  profileTab: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D8DEE8",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 9,
  },
  profileTabActive: {
    backgroundColor: "#0B6E99",
    borderColor: "#0B6E99",
  },
  profileTabText: {
    color: "#243B53",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  profileTabTextActive: {
    color: "#FFFFFF",
  },
  countryButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D8DEE8",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  countryButtonActive: {
    backgroundColor: "#102A43",
    borderColor: "#102A43",
  },
  countryButtonText: {
    color: "#243B53",
    fontSize: 13,
    fontWeight: "700",
  },
  countryButtonTextActive: {
    color: "#FFFFFF",
  },
});
