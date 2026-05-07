#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const requiredSkills = [
  { id: "expo-numerator", path: "skills/common/expo-numerator/SKILL.md" },
  { id: "expo-numerator-consumer", path: "skills/consumer/expo-numerator-consumer/SKILL.md" },
  { id: "expo-numerator-maintainer", path: "skills/maintainer/expo-numerator-maintainer/SKILL.md" },
  { id: "expo-numerator-core", path: "skills/maintainer/expo-numerator-core/SKILL.md" },
  { id: "expo-numerator-money-input", path: "skills/maintainer/expo-numerator-money-input/SKILL.md" },
  {
    id: "expo-numerator-locale-format-parse",
    path: "skills/maintainer/expo-numerator-locale-format-parse/SKILL.md",
  },
  { id: "expo-numerator-unit", path: "skills/maintainer/expo-numerator-unit/SKILL.md" },
  { id: "expo-numerator-expo-example", path: "skills/maintainer/expo-numerator-expo-example/SKILL.md" },
  { id: "expo-numerator-package-release", path: "skills/maintainer/expo-numerator-package-release/SKILL.md" },
];
const requiredDocs = [
  "AGENTS.md",
  "CLAUDE.md",
  ".agent/instructions.md",
  ".agent/README.md",
  "skills/README.md",
  "scripts/install-agent-skills.js",
  ...requiredSkills.map((skill) => skill.path),
];

function main() {
  const failures = [
    ...checkRequiredFiles(),
    ...checkPackageScripts(),
    ...checkSkillShape(),
    ...checkStartupReferences(),
  ];

  if (failures.length > 0) {
    console.error(`Agent skills check failed:\n${failures.join("\n")}`);
    process.exit(1);
  }

  console.log(`Agent skills check passed for ${requiredSkills.length} skills.`);
}

function checkPackageScripts() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const requiredScripts = [
    "skills:check",
    "skills:install",
    "skills:install:check",
    "skills:install:codex",
    "skills:install:claude",
  ];

  return requiredScripts
    .filter((script) => typeof packageJson.scripts?.[script] !== "string")
    .map((script) => `package.json must define ${script}`);
}

function checkRequiredFiles() {
  return requiredDocs
    .filter((file) => !fs.existsSync(path.join(repoRoot, file)))
    .map((file) => `missing agent skill file: ${file}`);
}

function checkSkillShape() {
  const failures = [];

  for (const skill of requiredSkills) {
    const file = skill.path;
    const fullPath = path.join(repoRoot, file);

    if (!fs.existsSync(fullPath)) {
      continue;
    }

    const body = fs.readFileSync(fullPath, "utf8");
    const expectedTitle = `# ${skill.id}`;

    if (!body.includes(expectedTitle)) {
      failures.push(`${file} must include title "${expectedTitle}"`);
    }

    for (const heading of ["## Audience", "## When To Use", "## Architecture Rules", "## Verification"]) {
      if (!body.includes(heading)) {
        failures.push(`${file} must include ${heading}`);
      }
    }
  }

  return failures;
}

function checkStartupReferences() {
  const startupFiles = [
    "AGENTS.md",
    "CLAUDE.md",
    ".agent/instructions.md",
    ".agent/README.md",
    "skills/README.md",
  ];
  const failures = [];

  for (const file of startupFiles) {
    const body = readIfExists(file);

    if (!body) {
      continue;
    }

    for (const skill of requiredSkills) {
      if (!body.includes(skill.path)) {
        failures.push(`${file} must reference ${skill.path}`);
      }
    }
  }

  return failures;
}

function readIfExists(file) {
  const fullPath = path.join(repoRoot, file);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
}

main();
