# Release Checklist

Use this checklist before publishing a release candidate.

## Required Gates

```sh
npm run lint
npm run typecheck
npm test -- --runInBand
npm run build
npm run api:surface
npm run value-format:smoke
npm run arithmetic:smoke
npm run currency:registry
npm run unit:registry
npm run report:contracts
npm run docs:check
npm run skills:check
npm run skills:install:check
npm run benchmark:budget
npm run example:typecheck
npm run expo:check
npm run example:expo-check
npm run hardening
npm run benchmark
npm run --silent value-format:report
npm run --silent input:replay:report
npm run --silent benchmark:report
npm run release:check
npm run prepublishOnly
npm pack --dry-run
```

## Package Contract

- `main` points to `build/cjs/index.cjs`.
- `module` points to `build/esm/index.mjs`.
- `types` points to `build/index.d.ts`.
- `react-native` and the `react-native` export condition point to `src/index.ts`.
- `sideEffects` remains `false`.
- `homepage` points to the public package documentation surface.
- Packed contents include `build`, `src`, native stubs, `docs`, `plugin`,
  `app.plugin.js`, `AGENTS.md`, `.agent`, `skills`, `README.md`,
  `CHANGELOG.md`, and `LICENSE`.
- Packed contents must exclude private planning paths such as `docs/private/`
  and `docs/PHASE_PLAN.md`.
- Packed contents exclude `src/__tests__` and generated `.js` artifacts from the
  declaration build root.
- Package smoke must cover decimal, money, percent/input, unit registry, unit
  conversion, and value/format smoke wiring across ESM and CJS.
- Public API surface check must cover exact CJS/ESM runtime export manifests,
  runtime parity, declaration exports, package metadata, and forbidden scaffold
  exports.
- Value/format smoke must pass canonical value invariants, money/percent/unit
  formatting, notation parts, and locale format/parse roundtrips against the
  built package.
- Arithmetic smoke must pass decimal add/subtract/multiply/divide behavior,
  typed arithmetic errors, strict/rounded money minor-unit conversions, and
  deterministic allocation checks against the built package.
- Report contracts must validate value/format and input replay JSON outputs for
  group/scenario/profile coverage and all-passing results.
- Public docs must pass `npm run docs:check` so README, API reference, usage,
  integration, and consumer import policy stay aligned.
- Repo-local agent skills must pass `npm run skills:check` so consumer usage
  rules and maintainer architecture, domain, example, and release rules stay
  discoverable to future Codex and Claude sessions.
- Agent skill install readiness must pass `npm run skills:install:check` so
  Codex global setup and Claude repo-local setup stay documented and executable.
- Benchmark budget must validate the decimal, rounding, format, and parse
  benchmark report schema plus conservative minimum throughput floors.
- Unit registry smoke must pass alias ownership, locale preference, best-fit
  candidate, and packed runtime checks.
- Example app TypeScript and Expo dependency checks must pass through package
  scripts so showcase regressions are caught by the same release gate. The root
  package check intentionally allows the package-level TypeScript-latest policy;
  the Expo SDK 55 example app check stays strict.
- Release readiness must pass `npm run release:check`. It verifies package
  metadata, package-lock version sync, required release docs, optional tag
  version matching, and npm tarball contents.

## GitHub Workflow

- `CI` runs on pull requests and pushes to `main`/`master`. It installs with
  `npm ci`, then runs lint, typecheck, Jest, and the full hardening gate.
- `Release Candidate` is manually triggered with a `release_tag` input. It runs
  `npm run prepublishOnly`, emits machine-readable value/input/benchmark
  reports as artifacts, and performs an npm pack dry-run.
- `Publish` runs only for tags matching `v*.*.*`. The tag must match
  `package.json` as `v${version}` because `release:check` reads
  `GITHUB_REF_NAME`. It runs the full release gate, creates a tarball, publishes
  to npm with provenance, and creates a GitHub Release with the tarball asset.

## Version and Publish Procedure

1. Update `package.json` version with `npm version <patch|minor|major> --no-git-tag-version`.
2. Verify `package-lock.json` changed with the same version.
3. Update `CHANGELOG.md` release notes.
4. Run `npm run prepublishOnly`.
5. Run `npm run release:check`.
6. Commit the version and release-note changes.
7. Create and push the matching tag, for example `git tag v0.1.0 && git push origin v0.1.0`.
8. Confirm the `Publish` workflow completes and the npm/GitHub release artifacts match.

Required repository secret for token-based npm publishing:

- `NPM_TOKEN`: npm automation token with publish access for `expo-numerator`.

If npm Trusted Publishing is configured for this repository, the publish step
can remove `NODE_AUTH_TOKEN` and rely on the workflow OIDC identity plus
`--provenance`.

## Known Non-blocking Warnings

- `ts-jest` currently warns that TypeScript 6.0.3 is outside its tested version
  range. The suite still passes.
- Expo SDK 55 currently recommends TypeScript `~5.9.2`; the root package uses
  TypeScript latest for library build validation, while the example app remains
  on the SDK-compatible TypeScript range.
- Expo dependency checks can occasionally fail with a transient JSON fetch
  error. Re-run the same command; the dependency result must still end as
  `{"dependencies":[],"upToDate":true}`.
