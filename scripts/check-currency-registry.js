#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const packageEntry = path.join(repoRoot, "build/cjs/index.cjs");

function main() {
  if (!fs.existsSync(packageEntry)) {
    console.error("Build output is missing. Run `npm run build` first.");
    process.exit(1);
  }

  const numerator = require(packageEntry);
  const failures = [
    ...checkRegistryShape(numerator),
    ...checkRequiredCurrencies(numerator),
    ...checkRuntimeSmokes(numerator),
  ];

  if (failures.length > 0) {
    console.error(`Currency registry check failed:\n${failures.join("\n")}`);
    process.exit(1);
  }

  console.log("Currency registry check passed.");
}

function checkRegistryShape(numerator) {
  const failures = [];
  const currencies = numerator.getRegisteredCurrencies();
  const codes = new Set();
  const numericCodes = new Map();

  if (currencies.length < 150) {
    failures.push(`expected at least 150 currencies, received ${currencies.length}`);
  }

  for (const meta of currencies) {
    if (!/^[A-Z]{3,5}$/.test(meta.code)) {
      failures.push(`invalid currency code: ${meta.code}`);
    }

    if (codes.has(meta.code)) {
      failures.push(`duplicate currency code: ${meta.code}`);
    }

    codes.add(meta.code);

    if (!Number.isInteger(meta.minorUnit) || meta.minorUnit < 0 || meta.minorUnit > 4) {
      failures.push(`invalid ISO minor unit for ${meta.code}: ${meta.minorUnit}`);
    }

    if (typeof meta.numeric === "string") {
      if (!/^\d{3}$/.test(meta.numeric)) {
        failures.push(`invalid numeric code for ${meta.code}: ${meta.numeric}`);
      }

      const existingCode = numericCodes.get(meta.numeric);

      if (existingCode !== undefined && existingCode !== meta.code) {
        failures.push(
          `duplicate numeric code ${meta.numeric}: ${existingCode} vs ${meta.code}`,
        );
      }

      numericCodes.set(meta.numeric, meta.code);
    }

    if (numerator.getCurrencyMeta(meta.code).code !== meta.code) {
      failures.push(`canonical lookup failed for ${meta.code}`);
    }
  }

  return failures;
}

function checkRequiredCurrencies(numerator) {
  const expectations = [
    ["USD", "840", 2],
    ["TRY", "949", 2],
    ["EUR", "978", 2],
    ["JPY", "392", 0],
    ["KRW", "410", 0],
    ["CLP", "152", 0],
    ["VND", "704", 0],
    ["KWD", "414", 3],
    ["BHD", "048", 3],
    ["OMR", "512", 3],
    ["JOD", "400", 3],
    ["TND", "788", 3],
    ["UYW", "927", 4],
    ["XAF", "950", 0],
    ["XOF", "952", 0],
    ["XPF", "953", 0],
  ];

  const failures = [];

  for (const [code, numeric, minorUnit] of expectations) {
    try {
      const meta = numerator.getCurrencyMeta(code);

      if (meta.numeric !== numeric || meta.minorUnit !== minorUnit) {
        failures.push(
          `${code} expected numeric ${numeric} minor ${minorUnit}, received ${meta.numeric} minor ${meta.minorUnit}`,
        );
      }
    } catch (error) {
      failures.push(`${code} lookup threw ${error.message}`);
    }
  }

  return failures;
}

function checkRuntimeSmokes(numerator) {
  const failures = [];
  const expectations = [
    ["zero-minor JPY", () => numerator.money("1234", "JPY").minor === 1234n],
    [
      "zero-minor rejects fraction as minor",
      () => numerator.money("1234.56", "JPY").minor === undefined,
    ],
    ["three-minor KWD", () => numerator.money("1.234", "KWD").minor === 1234n],
    ["four-minor UYW", () => numerator.money("1.2345", "UYW").minor === 12345n],
    ["case-insensitive lookup", () => numerator.money("1", "try").currency === "TRY"],
    [
      "symbol mismatch",
      () => !numerator.safeParseMoney("¥1", { currency: "CNY", locale: "en-US" }).ok,
    ],
    [
      "common symbol parse",
      () =>
        numerator.safeParseMoney("A$1.00", { currency: "AUD", locale: "en-US" }).ok,
    ],
  ];

  for (const [label, assertion] of expectations) {
    try {
      if (!assertion()) {
        failures.push(`${label} failed`);
      }
    } catch (error) {
      failures.push(`${label} threw ${error.message}`);
    }
  }

  return failures;
}

main();
