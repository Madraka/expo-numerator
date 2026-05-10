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
    ...checkAliasOwnership(numerator),
    ...checkPreferenceTables(numerator),
    ...checkBestFitTables(numerator),
    ...checkRuntimeSmokes(numerator),
  ];

  if (failures.length > 0) {
    console.error(`Unit registry check failed:\n${failures.join("\n")}`);
    process.exit(1);
  }

  console.log("Unit registry check passed.");
}

function checkAliasOwnership(numerator) {
  const failures = [];
  const aliasOwners = new Map();

  for (const meta of numerator.getRegisteredUnits()) {
    if (numerator.getUnitMeta(meta.code).code !== meta.code) {
      failures.push(`canonical lookup failed for ${meta.code}`);
    }

    for (const alias of numerator.getUnitAliases(meta.code)) {
      const normalizedAlias = normalizeAlias(alias);

      if (normalizedAlias.length === 0) {
        continue;
      }

      const existingOwner = aliasOwners.get(normalizedAlias);

      if (existingOwner !== undefined && existingOwner !== meta.code) {
        failures.push(
          `alias collision "${normalizedAlias}": ${existingOwner} vs ${meta.code}`,
        );
      }

      aliasOwners.set(normalizedAlias, meta.code);
    }
  }

  return failures;
}

function checkPreferenceTables(numerator) {
  const failures = [];
  const dimensions = getRegisteredDimensions(numerator);
  const unitSystems = ["metric", "uk", "us"];

  for (const dimension of dimensions) {
    for (const unitSystem of unitSystems) {
      const preferredUnit = numerator.getPreferredUnitForDimension(dimension, {
        unitSystem,
      });
      const preferredMeta = numerator.getUnitMeta(preferredUnit);

      if (preferredMeta.dimension !== dimension) {
        failures.push(
          `${unitSystem} preference for ${dimension} points to ${preferredUnit} (${preferredMeta.dimension})`,
        );
      }
    }
  }

  return failures;
}

function checkBestFitTables(numerator) {
  const failures = [];
  const dimensions = getRegisteredDimensions(numerator);
  const unitSystems = ["metric", "uk", "us"];

  for (const dimension of dimensions) {
    for (const unitSystem of unitSystems) {
      const preferredUnit = numerator.getPreferredUnitForDimension(dimension, {
        unitSystem,
      });

      for (const candidate of numerator.getUnitBestFitCandidates(dimension, {
        unitSystem,
      })) {
        const candidateMeta = numerator.getUnitMeta(candidate);

        if (candidateMeta.dimension !== dimension) {
          failures.push(
            `${unitSystem} best-fit candidate ${candidate} for ${dimension} has ${candidateMeta.dimension}`,
          );
        }

        if (!numerator.canConvertUnit(candidate, preferredUnit)) {
          failures.push(
            `${unitSystem} best-fit candidate ${candidate} cannot convert to preference ${preferredUnit}`,
          );
        }
      }
    }
  }

  return failures;
}

function checkRuntimeSmokes(numerator) {
  const failures = [];
  const expectations = [
    ["gram alias", () => numerator.unit("1", "g").unit === "gram"],
    ["g-force alias", () => numerator.unit("1", "g0").unit === "g-force"],
    ["knot alias", () => numerator.parseUnit("1 kt").unit === "knot"],
    [
      "kilonewton alias",
      () => numerator.parseUnit("1 kN").unit === "kilonewton",
    ],
    ["nanometer alias", () => numerator.unit("1", "nm").unit === "nanometer"],
    [
      "newton-meter alias",
      () => numerator.unit("1", "N m").unit === "newton-meter",
    ],
    [
      "metric best-fit length",
      () =>
        numerator.convertUnitToBestFit(numerator.unit("1500", "meter"), {
          scale: 2,
        }).unit === "kilometer",
    ],
    [
      "us best-fit length",
      () =>
        numerator.convertUnitToBestFit(numerator.unit("1609.344", "meter"), {
          scale: 2,
          unitSystem: "us",
        }).unit === "mile",
    ],
    [
      "unit value dimension guard",
      () =>
        !numerator.safeUnit("1", "unknown-unit").ok &&
        throwsInvalidUnit(() =>
          numerator.formatUnit({
            dimension: "mass",
            kind: "unit",
            unit: "kilometer",
            value: "1",
          }),
        ),
    ],
    [
      "parse unit fallback dimension guard",
      () =>
        throwsInvalidUnit(() =>
          numerator.parseUnit("1500", {
            dimension: "length",
            unit: "kilogram",
          }),
        ),
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

function throwsInvalidUnit(operation) {
  try {
    operation();
    return false;
  } catch (error) {
    return error?.code === "INVALID_UNIT";
  }
}

function getRegisteredDimensions(numerator) {
  return new Set(
    numerator
      .getRegisteredUnits()
      .map((registeredUnit) => registeredUnit.dimension),
  );
}

function normalizeAlias(value) {
  return value.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
}

main();
