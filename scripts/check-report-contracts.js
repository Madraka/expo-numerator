#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const packageEntry = path.join(repoRoot, "build/cjs/index.cjs");

function main() {
  if (!fs.existsSync(packageEntry)) {
    console.error("Build output is missing. Run `npm run build` first.");
    process.exit(1);
  }

  const failures = [
    ...checkValueFormatReport(),
    ...checkInputReplayReport(),
  ];

  if (failures.length > 0) {
    console.error(`Report contract check failed:\n${failures.join("\n")}`);
    process.exit(1);
  }

  console.log("Report contracts passed.");
}

function checkValueFormatReport() {
  const failures = [];
  const report = runJsonScript("scripts/check-value-format-smoke.js");
  const checks = Array.isArray(report.checks) ? report.checks : [];
  const groups = new Set(checks.map((check) => check.group));

  if (checks.length < 25) {
    failures.push(`value-format report expected at least 25 checks, received ${checks.length}`);
  }

  for (const group of ["values", "format", "roundtrip"]) {
    if (!groups.has(group)) {
      failures.push(`value-format report missing group: ${group}`);
    }
  }

  for (const check of checks) {
    if (typeof check.name !== "string" || check.name.length === 0) {
      failures.push("value-format report contains a check without a name");
    }

    if (check.ok !== true) {
      failures.push(`value-format check failed in report: ${check.group}/${check.name}`);
    }
  }

  return failures;
}

function checkInputReplayReport() {
  const failures = [];
  const report = runJsonScript("scripts/input-replay-smoke.js");
  const scenarios = Array.isArray(report.scenarios) ? report.scenarios : [];
  const profileTypes = new Set(
    scenarios
      .map((scenario) => scenario.profile?.type)
      .filter((type) => typeof type === "string"),
  );

  if (report.selectors?.input !== "expo-numerator-amount-input") {
    failures.push("input replay report has an unexpected input selector");
  }

  if (scenarios.length < 10) {
    failures.push(`input replay report expected at least 10 scenarios, received ${scenarios.length}`);
  }

  for (const type of ["money", "percent", "integer", "unit"]) {
    if (!profileTypes.has(type)) {
      failures.push(`input replay report missing profile type: ${type}`);
    }
  }

  for (const scenario of scenarios) {
    if (typeof scenario.name !== "string" || scenario.name.length === 0) {
      failures.push("input replay report contains a scenario without a name");
    }

    if (!deepEqualJson(scenario.actual, scenario.expected)) {
      failures.push(`input replay scenario actual/expected drift: ${scenario.name}`);
    }
  }

  return failures;
}

function runJsonScript(scriptPath) {
  const output = execFileSync(process.execPath, [scriptPath, "--json"], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  return JSON.parse(output);
}

function deepEqualJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

main();
