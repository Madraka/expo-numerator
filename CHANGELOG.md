# Changelog

## Unpublished

### 🛠 Breaking changes

### 🎉 New features

### 🐛 Bug fixes

- Kept `minorUnits` money entry tied to the currency registry minor-unit scale
  even when display fraction options are overridden.
- Prevented unit input profiles from rendering whole measurement values as
  money-like fixed-decimal text, so area examples such as `1500 m²` stay `1500`
  instead of `1500,00`.
- Disabled decimal entry by default for unit profiles whose registry-backed
  fraction default is `0`, such as `byte`.
- Made money formatting use the currency registry minor unit by default instead
  of trusting a caller-supplied `MoneyValue.scale` field.
- Added a unit value integrity guard so formatting, conversion, locale
  preference, and best-fit helpers reject values whose `dimension` does not
  match the registered unit code.
- Kept invalid unit input configuration inside `NumberInputState` as a typed
  invalid state instead of allowing the error to escape the input boundary.
- Prevented typed external input values from being silently reinterpreted across
  explicit money currency, unit code, or mode boundaries.
- Revalidated controlled input state when semantic identity options change, so
  a stable `value` cannot leak across updated `currency`, `unit`, or `mode`
  props.
- Renormalized scientific and engineering notation after coefficient rounding,
  preventing outputs such as `10.0E2` or `1000E3`.

### 💡 Others

- Expanded input replay, value-format smoke, unit registry smoke, focused Jest
  and deterministic property coverage, plus public docs for money/unit input
  display policy, controlled input identity changes, scientific notation
  rollover, and unit value boundary hardening.

## 0.1.2 - 2026-05-10

### 🛠 Breaking changes

### 🎉 New features

- Added provider-independent phone verification state and server contract
  helpers for OTP flows without bundling SMS provider logic or credentials.
- Added styles-free `PhoneOtpInput` and `usePhoneVerification` surfaces for
  React Native OTP entry without coupling the package to an SMS provider.
- Expanded the `/phone` showcase with a simulated OTP verification flow,
  backend/provider contract table, and stable selectors for device smoke tests.
- Added provider-independent phone verification check/resend request helpers
  with idempotency, rate-limit keys, scoped rate-limit fields, and non-secret
  client context.
- Bounded phone verification policy values to safer OTP defaults, including a
  six-digit default minimum, explicit `allowShortCode` opt-in for four-digit
  compatibility flows, 10-minute maximum validity window, resend-delay floor,
  and NIST-aligned failed-attempt upper bound.

### 🐛 Bug fixes

- Prevented duplicate `PhoneOtpInput` completion callbacks when controlled
  state updates follow a completed code entry.

### 💡 Others

## 0.1.1 - 2026-05-09

### 🛠 Breaking changes

### 🎉 New features

- Added `expo-numerator/phone` as a first-class public domain with E.164
  parsing, RFC 3966 formatting, mobile-first validation, global country
  metadata, phone input state helpers, `PhoneInput`, and `PhoneCountryPicker`.
- Added checked-in phone metadata generated from Google libphonenumber metadata
  with `lite`, `mobile`, and `max` profile size reporting.
- Added richer phone type detection, typed phone examples, profile-aware
  `metadataProfile` options, and `getPhoneMetadataInfo(profile)`.
- Added libphonenumber-backed `availableFormats`, international formatting
  rules, national-prefix formatting, and digit-index caret handling for
  stronger as-you-type behavior.
- Added dev-only phone oracle coverage with `google-libphonenumber` and
  `libphonenumber-js` parity smoke tests.
- Added the `/phone` showcase route with profile switching, country sheet
  picker, as-you-type demo, output table, and type detection table.

- Added package release preparation for `0.1.1`.

- Scaffolded `expo-numerator` as a standalone Expo Module package.
- Added Foundation+Core public API for decimal, money, percent, unit, rounding,
  currency registry, typed errors, starter locale data, and digit maps.
- Added non-throwing `safeDecimal`, `safeMoney`, `safePercent`, and `safeUnit`
  result APIs.
- Added crash-safe optional native metadata stubs for iOS, Android, and web.
- Added a phase plan for the next decimal, locale, format, parse, input, and
  Expo integration milestones.
- Added locale registry, locale resolution, digit normalization, and grouping
  validation APIs for the Locale and Symbol Engine phase.
- Added string-based `formatNumber`, `formatMoney`, `formatPercent`, and
  unified `format` APIs for the Format Alpha phase.
- Added scientific and engineering notation alpha support plus
  `formatNumberToParts`.
- Added CLDR-lite compact notation formatting with generated short/long compact
  patterns for the curated locale seed, including Indian and East Asian compact
  scale families.
- Added `parseNumber`, `parseMoney`, `parsePercent`, and unified `parse` APIs
  with strict/loose parsing modes for the Parse Alpha phase.
- Added non-throwing `safeParseNumber`, `safeParseMoney`, `safeParsePercent`,
  and unified `safeParse` APIs for typed parser failures.
- Added registered currency listing helpers for parser validation and registry
  introspection.
- Added pure number input state helpers and the headless `useNumberInput` hook
  for the first React Native Input phase.
- Added a styles-free `NumberInput` component that lazy-loads React Native
  `TextInput` at render time and keeps package root imports Node-testable.
- Added `applyNumberInputNativeTextChange` for diff-based React Native
  `TextInput.onChangeText` caret handling.
- Added Input v2 mode and lifecycle state for decimal, money, percent, and unit
  values, including `defaultValue`/controlled `value`, dirty/focus tracking,
  commit, and reset helpers.
- Added `formatWhileEditing` for banking-style live grouped input while keeping
  the existing plain-editing and blur-formatting model available.
- Added money `entryMode` profiles for plain, live grouped end-locked,
  minor-unit, and integer-major financial entry flows.
- Added `npm run input:replay` and JSON replay fixtures for CI-safe input
  scenario verification.
- Expanded input replay smoke to cover public money, percent, integer, and unit
  input profiles against the built package.
- Added `createExpoNumerator`, `NumeratorProvider`, `useNumerator`, optional
  `expo-localization` discovery, native metadata fallback accessors, and a
  no-op Expo config plugin for the Expo Integration phase.
- Added a CLDR-lite generator, generated locale registry seed, deterministic
  property tests, bundle budget checks, and local benchmark script for the
  hardening phase.
- Expanded the CLDR-lite seed to 17 curated locales and moved percent
  prefix/suffix placement into generated locale data.
- Added generated CLDR-lite currency symbol placement patterns and Intl parity
  snapshots for prefix/suffix money formatting across curated locales.
- Added generated ESM `.mjs` and CJS `.cjs` publish entrypoint trees plus a
  packed-package smoke test for ESM import, CJS require, and package metadata.
- Added release-candidate package checklist documentation and stricter packed
  content smoke checks.
- Added a measurement unit registry, canonical unit values with dimensions,
  `formatUnit`, `parseUnit`, `safeParseUnit`, and unit registry helpers.
- Added `convertUnit` and `canConvertUnit` for linear same-dimension unit
  conversions without JavaScript number conversion.
- Added offset-aware Celsius, Fahrenheit, and Kelvin conversion through the same
  unit conversion engine.
- Expanded measurement coverage with angle, acceleration, force, torque,
  density, electric current, electric potential, and additional real-world
  length/area/volume/mass/time/speed/data/frequency/energy/power/pressure
  units.
- Added locale-aware unit system preferences and `convertUnitForLocale` for
  metric, US, and UK measurement display profiles.
- Added `formatUnitForLocale` for one-call locale preference conversion and
  formatted unit output.
- Added `convertUnitToBestFit`, `formatUnitBestFit`, and best-fit unit
  candidates for magnitude-aware display scaling.
- Added registry hardening tests for unit alias collisions, locale preference
  dimensions, best-fit candidates, and packaged alias smoke coverage.
- Added `npm run unit:registry` and wired it into `npm run hardening` for
  build-output unit registry integrity checks.
- Added `npm run api:surface` and wired it into `npm run hardening` to lock CJS,
  ESM, declaration, package metadata, and forbidden scaffold exports.
- Tightened `api:surface` so CJS and ESM runtime exports must match the exact
  public manifest without unmanifested exports.
- Added `npm run value-format:smoke` and wired it into `npm run hardening` for
  built-package value invariants, formatting matrices, parts, and locale
  roundtrips.
- Added `npm run --silent value-format:report` for grouped JSON value/format
  smoke output and package-level tests for the report script wiring.
- Added `npm run --silent input:replay:report` and `npm run report:contracts`
  to validate machine-readable smoke reports before release.
- Added `npm run --silent benchmark:report` and `npm run benchmark:budget` so
  decimal, rounding, format, and parse performance evidence is CI-checkable.
- Added `npm run expo:check` and `npm run example:expo-check`, then wired
  example TypeScript plus root/example Expo dependency checks into hardening.
- Added string-engine `addDecimal`, `subtractDecimal`, `multiplyDecimal`, and
  explicit-scale `divideDecimal` APIs.
- Added `toMinorUnits` and `fromMinorUnits` for strict or explicitly rounded
  money minor-unit policy.
- Added `allocateMinorUnits` and `allocateMoney` for deterministic
  largest-remainder allocation without losing minor-unit totals.
- Added `npm run arithmetic:smoke` and wired it into hardening for built-package
  decimal arithmetic and money policy checks.
- Added `createMoneyInputOptions` for registry-backed money input profiles.
- Added `createPercentInputOptions` and `createIntegerInputOptions` for reusable
  percent and integer input profiles.
- Added `createUnitInputOptions` for reusable unit input profiles.
- Expanded the built-in ISO 4217 currency seed to 150+ active numeric/minor-unit
  entries, including zero-, three-, and four-minor-unit currencies.
- Added `npm run currency:registry` and wired it into `npm run hardening` for
  built-package currency metadata, minor-unit, numeric-code, and parser smoke
  checks.
- Added `createNumerator` as a simple locale-bound domain facade for common
  money, decimal, percent, unit, input, and locale workflows.
- Added ready-made `MoneyInput`, `PercentInput`, `IntegerInput`, and
  `UnitInput` components on top of the shared React Native input engine.
- Added domain subpath exports for focused imports across `core`, `money`,
  `rounding`, `locale`, `format`, `parse`, `unit`, `input`, and `expo`.
- Added repo-local agent skills, startup instructions, and `npm run skills:check`
  to keep consumer usage plus maintainer architecture, domain, example, and
  release rules discoverable.
- Added `skills/README.md` and `CLAUDE.md` so Codex and Claude setup instructions
  share the same consumer/maintainer skill routing.
- Added `npm run skills:install:*` commands for dry-run install checks, Codex
  global skill installation, and Claude repo-local setup verification.
- Added official consumer documentation under `docs/README.md`, `docs/API.md`,
  `docs/USAGE.md`, and `docs/INTEGRATION.md`, plus `npm run docs:check`.
- Moved internal phase planning out of the public docs surface and added
  `docs/ROADMAP.md` plus gitignore rules for private planning notes.
- Added explicit example app dependency installation to CI, release-candidate,
  and publish workflows so Expo Router example typecheck passes in clean
  checkout environments.
- Updated GitHub Actions workflows from Node.js 20 to Node.js 22 LTS for the
  Expo SDK 55 CI, release-candidate, and publish gates.
- Added GitHub Actions CI, release-candidate validation, npm publish, and
  GitHub Release workflows with centralized release readiness checks.

### 🐛 Bug fixes

- Fixed the Parse showcase so active-locale examples are generated from the
  locale formatter and rendered through safe parse APIs instead of throwing
  during route render for non-US locales.

### 💡 Others

- Replaced generated example module/view boilerplate with a numeric engine demo.
- Rebuilt the example app as a professional page-based showcase and test center
  for values, formatting, parsing, input, Expo integration, and hardening.
- Expanded Values and Format showcase pages with canonical value invariants,
  safe failures, minor-unit exactness, locale roundtrips, and money/percent/unit
  formatting matrices.
- Added value/format smoke visibility to the Hardening showcase page and locked
  the new gate into package contract tests.
- Expanded the example app with dedicated locale, rounding, typed error, and
  package contract pages for page-level manual and automated coverage.
- Added a showcase contract check that keeps route files, Stack screens, screen
  selectors, and selector documentation aligned.
- Tightened the showcase contract to validate Input Lab and Currency Lab
  selectors, including template-generated `testID` values.
- Expanded the Input Lab with live money, percent, unit, and integer-constrained
  input definitions so format/parse/value options are visible in the example.
- Expanded the Package showcase to exercise domain subpath imports inside the
  Expo Router example app.
- Added a dedicated Units showcase page for length, area, volume, mass, aliases,
  localized display, and typed unit parse failures.
- Added a dedicated Currency showcase page for registry coverage, ISO
  minor-unit behavior, symbol mismatch guards, and locale-bound money display.
- Expanded the Currency showcase with search and minor-unit filters for
  registry smoke testing.
- Migrated the example app to Expo Router with route-level pages and safe-area
  aware scroll surfaces.
- Added MIT license and package metadata for the npm standalone package.
- Aligned the root package and example app with the Expo SDK 55 dependency
  matrix.
- Removed SDK 54-era example webpack/babel config and the removed
  `newArchEnabled` app config flag.
- Expanded decimal reliability fixtures and rounding mode coverage.
- Added locale, numbering-system, and grouping validation tests.
- Added CLDR-lite coverage tests for European spacing, Arabic/Persian
  separators and digits, Indian grouping, and locale percent affixes.
- Added deterministic format tests for `en-US`, `tr-TR`, `en-IN`, currency
  minor units, accounting negatives, and percent formatting.
- Added parse tests for localized grouping, non-Latin digits, strict grouping
  failures, currency mismatch detection, accounting negatives, percent values,
  and format/parse roundtrips.
- Added input engine tests for paste, deletion, negative toggle, blur
  formatting, partial text, digit normalization, and integer-only constraints.
- Added a caret acceptance matrix covering insertion, replacement, locale
  decimal mapping, pasted minus signs, max length, and boundary deletion.
- Added input acceptance documentation and stable example app selectors for
  device-level input smoke tests.
- Added input replay smoke to `npm run hardening`.
- Added Expo integration and config plugin tests, and updated the example app to
  demonstrate provider-bound formatting plus `NumberInput`.
- Added hardening scripts to `prepublishOnly` through `npm run hardening`.
- Added `npm run release:check` for package metadata, lockfile, tag, docs, and
  npm tarball readiness validation.
- Added Expo Doctor for the example app to the hardening gate.
- Added package export tests for ESM, CJS, and Metro source entrypoint
  declarations.
- Added public error contract documentation for throwing and safe APIs.
- Pointed package homepage metadata at the npm package documentation surface to
  avoid Expo prepare/readme homepage warnings.
