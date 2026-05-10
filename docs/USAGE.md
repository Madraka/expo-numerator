# Usage Guide

This guide shows the recommended consumer paths for common application
workflows.

## Install

For Expo apps, use Expo CLI so dependency installation follows Expo's package
manager and compatibility workflow:

```sh
npx expo install expo-numerator
```

For non-Expo npm workflows:

```sh
npm install expo-numerator
```

## Locale-Bound Application Facade

```ts
import { createNumerator } from "expo-numerator";

const n = createNumerator({ locale: "tr-TR" });

const display = n.money.format("1234.56", "TRY");
const parsed = n.money.safeParse(display, "TRY");

if (parsed.ok) {
  parsed.value.amount; // "1234.56"
}
```

Use the facade when a screen or application should consistently apply one
locale.

## Form-Safe Parsing

```ts
const result = n.decimal.safeParse("1.234,56");

if (!result.ok) {
  result.error.code;
}
```

Prefer safe parse APIs for text input, paste handling, API payloads, and
background imports. Throwing parse APIs are best for trusted data where a thrown
error should stop the flow.

## Money Storage Boundary

```ts
const amount = n.money.create("12.34", "USD");
const minor = n.money.toMinorUnits(amount.amount, amount.currency);
const restored = n.money.fromMinorUnits(minor, amount.currency);
```

Store money as either canonical decimal strings plus currency or as integer
minor units. Avoid JavaScript floats for money boundaries.

## Money Input Modes

```tsx
import { MoneyInput } from "expo-numerator";

<MoneyInput locale="tr-TR" currency="TRY" entryMode="plain" />;
<MoneyInput locale="tr-TR" currency="TRY" entryMode="liveGroupedEndLocked" />;
<MoneyInput locale="tr-TR" currency="TRY" entryMode="minorUnits" />;
<MoneyInput locale="tr-TR" currency="TRY" entryMode="integerMajor" />;
```

Choose by product behavior:

- `plain`: users can edit text like a calculator.
- `liveGroupedEndLocked`: users type major units and grouping appears while
  typing.
- `minorUnits`: every digit enters the smallest unit, for example
  `2648 -> 26.48`.
- `integerMajor`: users type only major units, and fraction digits are added on
  blur.

## Percent Input

```tsx
import { PercentInput } from "expo-numerator";

<PercentInput
  locale="tr-TR"
  onValueChange={(value) => {
    value?.kind === "percent" ? value.value : null;
  }}
/>;
```

Percent values are stored as ratios. For example, `12.5%` is represented as
`"0.125"`.

## Unit Display and Conversion

```ts
const distance = n.unit.create("1500", "meter");

n.unit.format(distance); // "1.500 m" in tr-TR
n.unit.formatBestFit(distance, { scale: 1 }); // "1,5 km"
n.unit.convert(distance, "kilometer", { scale: 2 }).value; // "1.50"
n.unit.convertForLocale(n.unit.create("1", "bar"), {
  locale: "en-US",
  scale: 4,
});
```

Use canonical units for storage and convert only at display or input boundaries.
Do not edit the `dimension` field manually; unit helpers validate it against the
registered unit code before formatting or converting values.

## Phone Input and Storage

```tsx
import { PhoneInput, parsePhone, formatPhone } from "expo-numerator/phone";

const value = parsePhone("0501 234 56 78", { defaultRegion: "TR" });

value.e164; // "+905012345678"
formatPhone(value, { format: "rfc3966" }); // "tel:+905012345678"

<PhoneInput
  defaultRegion="TR"
  metadataProfile="mobile"
  validationMode="mobile"
  onValueChange={(phoneValue) => {
    phoneValue?.kind === "phone" ? phoneValue.e164 : null;
  }}
/>;
```

Store phone numbers in E.164. Use national or international formatting only for
display. Phone formatting is region-based, while locale affects country picker
labels. `getPhoneMetadataInfo("lite" | "mobile" | "max")` exposes the ITU E.164
and libphonenumber source snapshot plus profile size hints. Use `max` when you
need stricter type/format parity; keep `lite` or `mobile` for default app input.

Phone verification helpers only model the client-side state, OTP entry, and
server contract:

```tsx
import { PhoneOtpInput, usePhoneVerification } from "expo-numerator/phone";

const verification = n.phone.verification.create({
  phone: "+905012345678",
  channel: "sms",
  purpose: "signUp",
});
const request = n.phone.verification.startRequest(verification);
const sent = n.phone.verification.started(verification, {
  sessionId: "ver_123",
  maskedDestination: "+905*******78",
  attemptsRemaining: 3,
  sendsRemaining: 2,
});
const withCode = n.phone.verification.code(sent, "123456");
const checkRequest = n.phone.verification.checkRequest(withCode, {
  idempotencyKey: "check-ver_123",
  rateLimitKey: "session:ver_123",
  rateLimitScope: {
    userId: "user_123",
    deviceId: "device_123",
  },
});
const resendRequest = n.phone.verification.resendRequest(sent, {
  idempotencyKey: "resend-ver_123",
  rateLimitKey: "phone:+905012345678",
});

function OtpStep() {
  const otp = usePhoneVerification({
    phone: "+905012345678",
    channel: "sms",
    purpose: "signUp",
  });

  return (
    <PhoneOtpInput
      verificationState={otp}
      onVerificationStateChange={(state) => otp.setCode(state.code)}
      onComplete={(code) => {
        code; // send with your backend verification session id
      }}
    />
  );
}
```

Send `request`, `checkRequest`, and `resendRequest` to your backend. Use
`PhoneOtpInput` when you want a styles-free React Native OTP field, or
`usePhoneVerification().inputProps` when composing your own input. OTP
generation, one-time replay protection, delivery provider credentials,
fraud/rate limits, and ownership binding must stay server-side. The backend
should return only non-secret verification state such as `sessionId`,
`maskedDestination`, expiry, resend cooldown, and remaining attempt counters.
Use `idempotencyKey`, `rateLimitKey`, and `rateLimitScope` to connect the client
contract to provider or backend throttling without putting secrets in the app.
OTP length defaults to a six-digit minimum. Set
`policy: { allowShortCode: true, codeLength: 4 }` only for low-assurance or
provider-compatibility flows; keep MFA, recovery, and phone-change verification
on six or more digits.

## Digit Normalization

```ts
n.locales.normalizeDigits("١٢٣"); // "123"
```

Digit normalization is useful before validation when users paste non-Latin
numbering systems.

## Focused Imports

```ts
import { addDecimal } from "expo-numerator/core";
import { formatNumber } from "expo-numerator/format";
import { parsePhone } from "expo-numerator/phone";
import { safeParseNumber } from "expo-numerator/parse";
```

Use subpaths for libraries or shared modules that only need one domain.
