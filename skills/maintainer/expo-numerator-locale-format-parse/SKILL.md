# expo-numerator-locale-format-parse

## Audience

Maintainers changing locale data, deterministic formatting, parsing, or
CLDR-lite generation.

## When To Use

Use this skill for locale symbols, CLDR-lite generation, digit normalization,
grouping validation, number/money/percent/unit formatting, and strict or loose
parsing.

## Architecture Rules

- CLDR-lite generated data should stay small, deterministic, and checked into
  the repo when it is part of runtime behavior.
- Locale formatting and parsing must work without converting high-precision
  values through JavaScript `number`.
- Strict parse mode validates locale separators, grouping, sign, affixes, and
  currency expectations. Loose mode is for copy-paste tolerance.
- Non-Latin digit systems must normalize before decimal validation.
- Parse failures should remain typed and safe variants should return values for
  app-boundary forms.
- Formatting changes should keep roundtrip fixtures for representative locales.

## Verification

```sh
npm run check:cldr-lite
npm run value-format:smoke
npm run report:contracts
npm test -- --runInBand
```
