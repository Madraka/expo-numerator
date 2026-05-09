# expo-numerator Example

This Expo SDK 55 app is the runnable showcase and manual test center for
`expo-numerator`. It demonstrates the public package APIs through Expo Router
pages for exact values, money, units, locale data, formatting, parsing, typed
errors, phone input/OTP contracts, React Native input behavior, Expo
integration, package exports, and release hardening.

## Setup

Run setup from the package root:

```sh
npm install
npm run example:install
```

Use npm only so `package-lock.json` and the example dependency tree stay in
sync with the repository checks.

## Run

Start the example from the package root:

```sh
npm --prefix example run start
```

Platform-specific commands:

```sh
npm --prefix example run ios
npm --prefix example run android
npm --prefix example run web
```

Expo Go quick preview:

```sh
npm --prefix example exec expo start -- --go
```

Expo Go is useful for reviewing the JavaScript-first package surfaces,
formatting, parsing, locale behavior, and React Native input flows. It does not
embed this repository's optional custom native module, so native metadata and
number separator checks should be treated as fallback behavior there. Use
`npm --prefix example run ios` or `npm --prefix example run android` when you
need to validate the autolinked native module in a development build.

The app uses Expo Router. The overview route opens first and links to every
showcase page.

## Showcase Pages

- `/`: overview, active locale, registered data counts, and route map.
- `/values`: decimal, money, percent, and unit value contracts.
- `/currency`: ISO currency metadata and minor-unit behavior.
- `/units`: measurement registry, conversion, and best-fit display.
- `/locale`: locale symbols, digits, grouping, and curated locale switching.
- `/rounding`: string-based rounding modes.
- `/format`: locale-aware number, money, percent, compact, and parts output.
- `/parse`: strict, loose, and safe parsing behavior.
- `/errors`: typed `NumeratorError` failures and safe result boundaries.
- `/input`: React Native input state, caret, paste, and entry-mode scenarios.
- `/phone`: E.164 phone input, country picker sheet, as-you-type formatting,
  and OTP verification contract demo.
- `/expo`: provider, hook, optional localization, and native fallback behavior.
- `/package`: public exports, source conditions, and package smoke coverage.
- `/hardening`: release and verification gates.

## API Usage Pattern

The example imports from the public package root and public domain subpaths
only. Consumer code should follow the same rule:

```ts
import { createExpoNumerator, money } from "expo-numerator";
import { safeParseNumber } from "expo-numerator/parse";
import { MoneyInput } from "expo-numerator/input";

const numerator = createExpoNumerator({ locale: "tr-TR" });

numerator.formatMoney(money("1234.56", "TRY"));
safeParseNumber("1.234,56", { locale: "tr-TR" });
```

Keep decimal, money, percent, and unit precision as strings unless a public API
explicitly documents another conversion. Use `safe*` APIs for user input,
paste handling, forms, and API boundaries.

## Local Verification

For example-only changes, run:

```sh
npm run example:typecheck
npm run example:doctor
npm run example:expo-check
npm run showcase:contract
```

For release-quality handoff from the package root, run the broader gates:

```sh
npm run lint
npm run typecheck
npm test -- --runInBand
npm run hardening
```

## Maintenance Notes

- Keep the app on Expo SDK 55 and strict Expo dependency checks.
- Keep route-level demos focused, interactive, and backed by real package APIs.
- Add stable `testID` selectors for important showcase scenarios.
- If an example changes public usage, update the consumer docs in `docs/`.
