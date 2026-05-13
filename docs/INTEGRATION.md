# Expo and React Native Integration

This guide covers app integration patterns for Expo and React Native.

## Install in an Expo App

```sh
npx expo install expo-numerator
```

Expo CLI uses the package manager for the project and validates compatible
dependency versions for Expo/React Native projects.

## Expo Provider

```tsx
import { NumeratorProvider, useNumerator } from "expo-numerator";

export function App() {
  return (
    <NumeratorProvider options={{ locale: "tr-TR" }}>
      <AmountScreen />
    </NumeratorProvider>
  );
}

function AmountScreen() {
  const numerator = useNumerator();

  return numerator.formatNumber("1234.56");
}
```

Use the provider when a tree should share one locale and one Expo integration
surface.

## Device Locale

```ts
import { createExpoNumerator } from "expo-numerator/expo";

const numerator = createExpoNumerator({ useDeviceLocale: true });

numerator.locale;
numerator.localization.locale;
numerator.getNumberSeparators();
```

`expo-localization` is optional. If native localization is unavailable, the
package falls back without crashing the JS core.

## React Native Input

Ready-made fields are available for common forms:

```tsx
import { IntegerInput, MoneyInput, PercentInput, UnitInput } from "expo-numerator";

<MoneyInput locale="tr-TR" currency="TRY" entryMode="minorUnits" />;
<PercentInput locale="tr-TR" />;
<IntegerInput locale="tr-TR" allowNegative={false} />;
<UnitInput locale="tr-TR" unit="square-meter" />;
```

Use `NumberInput` or `useNumberInput` when an app needs custom adapters,
labels, validation UI, or design-system ownership.

```tsx
import { NumberInput } from "expo-numerator/input";

<NumberInput
  locale="tr-TR"
  mode="money"
  currency="TRY"
  maximumFractionDigits={2}
/>;
```

## Headless Input State

```ts
import {
  applyNumberInputNativeTextChange,
  createNumberInputState,
} from "expo-numerator/input";

const state = createNumberInputState({ locale: "tr-TR", mode: "decimal" });
const next = applyNumberInputNativeTextChange(state, "1.234,56");
```

Use the pure state helpers for deterministic form engines, tests, or custom
platform adapters.

## Example App

The bundled example app is an Expo Router showcase and manual test center. It
contains pages for values, currency, units, locale symbols, rounding, format,
parse, typed errors, input, Expo integration, package metadata, and hardening.

Run the example checks from the package root:

```sh
npm run example:install
npm run example:typecheck
npm run example:doctor
npm run example:expo-check
```

## Config Plugin

The package exposes a valid Expo config plugin entry. It is intentionally a
no-op today because the native module does not require permissions, plist
values, manifest entries, or Gradle settings.

```json
{
  "expo": {
    "plugins": ["expo-numerator"]
  }
}
```

Adding the plugin is safe for development builds and future native options.
Native module availability still comes from Expo autolinking during prebuild or
development-build compilation. Expo Go and unsupported runtimes keep using the
crash-safe JavaScript fallback path.
