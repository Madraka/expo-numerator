# expo-numerator Documentation

This directory is the official documentation surface for consumers and
maintainers.

## Consumer Docs

- [API Reference](API.md): public exports, domain subpaths, facade shape, and
  value contracts.
- [Usage Guide](USAGE.md): copy-paste recipes for values, money, percent,
  units, parsing, and input.
- [Expo and React Native Integration](INTEGRATION.md): provider setup, optional
  device locale access, React Native input patterns, and example app usage.
- [Error Contract](ERROR_CONTRACT.md): throwing APIs, safe APIs, and typed
  failures.
- [Currency Registry](CURRENCY_REGISTRY.md): ISO currency metadata, minor units,
  custom registrations, and release policy.
- [Input Acceptance Matrix](INPUT_ACCEPTANCE.md): input modes, caret behavior,
  replay fixtures, and device smoke selectors.

## Maintainer Docs

- [Roadmap](ROADMAP.md): public release line, development themes, and release
  gates.
- [Release Checklist](RELEASE_CHECKLIST.md): CI, hardening, package, npm, and
  GitHub release gates.
- [Agent Skills](../skills/README.md): Codex and Claude setup plus
  consumer/maintainer skill routing.

## Public Import Policy

Consumer documentation must use only these import surfaces:

```ts
import { createNumerator } from "expo-numerator";
import { decimal } from "expo-numerator/core";
import { money } from "expo-numerator/money";
import { roundDecimal } from "expo-numerator/rounding";
import { resolveLocale } from "expo-numerator/locale";
import { formatNumber } from "expo-numerator/format";
import { safeParseNumber } from "expo-numerator/parse";
import { convertUnit } from "expo-numerator/unit";
import { NumberInput } from "expo-numerator/input";
import { createExpoNumerator } from "expo-numerator/expo";
```

Do not document internal source paths or generated package output paths as
consumer APIs.
