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
  PhoneOtpInput,
  usePhoneVerification,
  type PhoneMetadataProfile,
  type PhoneInputState,
  type PhoneVerificationCheckRequest,
  type PhoneVerificationResendRequest,
  type PhoneVerificationStartRequest,
  type PhoneValue,
} from "expo-numerator";
import { Link } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

const DEMO_OTP_CODE = "123456";
const OTP_POLICY = {
  codeLength: 6,
  expiresInMs: 2 * 60 * 1000,
  maxAttempts: 3,
  maxSends: 3,
  resendDelayMs: 5 * 1000,
} as const;

export function PhonePage() {
  const { numerator, phoneRegion, setPhoneRegion } = useShowcase();
  const defaultRegion = getDefaultPhoneRegion(numerator.locale);
  const [metadataProfile, setMetadataProfile] =
    useState<PhoneMetadataProfile>("lite");
  const [phoneValue, setPhoneValue] = useState<string | null>(null);
  const [phoneState, setPhoneState] = useState<PhoneInputState | null>(null);
  const [verificationRequest, setVerificationRequest] =
    useState<PhoneVerificationStartRequest | null>(null);
  const [verificationCheckRequest, setVerificationCheckRequest] =
    useState<PhoneVerificationCheckRequest | null>(null);
  const [verificationResendRequest, setVerificationResendRequest] =
    useState<PhoneVerificationResendRequest | null>(null);
  const [verificationEvent, setVerificationEvent] = useState("ready");
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
    [activeRegion, metadataProfile],
  );
  const typeRows = useMemo(
    () => getTypeRows(activeRegion, metadataProfile),
    [activeRegion, metadataProfile],
  );
  const verificationOptions = useMemo(
    () => ({
      phone: parsed,
      channel: "sms" as const,
      defaultRegion: activeRegion,
      metadataProfile,
      policy: OTP_POLICY,
      purpose: "signUp" as const,
    }),
    [activeRegion, metadataProfile, parsed.e164],
  );
  const verification = usePhoneVerification(verificationOptions);
  const countries = useMemo(
    () =>
      getPhoneCountries({
        locale: numerator.locale,
        preferredRegions: [defaultRegion, "US", "GB"],
      }).slice(0, 6),
    [defaultRegion, numerator.locale],
  );

  useEffect(() => {
    verification.reset(verificationOptions);
    setVerificationRequest(null);
    setVerificationCheckRequest(null);
    setVerificationResendRequest(null);
    setVerificationEvent("ready");
  }, [verification.reset, verificationOptions]);

  const startVerification = () => {
    const request = verification.createStartRequest({
      locale: numerator.locale,
      metadataProfile,
      idempotencyKey: `start-${parsed.e164}`,
      rateLimitKey: `phone:${parsed.e164}`,
      rateLimitScope: {
        deviceId: "example-device",
        userAgent: "expo-numerator-showcase",
      },
      clientContext: {
        route: "/phone",
        sdk: "expo",
      },
    });

    setVerificationRequest(request);
    setVerificationCheckRequest(null);
    setVerificationResendRequest(null);
    verification.markSending();
    verification.applyStart(
      {
        sessionId: `demo-${request.phoneE164.slice(-4)}`,
        maskedDestination: verification.maskedDestination ?? undefined,
        attemptsRemaining: OTP_POLICY.maxAttempts,
        sendsRemaining: OTP_POLICY.maxSends - 1,
      },
      { policy: OTP_POLICY },
    );
    setVerificationEvent("sent");
  };

  const submitVerification = () => {
    if (!verification.canSubmit) {
      verification.markChecking();
      setVerificationEvent("code_required");
      return;
    }

    const checkRequest = verification.createCheckRequest({
      idempotencyKey: `check-${verification.sessionId}`,
      rateLimitKey: `session:${verification.sessionId}`,
      rateLimitScope: {
        deviceId: "example-device",
        userAgent: "expo-numerator-showcase",
      },
    });

    setVerificationCheckRequest(checkRequest);
    verification.markChecking();
    verification.applyCheck(
      verification.code === DEMO_OTP_CODE
        ? {
            status: "verified",
            attemptsRemaining: verification.attemptsRemaining ?? undefined,
          }
        : {
            status: "invalid",
            attemptsRemaining: Math.max(
              0,
              (verification.attemptsRemaining ?? OTP_POLICY.maxAttempts) - 1,
            ),
          }
    );
    setVerificationEvent(
      verification.code === DEMO_OTP_CODE ? "verified" : "invalid_code",
    );
  };

  const resendVerification = () => {
    if (verification.sessionId === null) {
      setVerificationEvent("session_required");
      return;
    }

    const resendRequest = verification.createResendRequest({
      locale: numerator.locale,
      metadataProfile,
      idempotencyKey: `resend-${verification.sessionId}`,
      rateLimitKey: `resend:${verification.sessionId}`,
      rateLimitScope: {
        deviceId: "example-device",
        userAgent: "expo-numerator-showcase",
      },
    });

    setVerificationResendRequest(resendRequest);
    verification.applyResend(
      {
        sessionId: verification.sessionId ?? `demo-${parsed.e164.slice(-4)}`,
        maskedDestination: verification.maskedDestination ?? undefined,
        attemptsRemaining: OTP_POLICY.maxAttempts,
        sendsRemaining: Math.max(
          0,
          (verification.sendsRemaining ?? OTP_POLICY.maxSends) - 1,
        ),
      },
      { now: Date.now() + OTP_POLICY.resendDelayMs, policy: OTP_POLICY },
    );
    setVerificationEvent("resent");
  };

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

      <Section title="OTP verification">
        <PhoneOtpInput
          verificationState={verification}
          onComplete={() => setVerificationEvent("code_complete")}
          onVerificationStateChange={(state) =>
            verification.setCode(state.code)
          }
          placeholder={DEMO_OTP_CODE}
          style={showcaseStyles.input}
          testID="expo-numerator-phone-otp-input"
        />
        <View style={styles.otpActions}>
          <Pressable
            accessibilityRole="button"
            onPress={startVerification}
            style={styles.otpButton}
            testID="expo-numerator-phone-otp-start"
          >
            <Text style={styles.otpButtonText}>Start SMS</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={submitVerification}
            style={styles.otpButton}
            testID="expo-numerator-phone-otp-submit"
          >
            <Text style={styles.otpButtonText}>Check code</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={resendVerification}
            style={styles.otpButtonSecondary}
            testID="expo-numerator-phone-otp-resend"
          >
            <Text style={styles.otpButtonSecondaryText}>Resend</Text>
          </Pressable>
        </View>
        <DataTable
          rows={[
            ["demo code", DEMO_OTP_CODE],
            ["status", verification.status],
            ["session", verification.sessionId ?? "none"],
            ["masked destination", verification.maskedDestination ?? "none"],
            [
              "code length",
              `${verification.code.length}/${verification.codeLength}`,
            ],
            ["can submit", String(verification.canSubmit)],
            ["can resend", String(verification.canResend())],
            ["event", verificationEvent],
          ]}
        />
        <DataLine testID="expo-numerator-phone-otp-state">
          {`status=${verification.status} code=${verification.code.length}/${verification.codeLength} attempts=${verification.attemptsRemaining ?? "n/a"} sends=${verification.sendsRemaining ?? "n/a"}`}
        </DataLine>
        <DataLine testID="expo-numerator-phone-otp-request">
          {verificationRequest
            ? `start phoneE164=${verificationRequest.phoneE164} channel=${verificationRequest.channel} purpose=${verificationRequest.purpose} rate=${verificationRequest.rateLimitKey ?? "default"}`
            : "request=not sent"}
        </DataLine>
        <DataLine testID="expo-numerator-phone-otp-check-request">
          {verificationCheckRequest
            ? `check session=${verificationCheckRequest.sessionId} codeLength=${verificationCheckRequest.code.length} rate=${verificationCheckRequest.rateLimitKey ?? "default"}`
            : "check=not sent"}
        </DataLine>
        <DataLine testID="expo-numerator-phone-otp-resend-request">
          {verificationResendRequest
            ? `resend session=${verificationResendRequest.sessionId} channel=${verificationResendRequest.channel} rate=${verificationResendRequest.rateLimitKey ?? "default"}`
            : "resend=not sent"}
        </DataLine>
        <DataTable
          rows={[
            [
              "client sends",
              "start/check/resend request payloads with idempotency and rate-limit keys",
            ],
            [
              "server returns",
              "sessionId, maskedDestination, expiry, resend and attempt counters",
            ],
            [
              "server keeps",
              "OTP secret, provider credentials, rate limits, fraud rules, user binding",
            ],
            [
              "short code",
              "4 digits require allowShortCode; keep sensitive flows at 6+",
            ],
          ]}
        />
        <DataLine testID="expo-numerator-phone-otp-provider-contract">
          client=contract only | server=secret delivery ownership
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
                }).ok,
              ),
            ],
            [
              "mobile default",
              String(
                numerator.phone.safeParse("05012345678", {
                  defaultRegion: "TR",
                }).ok,
              ),
            ],
            [
              "mobile rejects landline",
              String(
                numerator.phone.safeParse("02123456789", {
                  defaultRegion: "TR",
                }).ok,
              ),
            ],
            ["NANP ambiguity", getNanpAmbiguityRegions()],
            [
              "non-geographic hidden",
              String(
                getPhoneCountries().some(
                  (country) => country.region === "001",
                ),
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
  otpActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  otpButton: {
    backgroundColor: "#102A43",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  otpButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  otpButtonSecondary: {
    backgroundColor: "#E9F2FF",
    borderColor: "#A8CBFF",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  otpButtonSecondaryText: {
    color: "#154EB8",
    fontSize: 13,
    fontWeight: "900",
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
