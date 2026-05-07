#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const repoRoot = path.resolve(__dirname, "..");
const sourceRoot = path.join(repoRoot, "src");
const benchmarkBuildRoot = path.join(
  repoRoot,
  `.benchmark-build-${process.pid}`,
);

transpileSourcesForBenchmark();
process.on("exit", () => {
  fs.rmSync(benchmarkBuildRoot, { force: true, recursive: true });
});

const {
  addDecimal,
  decimal,
  divideDecimal,
  formatNumber,
  parseNumber,
  roundDecimal,
} = require(path.join(benchmarkBuildRoot, "index.js"));

const iterations = 5_000;
const emitJson = process.argv.includes("--json");
const samples = [
  "123456789.12345",
  "-999999999999999.555",
  "0.00000000012345",
  "1000000000000000000000000.01",
];

function main() {
  const results = [
    bench("decimal normalize", () => {
      for (const sample of samples) {
        decimal(sample);
      }
    }),
    bench("round scale=2", () => {
      for (const sample of samples) {
        roundDecimal(sample, { scale: 2, roundingMode: "halfEven" });
      }
    }),
    bench("decimal add", () => {
      addDecimal("999999999999999999999.99", "0.01");
      addDecimal("-123456789.12345", "987654321.98765");
    }),
    bench("decimal divide scale=6", () => {
      divideDecimal("2", "3", { scale: 6 });
      divideDecimal("22", "7", { scale: 6 });
    }),
    bench("format tr-TR", () => {
      for (const sample of samples) {
        formatNumber(sample, { locale: "tr-TR", maximumFractionDigits: 3 });
      }
    }),
    bench("parse tr-TR", () => {
      parseNumber("1.234.567,89", { locale: "tr-TR" });
      parseNumber("-999.999,55", { locale: "tr-TR" });
    }),
  ];

  if (emitJson) {
    console.log(JSON.stringify({ iterations, results }, null, 2));
    return;
  }

  for (const result of results) {
    console.log(
      `${result.name}: ${result.operationsPerSecond.toFixed(0)} ops/sec`,
    );
  }
}

function bench(name, callback) {
  const startedAt = process.hrtime.bigint();

  for (let index = 0; index < iterations; index += 1) {
    callback();
  }

  const durationNs = Number(process.hrtime.bigint() - startedAt);
  const operations = iterations;
  const operationsPerSecond = operations / (durationNs / 1_000_000_000);

  return { name, operationsPerSecond };
}

main();

function transpileSourcesForBenchmark() {
  fs.rmSync(benchmarkBuildRoot, { force: true, recursive: true });

  for (const sourcePath of walk(sourceRoot)) {
    if (!/\.(ts|tsx)$/.test(sourcePath) || sourcePath.includes("__tests__")) {
      continue;
    }

    const relativePath = path.relative(sourceRoot, sourcePath);
    const outputPath = path
      .join(benchmarkBuildRoot, relativePath)
      .replace(/\.(ts|tsx)$/, ".js");
    const source = fs.readFileSync(sourcePath, "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        jsx: ts.JsxEmit.React,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
      fileName: sourcePath,
    }).outputText;

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, output);
  }
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}
