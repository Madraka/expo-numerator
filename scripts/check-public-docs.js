#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const requiredDocs = [
  "README.md",
  "docs/README.md",
  "docs/API.md",
  "docs/USAGE.md",
  "docs/INTEGRATION.md",
  "docs/ERROR_CONTRACT.md",
  "docs/CURRENCY_REGISTRY.md",
  "docs/INPUT_ACCEPTANCE.md",
  "docs/ROADMAP.md",
];
const requiredReadmeLinks = [
  "docs/README.md",
  "docs/API.md",
  "docs/USAGE.md",
  "docs/INTEGRATION.md",
  "docs/ERROR_CONTRACT.md",
  "docs/CURRENCY_REGISTRY.md",
  "docs/INPUT_ACCEPTANCE.md",
  "docs/ROADMAP.md",
  "docs/RELEASE_CHECKLIST.md",
  "skills/README.md",
];
const publicSubpaths = [
  "expo-numerator/core",
  "expo-numerator/money",
  "expo-numerator/rounding",
  "expo-numerator/locale",
  "expo-numerator/format",
  "expo-numerator/parse",
  "expo-numerator/unit",
  "expo-numerator/input",
  "expo-numerator/expo",
];
const consumerDocs = [
  "README.md",
  "docs/README.md",
  "docs/API.md",
  "docs/USAGE.md",
  "docs/INTEGRATION.md",
];

function main() {
  const failures = [
    ...checkRequiredDocs(),
    ...checkReadmeLinks(),
    ...checkDocsIndex(),
    ...checkApiReference(),
    ...checkConsumerDocs(),
    ...checkPrivateDocsPolicy(),
  ];

  if (failures.length > 0) {
    console.error(`Public docs check failed:\n${failures.join("\n")}`);
    process.exit(1);
  }

  console.log("Public docs check passed.");
}

function checkPrivateDocsPolicy() {
  const failures = [];
  const forbiddenPublicDocs = [
    "docs/PHASE_PLAN.md",
    "docs/private/PHASE_PLAN.md",
  ];

  for (const file of ["README.md", "docs/README.md", "docs/API.md", "docs/USAGE.md", "docs/INTEGRATION.md"]) {
    const body = read(file);

    for (const forbidden of forbiddenPublicDocs) {
      if (body.includes(forbidden)) {
        failures.push(`${file} must not link private planning file ${forbidden}`);
      }
    }
  }

  return failures;
}

function checkRequiredDocs() {
  return requiredDocs
    .filter((file) => !fs.existsSync(path.join(repoRoot, file)))
    .map((file) => `missing public documentation file: ${file}`);
}

function checkReadmeLinks() {
  const readme = read("README.md");

  return requiredReadmeLinks
    .filter((link) => !readme.includes(link))
    .map((link) => `README.md must link ${link}`);
}

function checkDocsIndex() {
  const index = read("docs/README.md");

  return ["API.md", "USAGE.md", "INTEGRATION.md"]
    .filter((link) => !index.includes(link))
    .map((link) => `docs/README.md must link ${link}`);
}

function checkApiReference() {
  const api = read("docs/API.md");
  const failures = [];

  for (const subpath of publicSubpaths) {
    if (!api.includes(subpath)) {
      failures.push(`docs/API.md must document ${subpath}`);
    }
  }

  for (const heading of [
    "## Root Facade",
    "## Value Constructors",
    "## Money",
    "## Input",
    "## Expo",
  ]) {
    if (!api.includes(heading)) {
      failures.push(`docs/API.md must include ${heading}`);
    }
  }

  return failures;
}

function checkConsumerDocs() {
  const failures = [];

  for (const file of consumerDocs) {
    const body = read(file);

    if (/\bsrc\//.test(body)) {
      failures.push(`${file} must not document internal source paths`);
    }

    if (/\bbuild\//.test(body)) {
      failures.push(`${file} must not document generated build paths`);
    }
  }

  return failures;
}

function read(file) {
  return fs.readFileSync(path.join(repoRoot, file), "utf8");
}

main();
