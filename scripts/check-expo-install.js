#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const mode = process.argv[2] ?? "root";
const cwd = mode === "example" ? path.join(repoRoot, "example") : repoRoot;
const allowRootTypeScriptLatest =
  mode === "root" && process.argv.includes("--allow-typescript-latest");

const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["expo", "install", "--check", "--json"],
  {
    cwd,
    encoding: "utf8",
  },
);

const output = result.stdout.trim();
let report;

try {
  report = JSON.parse(output);
} catch {
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}

const dependencies = Array.isArray(report.dependencies)
  ? report.dependencies
  : [];
const remaining = allowRootTypeScriptLatest
  ? dependencies.filter((dependency) => dependency.packageName !== "typescript")
  : dependencies;

if (remaining.length > 0 || (!allowRootTypeScriptLatest && !report.upToDate)) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exit(result.status === 0 ? 1 : result.status);
}

if (allowRootTypeScriptLatest && dependencies.length !== remaining.length) {
  process.stdout.write(
    `${JSON.stringify(
      {
        ...report,
        dependencies: remaining,
        note: "Root package intentionally allows TypeScript latest; Expo SDK 55 app check remains strict in example.",
        upToDate: true,
      },
      null,
      2,
    )}\n`,
  );
  process.exit(0);
}

process.stdout.write(`${JSON.stringify(report)}\n`);
