# expo-numerator

Production-grade numeric infrastructure for Expo and React Native.

`expo-numerator` provides string-first decimal, money, percent, unit,
formatting, parsing, and React Native input APIs without silent floating-point
precision loss.

## Install

```sh
npm install expo-numerator
```

## Quick Start

Use `createNumerator` when an app wants one locale-bound facade:

```ts
import { createNumerator } from "expo-numerator";

const n = createNumerator({ locale: "tr-TR" });

n.money.format("1234.56", "TRY"); // "₺1.234,56"
n.money.safeParse("₺1.234,56", "TRY").ok; // true
n.decimal.add("999.99", "0.01").value; // "1000.00"
n.unit.formatBestFit("1500", "meter", { scale: 1 }); // "1,5 km"
```

Use domain subpaths when a bundle only needs one surface:

```ts
import { formatMoney } from "expo-numerator/format";
import { money, toMinorUnits } from "expo-numerator/money";
import { MoneyInput } from "expo-numerator/input";

formatMoney(money("1234.56", "TRY"), { locale: "tr-TR" });
toMinorUnits("12.34", "USD"); // 1234n
```

For React Native money input, start with the ready-made component:

```tsx
import { MoneyInput } from "expo-numerator";

<MoneyInput
  locale="tr-TR"
  currency="TRY"
  entryMode="liveGroupedEndLocked"
  onValueChange={(value) => {
    value?.kind === "money" ? value.amount : null;
  }}
/>;
```

## Documentation

The official consumer documentation lives in `docs/`:

- [Documentation Index](docs/README.md)
- [API Reference](docs/API.md)
- [Usage Guide](docs/USAGE.md)
- [Expo and React Native Integration](docs/INTEGRATION.md)
- [Error Contract](docs/ERROR_CONTRACT.md)
- [Currency Registry](docs/CURRENCY_REGISTRY.md)
- [Input Acceptance Matrix](docs/INPUT_ACCEPTANCE.md)

Maintainer and release documentation:

- [Roadmap](docs/ROADMAP.md)
- [Release Checklist](docs/RELEASE_CHECKLIST.md)
- [Agent Skills](skills/README.md)

## Core Rules

- Pass decimal values as strings for exact precision.
- JavaScript numbers are accepted only for safe integer convenience.
- Use throwing constructors when the call site owns validation.
- Use `safe*` APIs for forms, paste handling, API boundaries, and user input.
- Import only from `expo-numerator` or public domain subpaths.

## Public Subpaths

```ts
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

## Status

`0.1.0` includes Foundation+Core, locale, format, parse alpha APIs, React Native
input APIs, Expo integration helpers, CLDR-lite generated locale data, domain
subpath exports, package smoke checks, and release hardening.

## Development

```sh
npm run typecheck
npm test -- --runInBand
npm run docs:check
npm run hardening
```

Repo-local agent guidance lives in [AGENTS.md](./AGENTS.md), [CLAUDE.md](./CLAUDE.md),
`.agent/`, and [skills/README.md](./skills/README.md). The skills tree is split
into `skills/common`, `skills/consumer`, and `skills/maintainer`.

See [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md) for the full
release-candidate gate.
