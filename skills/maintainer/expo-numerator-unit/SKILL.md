# expo-numerator-unit

## Audience

Maintainers changing measurement registry entries, conversion rules, unit
formatting, or unit input profiles.

## When To Use

Use this skill for measurement values, unit registry entries, aliases,
dimensions, conversion, best-fit display, locale unit preferences, and unit input
profiles.

## Architecture Rules

- Every registered unit needs a canonical code, dimension, display metadata, and
  collision-free aliases.
- Same-dimension linear conversion must stay decimal-string based.
- Offset units such as temperature require explicit affine conversion handling.
- Best-fit conversion must use deterministic candidate lists, not runtime guess
  work.
- Locale preference helpers should choose display units without mutating the
  canonical stored value.
- Unit input profiles should derive fraction behavior and symbols from registry
  metadata where possible.

## Verification

```sh
npm run unit:registry
npm run value-format:smoke
npm test -- --runInBand
```
