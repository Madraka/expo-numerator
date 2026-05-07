# Agent Skill Index

This repository keeps local skills in `skills/` so architecture decisions are
available at the start of every future coding session.

Codex starts from `AGENTS.md`; Claude starts from `CLAUDE.md`. Both should use
`skills/README.md` as the install and routing index.

## Skills

### Common

- `skills/README.md`: Codex and Claude setup, folder layout, and routing index.
- `skills/common/expo-numerator/SKILL.md`: project-wide invariants and
  verification.

### Consumer

- `skills/consumer/expo-numerator-consumer/SKILL.md`: public package usage,
  integration recipes, and consumer-facing examples.

### Maintainer

- `skills/maintainer/expo-numerator-maintainer/SKILL.md`: contributor workflow,
  internal source changes, hardening, and release discipline.
- `skills/maintainer/expo-numerator-core/SKILL.md`: decimal, value, rounding,
  and error contracts.
- `skills/maintainer/expo-numerator-money-input/SKILL.md`: money domain,
  financial input, caret, and minor-unit policy.
- `skills/maintainer/expo-numerator-locale-format-parse/SKILL.md`: CLDR-lite,
  locale registry, formatting, parsing, and digit normalization.
- `skills/maintainer/expo-numerator-unit/SKILL.md`: measurement registry,
  conversion, and unit input profiles.
- `skills/maintainer/expo-numerator-expo-example/SKILL.md`: Expo SDK 55 example
  app, Expo Router showcase, safe area, and route-level demos.
- `skills/maintainer/expo-numerator-package-release/SKILL.md`: package exports,
  hardening, CI, GitHub releases, and npm publishing.

Run `npm run skills:check` after editing this folder.
