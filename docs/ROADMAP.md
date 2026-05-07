# Roadmap

This is the public roadmap for `expo-numerator`. Internal phase notes, scratch
planning, personal instructions, and non-release work notes must stay out of git
under `docs/private/` or another ignored local path.

## Current Release Line

`0.1.0` is the Foundation+Core release line with:

- String-first decimal, money, percent, and unit values.
- Decimal arithmetic, rounding, comparison, normalization, and scale helpers.
- Currency registry, minor-unit helpers, and deterministic money allocation.
- Locale registry, digit normalization, grouping validation, format, and parse
  APIs.
- Measurement unit registry, conversion, best-fit display, and locale
  preferences.
- React Native input state helpers, headless hook, styles-free input component,
  and ready-made money, percent, integer, and unit inputs.
- Expo integration helpers, provider/hook, optional localization lookup, and
  crash-safe native metadata fallbacks.
- Domain subpath exports and package smoke checks for CJS, ESM, declarations,
  and React Native source conditions.

## Public Development Themes

- Broader locale coverage through the CLDR-lite generator.
- More device-level React Native input verification.
- Additional ecosystem adapters where they can stay optional and dependency
  light.
- More public examples for real application workflows.
- Continued package, bundle, benchmark, docs, and release hardening.
- CI runtime maintenance on supported Node.js LTS lines for Expo SDK 55.

## Release Gates

Public roadmap work should remain releaseable only when these gates pass:

```sh
npm run lint
npm run typecheck
npm test -- --runInBand
npm run docs:check
npm run hardening
```

See [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) for the full release process.
