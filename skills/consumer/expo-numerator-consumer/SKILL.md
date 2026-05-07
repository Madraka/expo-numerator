# expo-numerator-consumer

## Audience

Consumers are application teams using `expo-numerator` from npm or from a
workspace package. They should not need internal source paths, build scripts, or
maintainer-only release knowledge.

## When To Use

Use this skill for public usage examples, README snippets, example-app user
flows, package consumer guidance, integration recipes, and API ergonomics.

## Architecture Rules

- Prefer `createNumerator` for app-level flows and domain subpath imports for
  focused bundles.
- Document only root or domain subpath imports such as `expo-numerator/money`,
  `expo-numerator/format`, `expo-numerator/input`, and `expo-numerator/expo`.
- Do not expose `src/*`, generated build paths, scripts, registry internals, or
  maintainer-only test fixtures as consumer guidance.
- Use `safe*` APIs for form, paste, API boundary, and user-generated input
  examples. Use throwing APIs only when the call site owns validation.
- For money input, explain entry mode choices in product terms:
  `plain`, `liveGroupedEndLocked`, `minorUnits`, and `integerMajor`.
- Consumer examples must stay copy-pasteable and avoid hidden setup.

## Verification

```sh
npm run package:smoke
npm run value-format:smoke
npm run input:replay
npm run example:typecheck
```
