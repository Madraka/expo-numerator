# expo-numerator-package-release

## Audience

Maintainers changing package metadata, public exports, CI, GitHub releases, npm
publishing, or release readiness checks.

## When To Use

Use this skill for package metadata, domain subpath exports, build entrypoints,
GitHub Actions, release candidates, npm publishing, tarball contents, and
hardening gates.

## Architecture Rules

- Keep `main`, `module`, `types`, `react-native`, `source`, and `exports`
  aligned with generated build entrypoints and source entrypoints.
- Domain subpaths are public contracts. New subpaths require build output,
  declaration output, smoke coverage, and API surface checks.
- `files` must include runtime sources, build artifacts, docs, native stubs,
  plugin files, and repo-local agent guidance when intended for package
  consumers.
- Publishing should go through centralized release gates. Do not bypass
  `prepublishOnly`, `release:check`, or the GitHub publish workflow.
- Version updates must keep `package.json`, `package-lock.json`, changelog, tag,
  and npm tarball contents synchronized.
- CI should fail closed when package contents or public API drift.

## Verification

```sh
npm run api:surface
npm run package:smoke
npm run skills:check
npm run release:check
npm pack --dry-run
```
