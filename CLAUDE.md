# expo-numerator Claude Guide

This repository keeps agent instructions in audience-specific local skills. Read
this file before changing source, docs, example screens, package metadata, or
release automation.

## Required Read Order

1. `skills/common/expo-numerator/SKILL.md`
2. Choose one audience gate:
   - Consumer usage, public examples, integration docs:
     `skills/consumer/expo-numerator-consumer/SKILL.md`
   - Source, tests, package, example app, CI, release, generated data:
     `skills/maintainer/expo-numerator-maintainer/SKILL.md`
3. For maintainer work, load the matching domain skill:
   - `skills/maintainer/expo-numerator-core/SKILL.md`
   - `skills/maintainer/expo-numerator-money-input/SKILL.md`
   - `skills/maintainer/expo-numerator-locale-format-parse/SKILL.md`
   - `skills/maintainer/expo-numerator-unit/SKILL.md`
   - `skills/maintainer/expo-numerator-expo-example/SKILL.md`
   - `skills/maintainer/expo-numerator-package-release/SKILL.md`
4. Use `skills/README.md` as the install and routing index.

## Claude Setup

Claude Code automatically reads `CLAUDE.md` when started from this repository
root. For consistent behavior, open Claude in `/Users/madraka/Desktop/expo-numerator`
and keep this file plus `skills/README.md` in the model context.

If Claude is started from a subdirectory, manually add:

```text
AGENTS.md
CLAUDE.md
skills/README.md
skills/common/expo-numerator/SKILL.md
```

Then add either the consumer or maintainer audience skill for the task.

## Verification

After changing agent instructions or skills, run:

```sh
npm run skills:check
```

Release-quality changes should also pass:

```sh
npm run hardening
```
