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
  const results = [
    ...checkValueInvariants(numerator),
    ...checkFormatMatrix(numerator),
    ...checkParseMatrix(numerator),
    ...checkRoundtrips(numerator),
  ];
  const failures = results.filter((result) => !result.ok);

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ checks: results }, null, 2));
  }

  if (failures.length > 0) {
    console.error(
      `Value/format smoke failed:\n${failures
        .map((failure) => `${failure.group}: ${failure.name} ${failure.error ?? "failed"}`)
        .join("\n")}`,
    );
    process.exit(1);
  }

  if (!process.argv.includes("--json")) {
    console.log("Value/format smoke passed.");
  }
}

function checkValueInvariants(numerator) {
  const expectations = [
    ["negative zero", () => numerator.decimal("-0.000").value === "0"],
    [
      "large decimal",
      () =>
        numerator.decimal("999999999999999999999.123456789").value ===
        "999999999999999999999.123456789",
    ],
    ["scale compare", () => numerator.compareDecimal("1.10", "1.1") === 0],
    [
      "add carry",
      () =>
        numerator.addDecimal("999999999999999999999.99", "0.01").value ===
        "1000000000000000000000.00",
    ],
    [
      "multiply scale",
      () => numerator.multiplyDecimal("12.30", "3.0").value === "36.900",
    ],
    [
      "divide scale",
      () => numerator.divideDecimal("2", "3", { scale: 2 }).value === "0.67",
    ],
    ["half even tie", () => numerator.roundDecimal("-1.255", { roundingMode: "halfEven", scale: 2 }).value === "-1.26"],
    ["JPY minor exact", () => numerator.money("1234", "JPY").minor === 1234n],
    ["to minor units", () => numerator.toMinorUnits("12.34", "USD") === 1234n],
    [
      "from minor units",
      () => numerator.fromMinorUnits(1234n, "USD").amount === "12.34",
    ],
    [
      "allocate money",
      () =>
        numerator
          .allocateMoney(numerator.money("0.10", "USD"), [1, 1, 1])
          .map((share) => share.amount)
          .join("|") === "0.04|0.03|0.03",
    ],
    ["JPY fraction no minor", () => numerator.money("1234.56", "JPY").minor === undefined],
    ["UYW four minor", () => numerator.money("1.2345", "UYW").minor === 12345n],
    ["safe decimal failure", () => !numerator.safeDecimal("1e3").ok],
    ["safe unit failure", () => !numerator.safeUnit("1", "unknown-unit").ok],
  ];

  return runExpectations("values", expectations);
}

function checkFormatMatrix(numerator) {
  const expectations = [
    [
      "tr decimal",
      () => numerator.formatNumber("1234567.89", { locale: "tr-TR" }) === "1.234.567,89",
    ],
    [
      "fr decimal spacing",
      () =>
        numerator.formatNumber("1234567.89", { locale: "fr-FR" }) ===
        "1\u202f234\u202f567,89",
    ],
    [
      "compact tr",
      () =>
        numerator.formatNumber("1200000", {
          locale: "tr-TR",
          notation: "compact",
        }) === "1,2\u00a0Mn",
    ],
    [
      "engineering",
      () =>
        numerator.formatNumber("12345.678", {
          maximumFractionDigits: 3,
          notation: "engineering",
        }) === "12.346E3",
    ],
    [
      "scientific rounding rollover",
      () =>
        numerator.formatNumber("999.95", {
          maximumFractionDigits: 1,
          notation: "scientific",
        }) === "1.0E3",
    ],
    [
      "engineering rounding rollover",
      () =>
        numerator.formatNumber("999500", {
          maximumFractionDigits: 0,
          notation: "engineering",
        }) === "1E6",
    ],
    [
      "accounting money",
      () =>
        numerator.formatMoney(numerator.money("-1234.56", "USD"), {
          currencySign: "accounting",
          locale: "en-US",
        }) === "($1,234.56)",
    ],
    [
      "currency suffix",
      () =>
        numerator.formatMoney(numerator.money("1234.56", "EUR"), {
          locale: "de-DE",
        }) === "1.234,56\u00a0€",
    ],
    [
      "zero-minor money",
      () =>
        numerator.formatMoney(numerator.money("1234", "JPY"), {
          locale: "ja-JP",
        }) === "¥1,234",
    ],
    [
      "money format registry scale",
      () =>
        numerator.formatMoney(
          {
            amount: "1234.56",
            currency: "JPY",
            kind: "money",
            minor: undefined,
            scale: 2,
          },
          { locale: "ja-JP" },
        ) === "¥1,235",
    ],
    [
      "percent affix",
      () =>
        numerator.formatPercent(numerator.percent("0.125"), {
          locale: "de-DE",
          maximumFractionDigits: 1,
        }) === "12,5\u00a0%",
    ],
    [
      "unit locale",
      () =>
        numerator.formatUnitForLocale(numerator.unit("1", "bar"), {
          locale: "en-US",
          scale: 4,
        }) === "14.5038 psi",
    ],
    [
      "unit best-fit",
      () =>
        numerator.formatUnitBestFit(numerator.unit("1500", "meter"), {
          scale: 1,
        }) === "1.5 km",
    ],
    [
      "parts compact",
      () =>
        numerator
          .formatNumberToParts("1234", { locale: "en-US", notation: "compact" })
          .some((part) => part.type === "compact" && part.value === "K"),
    ],
    [
      "parts scientific rollover",
      () =>
        numerator
          .formatNumberToParts("999.95", {
            locale: "en-US",
            maximumFractionDigits: 1,
            notation: "scientific",
          })
          .map((part) => `${part.type}:${part.value}`)
          .join("|") ===
        "integer:1|decimal:.|fraction:0|exponentSeparator:E|exponentInteger:3",
    ],
  ];

  return runExpectations("format", expectations);
}

function checkParseMatrix(numerator) {
  const expectations = [
    [
      "percent prefix fallback",
      () =>
        numerator.parsePercent("%12.5", { locale: "en-US" }).value === "0.125",
    ],
    [
      "percent regular-space suffix fallback",
      () =>
        numerator.parsePercent("12,5 %", { locale: "de-DE" }).value ===
        "0.125",
    ],
    [
      "percent misplaced marker",
      () => {
        const result = numerator.safeParsePercent("12%5", {
          locale: "en-US",
        });

        return !result.ok && result.error.code === "INVALID_PERCENT";
      },
    ],
    [
      "percent duplicate marker",
      () => {
        const result = numerator.safeParsePercent("12%%", {
          locale: "en-US",
        });

        return !result.ok && result.error.code === "INVALID_PERCENT";
      },
    ],
  ];

  return runExpectations("parse", expectations);
}

function checkRoundtrips(numerator) {
  const locales = ["en-US", "tr-TR", "de-DE", "fr-FR", "en-IN", "ja-JP"];
  const results = [];

  for (const locale of locales) {
    const formatted = numerator.formatNumber("1234567.89", { locale });
    const parsed = numerator.safeParseNumber(formatted, { locale });
    const parsedValue = parsed.ok ? parsed.value.value : parsed.error.code;

    results.push({
      group: "roundtrip",
      name: locale,
      ok: parsed.ok && parsed.value.value === "1234567.89",
      formatted,
      parsed: parsedValue,
    });
  }

  return results;
}

function runExpectations(group, expectations) {
  const results = [];

  for (const [label, assertion] of expectations) {
    try {
      results.push({
        group,
        name: label,
        ok: Boolean(assertion()),
      });
    } catch (error) {
      results.push({
        group,
        name: label,
        ok: false,
        error: `threw ${error.message}`,
      });
    }
  }

  return results;
}

main();
