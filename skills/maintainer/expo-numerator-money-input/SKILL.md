# expo-numerator-money-input

## Audience

Maintainers changing money metadata, minor-unit policy, financial input profiles,
or React Native caret behavior.

## When To Use

Use this skill for currency metadata, money values, minor units, money
allocation, React Native money input, caret behavior, and financial entry modes.

## Architecture Rules

- Currency scale must come from the registry unless an API explicitly accepts a
  custom registration.
- Reject sub-minor money values by default. Rounding sub-minor values requires an
  explicit policy.
- Keep money allocation integer-minor-unit based so totals are preserved.
- Support distinct input strategies: `plain`, `liveGroupedEndLocked`,
  `minorUnits`, and `integerMajor`.
- React Native formatted input must account for stale selection events. End
  locked financial modes should not depend on free-caret formatted editing.
- New input behavior needs replay fixtures, not only visual testing.

## Verification

```sh
npm run currency:registry
npm run input:replay
npm run report:contracts
npm test -- --runInBand
```
