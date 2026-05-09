# API Reference

`expo-numerator` exposes a root facade plus focused domain subpaths. All
numeric value APIs are string-first and avoid silent JavaScript floating-point
conversion.

## Root Facade

Use `createNumerator` for application-level workflows where one locale should
flow through formatting, parsing, and input options.

```ts
import { createNumerator } from "expo-numerator";

const n = createNumerator({ locale: "tr-TR" });

n.decimal.format("1234.56");
n.money.format("1234.56", "TRY");
n.percent.format("0.125");
n.unit.formatBestFit("1500", "meter", { scale: 1 });
```

Facade domains:

- `decimal`: create, safe, normalize, compare, scale, round, arithmetic,
  format, parse, safeParse, input.
- `money`: create, safe, format, parse, safeParse, input, minor units,
  allocation, registry helpers.
- `percent`: create, safe, format, parse, safeParse, input.
- `unit`: create, safe, format, formatForLocale, formatBestFit, parse,
  safeParse, conversion, registry helpers.
- `phone`: create, format, parse, safeParse, input, country metadata, examples,
  and provider-independent verification state.
- `input`: state helpers and decimal, money, percent, integer, unit option
  factories.
- `locales`: resolve, symbols, digit normalization.

## Value Constructors

```ts
import { decimal, money, percent, unit } from "expo-numerator";

decimal("001.230").value; // "1.230"
money("12.30", "USD").currency; // "USD"
percent("0.125").value; // "0.125"
unit("1500", "meter").unit; // "meter"
```

Use safe constructors when invalid user input should be returned as a value:

```ts
import { safeMoney } from "expo-numerator";

const result = safeMoney("12.30", "TRY");

if (result.ok) {
  result.value.amount;
} else {
  result.error.code;
}
```

## Decimal and Rounding

```ts
import {
  addDecimal,
  compareDecimal,
  divideDecimal,
  multiplyDecimal,
  normalizeDecimal,
  roundDecimal,
  scaleDecimal,
  subtractDecimal,
} from "expo-numerator";

normalizeDecimal("00012.3400").value; // "12.3400"
compareDecimal("1.10", "1.1"); // 0
addDecimal("999.99", "0.01").value; // "1000.00"
subtractDecimal("1.20", "2.30").value; // "-1.10"
multiplyDecimal("12.30", "3.0").value; // "36.900"
divideDecimal("2", "3", { scale: 2 }).value; // "0.67"
roundDecimal("123.455", { scale: 2 }).value; // "123.46"
scaleDecimal("1.2", 4).value; // "1.2000"
```

Division requires an explicit scale so repeating decimals never hide rounding
policy.

## Money

```ts
import {
  allocateMoney,
  fromMinorUnits,
  getCurrencyMeta,
  money,
  toMinorUnits,
} from "expo-numerator/money";

const value = money("12.34", "USD");

toMinorUnits(value.amount, value.currency); // 1234n
fromMinorUnits(1234n, "USD").amount; // "12.34"
allocateMoney(money("0.10", "USD"), [1, 1, 1]).map((share) => share.amount);
getCurrencyMeta("JPY").minorUnit; // 0
```

Sub-minor money values are rejected by default. Choose an explicit rounding
policy when an application wants to round at the boundary.

## Locale, Format, and Parse

```ts
import { money, percent } from "expo-numerator";
import {
  formatMoney,
  formatNumber,
  formatPercent,
} from "expo-numerator/format";
import { safeParseMoney, safeParseNumber } from "expo-numerator/parse";

formatNumber("1234.56", { locale: "tr-TR" }); // "1.234,56"
formatMoney(money("1234.56", "TRY"), { locale: "tr-TR" });
formatPercent(percent("0.125"), { locale: "tr-TR" });

safeParseNumber("1.234,56", { locale: "tr-TR" }).ok; // true
safeParseMoney("₺1.234,56", { locale: "tr-TR", currency: "TRY" }).ok; // true
```

Strict parse mode validates locale grouping, separators, signs, currency, and
affixes. Loose mode is for copy-paste tolerance.

## Units

```ts
import {
  convertUnit,
  convertUnitForLocale,
  formatUnitBestFit,
  unit,
} from "expo-numerator";

convertUnit(unit("1", "kilometer"), "meter").value; // "1000"
formatUnitBestFit(unit("1500", "meter"), { scale: 1 }); // "1.5 km"
convertUnitForLocale(unit("1", "bar"), { locale: "en-US", scale: 4 }).unit;
```

The built-in unit registry covers length, area, volume, mass, speed,
acceleration, temperature, time, data, frequency, energy, power, pressure,
angle, force, torque, density, electric current, and electric potential.

## Phone

```tsx
import {
  formatPhone,
  getPhoneCountries,
  getPhoneExampleNumber,
  getPhoneMetadataInfo,
  parsePhone,
  safeParsePhone,
  PhoneOtpInput,
  createPhoneVerificationState,
  createPhoneVerificationCheckRequest,
  createPhoneVerificationResendRequest,
  createPhoneVerificationStartRequest,
  applyPhoneVerificationStart,
  setPhoneVerificationCode,
  canSubmitPhoneVerification,
  usePhoneVerification,
  type PhoneMetadataProfile,
} from "expo-numerator/phone";

const profile: PhoneMetadataProfile = "max";
const value = parsePhone("0501 234 56 78", {
  defaultRegion: "TR",
  metadataProfile: profile,
});

value.e164; // "+905012345678"
formatPhone(value, { format: "national", metadataProfile: profile }); // "0501 234 56 78"
formatPhone(value, { format: "rfc3966" }); // "tel:+905012345678"
safeParsePhone("+12015550123").ok; // true
getPhoneCountries({ preferredRegions: ["TR"], locale: "tr-TR" })[0].region;
getPhoneExampleNumber("US", { type: "tollFree" }); // "+18002345678"
getPhoneMetadataInfo("max").profile; // "max"

const verification = createPhoneVerificationState({
  phone: value,
  channel: "sms",
  purpose: "signUp",
});
createPhoneVerificationStartRequest(verification).phoneE164; // "+905012345678"
const sent = applyPhoneVerificationStart(verification, {
  sessionId: "ver_123",
});
const withCode = setPhoneVerificationCode(sent, "123456");
canSubmitPhoneVerification(withCode); // true
createPhoneVerificationCheckRequest(withCode).sessionId; // "ver_123"
createPhoneVerificationResendRequest(sent).phoneE164; // "+905012345678"

function OtpEntry() {
  const otp = usePhoneVerification({
    phone: value,
    channel: "sms",
    purpose: "signUp",
  });

  otp.createStartRequest({
    locale: "tr-TR",
    idempotencyKey: "start-123",
    rateLimitKey: "phone:+905012345678",
  }).phoneE164; // "+905012345678"

  return (
    <PhoneOtpInput
      phone={value}
      channel="sms"
      purpose="signUp"
      onComplete={(code, state) => {
        code; // "123456"
        state.sessionId; // backend-issued verification session id, when present
      }}
    />
  );
}
```

Phone values use E.164 as the canonical storage format. Calling-code and
territory metadata is generated from the ITU E.164-backed libphonenumber
metadata snapshot checked by `npm run phone:metadata`. The public
`metadataProfile` option accepts `"lite"`, `"mobile"`, or `"max"`; runtime stays
JS-only, while oracle packages are dev/test-only. Formatting follows the selected
phone region rather than the display locale; locale is used for country picker
labels. Default validation is mobile-first for sign-up and OTP flows, and
`validationMode: "possible"` is available for tolerant draft parsing.

Phone verification APIs are provider-independent state and contract helpers.
They do not send SMS, store OTP secrets, prove reachability, or prove account
ownership. Real OTP generation, provider credentials, rate limits, fraud
controls, audit logs, and user binding belong on the application backend.
`usePhoneVerification` and `PhoneOtpInput` are styles-free React Native
surfaces for OTP code entry; they normalize pasted digits and expose lifecycle
state without binding to any delivery provider. OTP policy is bounded toward
industry-safe client contracts: six digits by default, at most a 10-minute
validity window, resend delay floor, and failed-attempt counters that do not
exceed the NIST 100-attempt upper bound. Four-digit OTP is supported only with
`policy.allowShortCode: true` for low-assurance or provider-compatibility flows;
avoid short codes for MFA, account recovery, or phone-change ownership checks.
Request helpers support idempotency keys, rate-limit keys, scoped rate-limit
fields, and non-secret client context for backend/provider integrations.

## Input

```tsx
import {
  MoneyInput,
  NumberInput,
  createMoneyInputOptions,
  useNumberInput,
} from "expo-numerator/input";
import {
  PhoneCountryPicker,
  PhoneInput,
  PhoneOtpInput,
  usePhoneInput,
} from "expo-numerator/phone";

const options = createMoneyInputOptions("TRY", {
  locale: "tr-TR",
  entryMode: "liveGroupedEndLocked",
});

<MoneyInput locale="tr-TR" currency="TRY" entryMode="minorUnits" />;
<PhoneInput defaultRegion="TR" validationMode="mobile" />;
<PhoneOtpInput phone="+905012345678" channel="sms" purpose="signUp" />;
```

Money input entry modes:

- `plain`: calculator-style text editing.
- `liveGroupedEndLocked`: banking-style grouped major-unit entry.
- `minorUnits`: cent-first entry, for example `2648 -> 26.48`.
- `integerMajor`: major-unit-only entry with fraction digits on blur.

## Expo

```tsx
import { NumeratorProvider, useNumerator } from "expo-numerator";

function App() {
  return (
    <NumeratorProvider options={{ locale: "tr-TR" }}>
      <Amount />
    </NumeratorProvider>
  );
}

function Amount() {
  const n = useNumerator();
  return n.formatNumber("1234.56");
}
```

`createExpoNumerator` and `NumeratorProvider` work even when the optional native
module is unavailable.

## Public Subpaths

- `expo-numerator/core`
- `expo-numerator/money`
- `expo-numerator/rounding`
- `expo-numerator/locale`
- `expo-numerator/format`
- `expo-numerator/parse`
- `expo-numerator/unit`
- `expo-numerator/phone`
- `expo-numerator/input`
- `expo-numerator/expo`
