# expo-numerator-core

## Audience

Maintainers changing core value semantics, decimal arithmetic, rounding, or
typed error behavior.

## When To Use

Use this skill for decimal values, percent values, rounding, arithmetic,
canonical normalization, typed errors, and safe result APIs.

## Architecture Rules

- Canonical decimal strings are the source of truth. Preserve scale when the
  public contract says scale matters, and collapse negative zero.
- Never rely on JavaScript floating-point math for decimal, money, percent, or
  unit value semantics.
- Division must keep explicit scale and rounding policy. Repeating decimals must
  not hide an implicit rounding decision.
- Rounding changes require tests for positive ties, negative ties, zeros, and
  large values.
- Error changes must keep stable `NumeratorError` codes and safe result shapes.

## Verification

```sh
npm test -- --runInBand
npm run arithmetic:smoke
npm run value-format:smoke
npm run api:surface
```
