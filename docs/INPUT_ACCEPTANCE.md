# Input Acceptance

The React Native input surface is split into a pure state engine, a hook, and a
styles-free component. Device tests should target the same behavior that the
pure acceptance matrix verifies.

## Public Contract

- `applyNumberInputText` applies a full controlled text value when the caller
  knows the desired selection.
- `applyNumberInputEdit` applies an explicit replacement range.
- `applyNumberInputNativeTextChange` infers the replacement range from a native
  `TextInput.onChangeText` value, so mid-string insertions and deletions do not
  automatically collapse the caret to the end.
- `useNumberInput` uses native text-change inference when selection is not
  provided and keeps explicit `setText(text, selection)` available for test and
  custom input adapters.
- `MoneyInput`, `PercentInput`, `IntegerInput`, and `UnitInput` are ready-made
  wrappers over the same styles-free `NumberInput` engine. They apply the
  registry-backed profile defaults while preserving caller control over React
  Native `TextInput` props.
- `mode: "decimal" | "money" | "percent" | "unit"` changes the emitted value
  kind while keeping the editable text numeric and caret-stable.
- `defaultValue` seeds uncontrolled input state, `value` enables controlled
  state synchronization, and legacy `initialValue` remains supported.
- `focus`, `blur`, `commit`, and `reset` expose lifecycle state through
  `isFocused`, `isDirty`, and `committedValue` without forcing consumers into a
  package-owned form abstraction.
- `formatWhileEditing` enables banking-style live grouping while preserving the
  caret across inserted group separators. The default remains plain editable
  text with optional `formatOnBlur` for calculator, POS, and low-friction entry
  flows.
- Money input profiles expose `entryMode: "plain" | "liveGroupedEndLocked" |
  "minorUnits" | "integerMajor"`. The locked modes keep the React Native caret
  at the end to avoid stale native selection events corrupting financial input.

## Example App Selectors

The example app uses Expo Router and is split into route-level pages:

- `/`
- `/values`
- `/currency`
- `/units`
- `/locale`
- `/rounding`
- `/format`
- `/parse`
- `/errors`
- `/input`
- `/phone`
- `/expo`
- `/package`
- `/hardening`

It exposes stable navigation selectors for simulator/device smoke tests:

- `expo-numerator-page-overview`
- `expo-numerator-page-values`
- `expo-numerator-page-currency`
- `expo-numerator-page-units`
- `expo-numerator-page-locale`
- `expo-numerator-page-rounding`
- `expo-numerator-page-format`
- `expo-numerator-page-parse`
- `expo-numerator-page-errors`
- `expo-numerator-page-input`
- `expo-numerator-page-phone`
- `expo-numerator-page-expo`
- `expo-numerator-page-package`
- `expo-numerator-page-hardening`

It also exposes stable screen-loaded selectors:

- `expo-numerator-screen-overview`
- `expo-numerator-screen-values`
- `expo-numerator-screen-currency`
- `expo-numerator-screen-units`
- `expo-numerator-screen-locale`
- `expo-numerator-screen-rounding`
- `expo-numerator-screen-format`
- `expo-numerator-screen-parse`
- `expo-numerator-screen-errors`
- `expo-numerator-screen-input`
- `expo-numerator-screen-phone`
- `expo-numerator-screen-expo`
- `expo-numerator-screen-package`
- `expo-numerator-screen-hardening`

The static showcase contract can be checked without a simulator:

```sh
npm run showcase:contract
```

That check keeps the route manifest, Expo Router files, Stack screens, screen
selectors, Input Lab selectors, Currency Lab selectors, and this selector
documentation aligned.

The Input Lab keeps additional selectors for caret and lifecycle smoke tests:

- `expo-numerator-lifecycle-input`
- `expo-numerator-percent-input`
- `expo-numerator-unit-input`
- `expo-numerator-integer-input`
- `expo-numerator-amount-input`
- `expo-numerator-amount-parsed`
- `expo-numerator-amount-state`

The Currency page keeps additional selectors for registry filtering smoke tests:

- `expo-numerator-currency-search`
- `expo-numerator-currency-filter-all`
- `expo-numerator-currency-filter-zero`
- `expo-numerator-currency-filter-three`
- `expo-numerator-currency-filter-four`

The Phone page keeps additional selectors for mobile-first phone input and the
Expo Router native country picker sheet smoke tests:

- `expo-numerator-phone-input`
- `expo-numerator-phone-parsed`
- `expo-numerator-phone-state`
- `expo-numerator-phone-otp-input`
- `expo-numerator-phone-otp-start`
- `expo-numerator-phone-otp-submit`
- `expo-numerator-phone-otp-resend`
- `expo-numerator-phone-otp-state`
- `expo-numerator-phone-otp-request`
- `expo-numerator-phone-otp-check-request`
- `expo-numerator-phone-otp-resend-request`
- `expo-numerator-phone-otp-provider-contract`
- `expo-numerator-phone-profile-switch`
- `expo-numerator-phone-profile-max`
- `expo-numerator-phone-asyoutype`
- `expo-numerator-phone-type-table`
- `expo-numerator-phone-country-open`
- `expo-numerator-phone-country-sheet`
- `expo-numerator-phone-country-search`
- `expo-numerator-phone-country-picker`
- `expo-numerator-phone-country-preview-TR`

## Replay Smoke

Run the CI-safe replay smoke after build:

```sh
npm run input:replay
```

For device automation fixtures, emit the same scenario contract as JSON:

```sh
npm run build
node scripts/input-replay-smoke.js --json
```

The JSON output includes selectors, ordered native text-change steps, input
profile metadata, and expected text/value/selection states. The replay gate
covers caret edits plus money, percent, integer, and unit input profiles against
the built package. Detox, Maestro, Appium, or other device suites should replay
those same steps against the example app selectors.

## Manual Device Matrix

Run the example app on iOS and Android and verify:

- Type `1234,56` in `tr-TR`; parsed output is `1234.56`.
- Move the caret before the decimal separator and type `9`; the caret stays
  after the inserted digit.
- Paste `1.234,56`; text is sanitized to editable locale text and parsed output
  remains `1234.56`.
- Enable `formatWhileEditing` with `useGrouping`; typing `1234567,8` in
  `tr-TR` displays `1.234.567,8` while the emitted money amount remains
  `1234567.8`.
- With the default plain-editing model, typing the same value stays ungrouped
  until blur when `formatOnBlur` is enabled.
- `entryMode="liveGroupedEndLocked"` keeps `2648` as `2.648` while typing and
  prevents the caret from moving back into the final group.
- `entryMode="minorUnits"` treats digits as minor units: `2648` emits `26.48`
  for a two-minor currency and displays `26,48` in `tr-TR`.
- `entryMode="integerMajor"` treats digits as major units: `2648` emits `2648`
  and displays `2.648,00` after blur for TRY-style two-minor currencies.
- Select an integer/fraction range and replace it; the caret collapses at the
  replacement boundary.
- Blur the field with `maximumFractionDigits={2}`; formatting remains stable.
- Money mode with `currency="TRY"` emits `{ kind: "money", amount, currency }`.
- Money input profiles can be generated with
  `createMoneyInputOptions(currencyCode)` so apps reuse registry-backed
  fraction defaults, zero-minor decimal constraints, and blur formatting.
- `MoneyInput` applies the same money profile directly for the common form-field
  path while keeping `NumberInput` available for custom adapters.
- Percent mode treats external values as semantic percentages; `0.125` displays
  as `12.5` and typed `12.5` emits `{ kind: "percent", value: "0.125" }`.
- Percent input profiles can be generated with `createPercentInputOptions()` so
  apps reuse semantic ratio input behavior and blur-format defaults.
- `PercentInput` applies the same semantic ratio profile directly for common
  percentage fields.
- Integer input profiles can be generated with `createIntegerInputOptions()` so
  apps reuse decimal-disabled constraints without redefining the decimal mode.
- `IntegerInput` applies the same decimal-disabled profile directly for common
  count and quantity fields.
- Unit mode emits `{ kind: "unit", value, unit }` without mixing the unit label
  into editable text.
- Unit input profiles can be generated with `createUnitInputOptions(unitCode)`
  so apps reuse registry-backed fraction defaults and canonical unit codes.
- `UnitInput` applies the same canonical unit profile directly for common
  measurement fields.
- Locale display preferences remain separate from editable text. Convert stored
  values for display with `convertUnitForLocale(value, { locale })`, then pass
  the selected canonical unit into `createUnitInputOptions` when editing that
  displayed unit.
- Pure display surfaces can use `formatUnitForLocale(value, { locale })` when
  they do not need to retain the converted `UnitValue`.
- Best-fit display scaling is separate from editable input state. Use
  `convertUnitToBestFit` or `formatUnitBestFit` for read-only presentation, then
  create an explicit input profile for the chosen unit when the value becomes
  editable.
- Integer-constrained mode strips decimal separators and minus signs when
  `allowDecimal={false}` and `allowNegative={false}`.
- The Phone page OTP demo keeps the client contract limited to start, check,
  and resend payloads with E.164 destination, channel, purpose, locale,
  metadata profile, session id, idempotency key, rate-limit scope, masked
  destination, expiry, and counters.
- OTP entry defaults to six or more digits. Four-digit entry is available only
  through explicit `allowShortCode` policy opt-in for low-assurance or provider
  compatibility flows.
- OTP secrets, delivery provider credentials, fraud/rate limits, and user
  ownership binding stay outside the client package and must be verified on the
  application backend.

The pure Jest matrix covers the same scenarios through
`applyNumberInputEdit`, `applyNumberInputText`, and
`applyNumberInputNativeTextChange`; device suites should replay these same
fixtures through the selectors above.
