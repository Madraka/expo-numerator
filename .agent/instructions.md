# Agent Instructions

Start from `AGENTS.md`. Then load the smallest matching skill under `skills/`
before editing the related domain.

For Claude sessions, start from `CLAUDE.md`. Both Codex and Claude should use
`skills/README.md` as the skill layout and setup index.

## Common Gate

- Always read `skills/common/expo-numerator/SKILL.md` first for project-wide
  invariants and verification rules.

## Audience Gate

- For app integration, public examples, README usage, or consumer ergonomics,
  read `skills/consumer/expo-numerator-consumer/SKILL.md`.
- For source, tests, example routes, generated data, package metadata, CI, or
  release work, read `skills/maintainer/expo-numerator-maintainer/SKILL.md` and
  then the matching domain skill.

## Default Constraints

- Keep changes scoped to the requested phase or domain.
- Reuse existing registries, string engines, typed errors, and public exports.
- Add scripts or tests when a rule must stay true across future phases.
- Update docs and showcase pages when a public capability becomes visible.
- Do not loosen release, package, Expo, benchmark, or report gates to make a
  change pass.

## Skill Selection

- Core values, decimal arithmetic, rounding, errors:
  `skills/maintainer/expo-numerator-core/SKILL.md`.
- Money input, caret, financial entry modes:
  `skills/maintainer/expo-numerator-money-input/SKILL.md`.
- Locale symbols, formatting, parsing, CLDR-lite:
  `skills/maintainer/expo-numerator-locale-format-parse/SKILL.md`.
- Measurement values, registry, conversion:
  `skills/maintainer/expo-numerator-unit/SKILL.md`.
- Expo Router example app and showcase UX:
  `skills/maintainer/expo-numerator-expo-example/SKILL.md`.
- Package exports, CI, npm, GitHub releases:
  `skills/maintainer/expo-numerator-package-release/SKILL.md`.
