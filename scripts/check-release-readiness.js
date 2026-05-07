#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const requiredFiles = [
  "AGENTS.md",
  "CLAUDE.md",
  ".agent/instructions.md",
  ".agent/README.md",
  "skills/README.md",
  "scripts/install-agent-skills.js",
  "scripts/check-public-docs.js",
  "README.md",
  "CHANGELOG.md",
  "LICENSE",
  "docs/RELEASE_CHECKLIST.md",
  "docs/README.md",
  "docs/API.md",
  "docs/USAGE.md",
  "docs/INTEGRATION.md",
  "docs/ROADMAP.md",
  "docs/INPUT_ACCEPTANCE.md",
  "docs/ERROR_CONTRACT.md",
  "docs/CURRENCY_REGISTRY.md",
  "skills/common/expo-numerator/SKILL.md",
  "skills/consumer/expo-numerator-consumer/SKILL.md",
  "skills/maintainer/expo-numerator-maintainer/SKILL.md",
  "skills/maintainer/expo-numerator-core/SKILL.md",
  "skills/maintainer/expo-numerator-money-input/SKILL.md",
  "skills/maintainer/expo-numerator-locale-format-parse/SKILL.md",
  "skills/maintainer/expo-numerator-unit/SKILL.md",
  "skills/maintainer/expo-numerator-expo-example/SKILL.md",
  "skills/maintainer/expo-numerator-package-release/SKILL.md",
];

function main() {
  const failures = [
    ...checkPackageMetadata(),
    ...checkLockfileVersion(),
    ...checkRequiredFiles(),
    ...checkPublicDocs(),
    ...checkGitTagVersion(),
    ...checkTarballContents(),
  ];

  if (failures.length > 0) {
    console.error(`Release readiness failed:\n${failures.join("\n")}`);
    process.exit(1);
  }

  console.log(`Release readiness passed for v${packageJson.version}.`);
}

function checkPublicDocs() {
  try {
    execFileSync("node", ["scripts/check-public-docs.js"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: "pipe",
    });
    return [];
  } catch (error) {
    const detail = String(error.stderr || error.stdout || error.message).trim();
    return [`public docs check failed during release readiness: ${detail}`];
  }
}

function checkPackageMetadata() {
  const failures = [];

  if (packageJson.name !== "expo-numerator") {
    failures.push("package name must be expo-numerator");
  }

  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(packageJson.version)) {
    failures.push(`package version is not semver-like: ${packageJson.version}`);
  }

  if (packageJson.private === true) {
    failures.push("package must not be private");
  }

  if (packageJson.license !== "MIT") {
    failures.push("license must remain MIT");
  }

  if (packageJson.sideEffects !== false) {
    failures.push("sideEffects must remain false");
  }

  if (packageJson.repository !== "https://github.com/Madraka/expo-numerator") {
    failures.push("repository metadata must point at Madraka/expo-numerator");
  }

  return failures;
}

function checkLockfileVersion() {
  const rootPackage = packageLock.packages?.[""];
  const failures = [];

  if (packageLock.name !== packageJson.name) {
    failures.push("package-lock name must match package name");
  }

  if (packageLock.version !== packageJson.version) {
    failures.push("package-lock version must match package version");
  }

  if (rootPackage?.version !== packageJson.version) {
    failures.push("package-lock root package version must match package version");
  }

  return failures;
}

function checkRequiredFiles() {
  return requiredFiles
    .filter((file) => !fs.existsSync(path.join(repoRoot, file)))
    .map((file) => `missing release file: ${file}`);
}

function checkGitTagVersion() {
  const tag = process.env.GITHUB_REF_TYPE === "tag"
    ? process.env.GITHUB_REF_NAME
    : process.env.RELEASE_TAG;

  if (!tag) {
    return [];
  }

  const expectedTag = `v${packageJson.version}`;
  return tag === expectedTag
    ? []
    : [`release tag ${tag} must match package version ${expectedTag}`];
}

function checkTarballContents() {
  const output = execFileSync(
    "npm",
    ["pack", "--dry-run", "--json", "--ignore-scripts"],
    {
      cwd: repoRoot,
      encoding: "utf8",
    },
  );
  const jsonStart = output.indexOf("[");

  if (jsonStart === -1) {
    return ["npm pack did not emit JSON output"];
  }

  const [pack] = JSON.parse(output.slice(jsonStart));

  if (!pack?.files) {
    return ["npm pack JSON output is missing file list"];
  }

  const packedFiles = new Set(pack.files.map((file) => file.path));
  const expectedPackedFiles = [
    "AGENTS.md",
    "CLAUDE.md",
    ".agent/instructions.md",
    ".agent/README.md",
    "skills/README.md",
    "scripts/install-agent-skills.js",
    "README.md",
    "CHANGELOG.md",
    "LICENSE",
    "package.json",
    "build/index.d.ts",
    "build/esm/index.mjs",
    "build/cjs/index.cjs",
    "build/esm/money/index.mjs",
    "build/cjs/money/index.cjs",
    "build/input/index.d.ts",
    "docs/RELEASE_CHECKLIST.md",
    "docs/README.md",
    "docs/API.md",
    "docs/USAGE.md",
    "docs/INTEGRATION.md",
    "docs/ROADMAP.md",
    "skills/common/expo-numerator/SKILL.md",
    "skills/consumer/expo-numerator-consumer/SKILL.md",
    "skills/maintainer/expo-numerator-maintainer/SKILL.md",
    "skills/maintainer/expo-numerator-package-release/SKILL.md",
  ];
  const failures = [];

  for (const file of expectedPackedFiles) {
    if (!packedFiles.has(file)) {
      failures.push(`npm pack is missing ${file}`);
    }
  }

  if ([...packedFiles].some((file) => file.startsWith("src/__tests__/"))) {
    failures.push("npm pack must not include src/__tests__");
  }

  if ([...packedFiles].some((file) => file.startsWith("docs/private/"))) {
    failures.push("npm pack must not include docs/private");
  }

  if (packedFiles.has("docs/PHASE_PLAN.md")) {
    failures.push("npm pack must not include docs/PHASE_PLAN.md");
  }

  return failures;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, file), "utf8"));
}

main();
