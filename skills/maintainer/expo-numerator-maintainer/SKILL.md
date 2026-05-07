# expo-numerator-maintainer

## Audience

Maintainers are contributors changing source, tests, package metadata, example
routes, CI, release automation, generated data, or repo-local agent guidance.

## When To Use

Use this skill before editing package internals, adding public API, changing
registries, updating the example app, adjusting hardening scripts, or preparing
release artifacts.

## Architecture Rules

- Load the matching maintainer domain skill after this skill:
  `expo-numerator-core`, `expo-numerator-money-input`,
  `expo-numerator-locale-format-parse`, `expo-numerator-unit`,
  `expo-numerator-expo-example`, or `expo-numerator-package-release`.
- Preserve public API through root and domain subpath exports. Internal file
  movement is acceptable only when public entrypoints and package smoke stay
  stable.
- Keep tests, smoke scripts, docs, and showcase selectors aligned with any
  public capability.
- Do not weaken hardening, Expo SDK 55 checks, TypeScript policy checks,
  tarball checks, benchmark budgets, or release gates to land a change.
- Update consumer guidance separately when a maintainer change alters public
  usage.

## Verification

```sh
npm run typecheck
npm test -- --runInBand
npm run api:surface
npm run skills:check
npm run hardening
```
