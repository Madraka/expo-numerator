# expo-numerator Skills

This folder separates public package usage guidance from maintainer guidance.
Agents should load the smallest set of skills that matches the task.

## Layout

```text
skills/
  common/
    expo-numerator/
  consumer/
    expo-numerator-consumer/
  maintainer/
    expo-numerator-maintainer/
    expo-numerator-core/
    expo-numerator-money-input/
    expo-numerator-locale-format-parse/
    expo-numerator-unit/
    expo-numerator-phone/
    expo-numerator-expo-example/
    expo-numerator-package-release/
```

## Read Order

1. Common project rules:
   `skills/common/expo-numerator/SKILL.md`
2. Audience gate:
   - Consumer work: `skills/consumer/expo-numerator-consumer/SKILL.md`
   - Maintainer work: `skills/maintainer/expo-numerator-maintainer/SKILL.md`
3. Maintainer domain skill when editing source, tests, example, CI, package, or
   release behavior:
   - `skills/maintainer/expo-numerator-core/SKILL.md`
   - `skills/maintainer/expo-numerator-money-input/SKILL.md`
   - `skills/maintainer/expo-numerator-locale-format-parse/SKILL.md`
   - `skills/maintainer/expo-numerator-unit/SKILL.md`
   - `skills/maintainer/expo-numerator-phone/SKILL.md`
   - `skills/maintainer/expo-numerator-expo-example/SKILL.md`
   - `skills/maintainer/expo-numerator-package-release/SKILL.md`

## Codex Setup

Codex should be started from the repository root:

```sh
cd /Users/madraka/Desktop/expo-numerator
```

Codex reads `AGENTS.md` as the root instruction file. Keep these files in the
first context set:

```text
AGENTS.md
.agent/instructions.md
.agent/README.md
skills/README.md
skills/common/expo-numerator/SKILL.md
```

Then add the consumer or maintainer audience skill for the task. Maintainer work
should add exactly one matching domain skill unless the change crosses domains.

For a global Codex skill install, run:

```sh
npm run skills:install:codex
```

Preview the install without writing files:

```sh
npm run skills:install:check
```

By default, the Codex installer writes to
`${CODEX_HOME:-~/.codex}/skills/expo-numerator`. Use a custom destination when
testing:

```sh
node scripts/install-agent-skills.js --target=codex --destination=/tmp/expo-numerator-skill
```

## Claude Setup

Claude should be started from the repository root:

```sh
cd /Users/madraka/Desktop/expo-numerator
```

Claude reads `CLAUDE.md` as the root instruction file. Keep these files in the
first context set:

```text
CLAUDE.md
AGENTS.md
skills/README.md
skills/common/expo-numerator/SKILL.md
```

Then add either:

```text
skills/consumer/expo-numerator-consumer/SKILL.md
```

or:

```text
skills/maintainer/expo-numerator-maintainer/SKILL.md
```

For maintainer work, also add the matching maintainer domain skill.

Claude does not need a global skill install for this repository. The setup is
repo-local through `CLAUDE.md`. Verify it with:

```sh
npm run skills:install:claude
```

## Consumer Tasks

Use consumer guidance for README snippets, public API examples, Expo app
integration recipes, and package ergonomics. Consumer docs must not reference
internal `src/*` paths, generated build paths, or maintainer-only scripts.

## Maintainer Tasks

Use maintainer guidance for source edits, tests, CLDR-lite generation, example
routes, CI, package metadata, release workflows, or npm publishing. Maintainer
changes that alter public usage must update consumer guidance in the same work.

## Validation

Run this after changing any file in `skills/`, `AGENTS.md`, `CLAUDE.md`, or
`.agent/`:

```sh
npm run skills:check
```

To validate install readiness without writing global files:

```sh
npm run skills:install:check
```
