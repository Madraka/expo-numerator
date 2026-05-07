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
n.unit.convertForLocale(n.unit.create("1", "bar"), { locale: "en-US", scale: 4 });
```

Use canonical units for storage and convert only at display or input boundaries.

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
import { safeParseNumber } from "expo-numerator/parse";
```

Use subpaths for libraries or shared modules that only need one domain.
