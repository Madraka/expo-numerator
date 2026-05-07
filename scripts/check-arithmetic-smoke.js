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
    ...checkDecimalArithmetic(numerator),
    ...checkMoneyMinorUnits(numerator),
  ];

  if (failures.length > 0) {
    console.error(`Arithmetic smoke failed:\n${failures.join("\n")}`);
    process.exit(1);
  }

  console.log("Arithmetic smoke passed.");
}

function checkDecimalArithmetic(numerator) {
  return runExpectations("decimal", [
    [
      "large add carry",
      () =>
        numerator.addDecimal("999999999999999999999.99", "0.01").value ===
        "1000000000000000000000.00",
    ],
    [
      "scale preserving add",
      () => numerator.addDecimal("1.20", "2.3").value === "3.50",
    ],
    [
      "negative subtract",
      () => numerator.subtractDecimal("1.20", "2.30").value === "-1.10",
    ],
    [
      "scaled multiply",
      () => numerator.multiplyDecimal("12.30", "3.0").value === "36.900",
    ],
    [
      "rounded divide",
      () => numerator.divideDecimal("2", "3", { scale: 2 }).value === "0.67",
    ],
    [
      "division by zero typed",
      () => {
        try {
          numerator.divideDecimal("1", "0", { scale: 2 });
          return false;
        } catch (error) {
          return error.code === "ARITHMETIC_FAILED";
        }
      },
    ],
  ]);
}

function checkMoneyMinorUnits(numerator) {
  return runExpectations("money", [
    ["minor strict", () => numerator.toMinorUnits("12.34", "USD") === 1234n],
    [
      "minor round half even",
      () =>
        numerator.toMinorUnits("1.225", "USD", {
          roundingMode: "halfEven",
          scalePolicy: "round",
        }) === 122n,
    ],
    [
      "minor strict rejection",
      () => {
        try {
          numerator.toMinorUnits("1.234", "USD");
          return false;
        } catch (error) {
          return error.code === "VALUE_OUT_OF_RANGE";
        }
      },
    ],
    [
      "from minor",
      () => numerator.fromMinorUnits(1234n, "USD").amount === "12.34",
    ],
    [
      "zero minor from minor",
      () => numerator.fromMinorUnits("1234", "JPY").amount === "1234",
    ],
    [
      "allocate minor units",
      () =>
        numerator.allocateMinorUnits(10n, [1, 1, 1]).join("|") === "4|3|3",
    ],
    [
      "allocate money",
      () =>
        numerator
          .allocateMoney(numerator.money("0.10", "USD"), [1, 1, 1])
          .map((share) => share.amount)
          .join("|") === "0.04|0.03|0.03",
    ],
  ]);
}

function runExpectations(group, expectations) {
  const failures = [];

  for (const [label, assertion] of expectations) {
    try {
      if (!assertion()) {
        failures.push(`${group}: ${label}`);
      }
    } catch (error) {
      failures.push(`${group}: ${label} threw ${error.message}`);
    }
  }

  return failures;
}

main();
