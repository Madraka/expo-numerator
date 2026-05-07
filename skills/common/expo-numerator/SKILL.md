# expo-numerator

## Audience

Use this project-wide skill for both consumer-facing and maintainer-facing work.
Then choose the more specific audience skill before editing docs or source.

## When To Use

Use this skill for any task in this repository. It defines the project-wide
rules that every domain skill builds on.

## Architecture Rules

- Treat `src/core`, `src/money`, `src/rounding`, `src/locale`, `src/format`,
  `src/parse`, `src/unit`, `src/input`, and `src/expo` as separate domains with
  explicit public entrypoints.
- Keep core dependency-light. Optional Expo/native features must not be required
  for string value, format, parse, or input configuration APIs.
- Do not add generic `utils.ts` or `helpers.ts` surfaces. Name files by the
  behavior or contract they own.
- Public APIs should either throw typed `NumeratorError` or expose a `safe*`
  result variant. Avoid silent coercion.
- Keep root exports and domain subpath exports intentional. New public symbols
  must be added to API surface checks.

## Verification

Run the narrow domain script first, then the package gates when public API or
package behavior changes:

```sh
npm run typecheck
npm test -- --runInBand
npm run api:surface
npm run hardening
```
