#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const buildRoot = path.join(repoRoot, "build");

const budgets = [
  { label: "esm entry", file: "esm/index.mjs", maxBytes: 8_000 },
  { label: "cjs entry", file: "cjs/index.cjs", maxBytes: 28_000 },
  {
    label: "esm input component",
    file: "esm/input/NumberInput.mjs",
    maxBytes: 4_000,
  },
  {
    label: "cjs input component",
    file: "cjs/input/NumberInput.cjs",
    maxBytes: 5_000,
  },
  {
    label: "esm runtime total",
    directory: "esm",
    extension: ".mjs",
    maxBytes: 650_000,
  },
  {
    label: "cjs runtime total",
    directory: "cjs",
    extension: ".cjs",
    maxBytes: 730_000,
  },
];

function main() {
  if (!fs.existsSync(buildRoot)) {
    console.error("Build output is missing. Run `npm run build` first.");
    process.exit(1);
  }

  const failures = [];

  for (const budget of budgets) {
    const bytes = budget.file
      ? getFileSize(path.join(buildRoot, budget.file))
      : getRuntimeSize(
          path.join(buildRoot, budget.directory),
          budget.extension
        );

    if (bytes > budget.maxBytes) {
      failures.push(
        `${budget.label}: ${bytes} bytes exceeds ${budget.maxBytes} bytes`
      );
    }
  }

  if (failures.length > 0) {
    console.error(`Bundle budget failed:\n${failures.join("\n")}`);
    process.exit(1);
  }

  console.log(`Bundle budget passed. ${getPhoneProfileSizeSummary()}`);
}

function getFileSize(filePath) {
  return fs.statSync(filePath).size;
}

function getRuntimeSize(directory, extension) {
  return walk(directory)
    .filter((filePath) => filePath.endsWith(extension))
    .reduce((total, filePath) => total + getFileSize(filePath), 0);
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

function getPhoneProfileSizeSummary() {
  const generatedPath = path.join(
    repoRoot,
    "src",
    "phone",
    "generatedPhoneMetadata.ts"
  );

  if (!fs.existsSync(generatedPath)) {
    return "Phone profile sizes unavailable.";
  }

  const generated = fs.readFileSync(generatedPath, "utf8");
  const sizes = [
    ...generated.matchAll(
      /profile: "(lite|mobile|max)"[\s\S]*?sizeHintBytes: (\d+)/g
    ),
  ]
    .map((match) => `${match[1]}=${Math.round(Number(match[2]) / 1024)}KB`)
    .join(", ");

  return sizes
    ? `Phone profile sizes: ${sizes}.`
    : "Phone profile sizes unavailable.";
}

main();
