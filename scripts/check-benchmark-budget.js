#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

const minimumOperationsPerSecond = new Map([
  ["decimal normalize", 20_000],
  ["round scale=2", 10_000],
  ["decimal add", 10_000],
  ["decimal divide scale=6", 5_000],
  ["format tr-TR", 5_000],
  ["parse tr-TR", 5_000],
]);

function main() {
  const report = runBenchmarkReport();
  const results = Array.isArray(report.results) ? report.results : [];
  const failures = [];
  const resultNames = new Set(results.map((result) => result.name));

  if (report.iterations !== 5_000) {
    failures.push(`benchmark iteration count drifted: ${report.iterations}`);
  }

  for (const [name, minimum] of minimumOperationsPerSecond) {
    if (!resultNames.has(name)) {
      failures.push(`benchmark report missing result: ${name}`);
      continue;
    }

    const result = results.find((entry) => entry.name === name);

    if (!Number.isFinite(result.operationsPerSecond)) {
      failures.push(`${name} produced a non-finite operationsPerSecond value`);
      continue;
    }

    if (result.operationsPerSecond < minimum) {
      failures.push(
        `${name} below budget: ${result.operationsPerSecond.toFixed(0)} ops/sec < ${minimum} ops/sec`,
      );
    }
  }

  if (failures.length > 0) {
    console.error(`Benchmark budget failed:\n${failures.join("\n")}`);
    process.exit(1);
  }

  console.log("Benchmark budget passed.");
}

function runBenchmarkReport() {
  const output = execFileSync(process.execPath, ["scripts/benchmark.js", "--json"], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  return JSON.parse(output);
}

main();
