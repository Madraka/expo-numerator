# expo-numerator Agent Guide

This file is the starting contract for coding agents working in this repository.
Read it before changing source, docs, example screens, package metadata, or
release automation.

For Claude, keep `CLAUDE.md` aligned with this file. For setup and skill routing
details, use `skills/README.md`.

## Read Order

1. `skills/common/expo-numerator/SKILL.md`
2. Choose the audience gate:
   - Consumer usage, public examples, integration docs:
     `skills/consumer/expo-numerator-consumer/SKILL.md`
   - Source, tests, package, example app, CI, release, generated data:
     `skills/maintainer/expo-numerator-maintainer/SKILL.md`
3. For maintainer work, load the domain skill that matches the task:
   - `skills/maintainer/expo-numerator-core/SKILL.md`
   - `skills/maintainer/expo-numerator-money-input/SKILL.md`
   - `skills/maintainer/expo-numerator-locale-format-parse/SKILL.md`
   - `skills/maintainer/expo-numerator-unit/SKILL.md`
   - `skills/maintainer/expo-numerator-expo-example/SKILL.md`
   - `skills/maintainer/expo-numerator-package-release/SKILL.md`
4. `docs/ROADMAP.md`
5. `docs/RELEASE_CHECKLIST.md` for release, CI, packaging, or npm changes.

## Audience Split

- Consumer guidance is for application developers using the npm package. It must
  stay public-API-only, copy-pasteable, and free of maintainer internals.
- Maintainer guidance is for contributors changing source, tests, generated
  data, package exports, example routes, CI, or release automation.
- If a maintainer change affects public usage, update the consumer guidance in
  the same work.

## Repository Rules

- Use npm only. Keep `package-lock.json` in sync with `package.json`.
- Keep the example app aligned with Expo SDK 55 and strict Expo dependency
  checks. The root package may use the latest TypeScript policy validated by
  `npm run expo:check`.
- Never route decimal, money, percent, or unit precision through JavaScript
  `number` unless a public API explicitly documents that conversion.
- Prefer typed `NumeratorError` failures and safe result APIs at app boundaries.
- Keep public imports on the root package or domain subpaths. Do not document
  internal file imports from `src/*`.
- Preserve crash-safe optional native behavior. JS core APIs must work when the
  native module is absent.
- Keep the example app as both a professional showcase and a manual test
  center. New user-facing capability should have a route-level demo when useful.
- Lock public API, package contents, reports, benchmarks, and example health
  through scripts rather than manual inspection.

## Required Verification

For focused code changes, run the narrow test or smoke script for the touched
domain plus `npm run typecheck`.

Before a release-quality handoff, run:

```sh
npm run lint
npm run typecheck
npm test -- --runInBand
npm run hardening
```

For release metadata or workflow changes, also run:

```sh
npm run release:check
npm pack --dry-run
```
