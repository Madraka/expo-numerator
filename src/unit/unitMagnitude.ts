import { convertUnit, type UnitConversionOptions } from "./convertUnit";
import type { UnitDimension } from "./unitMeta";
import {
  getPreferredUnitForValue,
  getUnitSystemForLocale,
  type UnitPreferenceOptions,
} from "./unitPreferences";
import { getUnitMeta } from "./unitRegistry";
import { compareDecimal } from "../core/decimal/compareDecimal";
import { NumeratorError } from "../core/errors/NumeratorError";
import type { UnitValue } from "../core/value/types";

export type UnitBestFitOptions = UnitPreferenceOptions &
  UnitConversionOptions & {
    candidates?: readonly string[];
    minimumMagnitude?: string;
    selectionScale?: number;
  };

const metricCandidatesByDimension: Readonly<
  Partial<Record<UnitDimension, readonly string[]>>
> = Object.freeze({
  acceleration: ["meter-per-second-squared", "g-force"],
  angle: ["radian", "degree", "turn"],
  area: [
    "square-millimeter",
    "square-centimeter",
    "square-meter",
    "hectare",
    "square-kilometer",
  ],
  data: ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"],
  density: ["kilogram-per-cubic-meter", "gram-per-cubic-centimeter"],
  "electric-current": ["milliampere", "ampere"],
  "electric-potential": ["millivolt", "volt", "kilovolt"],
  energy: ["joule", "kilojoule", "kilowatt-hour"],
  force: ["newton", "kilonewton"],
  frequency: ["hertz", "kilohertz", "megahertz", "gigahertz"],
  length: [
    "nanometer",
    "micrometer",
    "millimeter",
    "centimeter",
    "meter",
    "kilometer",
  ],
  mass: ["milligram", "gram", "kilogram", "tonne"],
  power: ["watt", "kilowatt", "megawatt"],
  pressure: ["pascal", "kilopascal", "bar"],
  speed: ["meter-per-second", "kilometer-per-hour"],
  time: ["second", "minute", "hour", "day", "week"],
  torque: ["newton-meter"],
  volume: ["milliliter", "liter", "cubic-meter"],
});

const usCandidatesByDimension: Readonly<
  Partial<Record<UnitDimension, readonly string[]>>
> = Object.freeze({
  acceleration: ["foot-per-second-squared", "g-force"],
  angle: ["radian", "degree", "turn"],
  area: ["square-inch", "square-foot", "square-yard", "acre", "square-mile"],
  data: metricCandidatesByDimension.data,
  density: ["pound-per-cubic-foot"],
  "electric-current": metricCandidatesByDimension["electric-current"],
  "electric-potential": metricCandidatesByDimension["electric-potential"],
  energy: ["british-thermal-unit", "kilowatt-hour"],
  force: ["pound-force"],
  frequency: metricCandidatesByDimension.frequency,
  length: ["inch", "foot", "yard", "mile"],
  mass: ["ounce", "pound", "stone"],
  power: ["watt", "kilowatt", "horsepower"],
  pressure: ["torr", "psi", "atmosphere"],
  speed: ["mile-per-hour"],
  time: metricCandidatesByDimension.time,
  torque: ["pound-foot"],
  volume: [
    "teaspoon",
    "tablespoon",
    "fluid-ounce",
    "cup",
    "pint",
    "quart",
    "gallon",
  ],
});

const ukCandidatesByDimension: Readonly<
  Partial<Record<UnitDimension, readonly string[]>>
> = Object.freeze({
  ...metricCandidatesByDimension,
  length: ["inch", "foot", "yard", "mile"],
  speed: ["meter-per-second", "mile-per-hour"],
});

export function getUnitBestFitCandidates(
  dimension: UnitDimension | string,
  options: UnitPreferenceOptions = {},
): readonly string[] {
  const unitSystem =
    options.unitSystem ?? getUnitSystemForLocale(options.locale);
  const candidatesByDimension =
    unitSystem === "us"
      ? usCandidatesByDimension
      : unitSystem === "uk"
        ? ukCandidatesByDimension
        : metricCandidatesByDimension;

  return candidatesByDimension[dimension as UnitDimension] ?? [];
}

export function convertUnitToBestFit(
  value: UnitValue,
  options: UnitBestFitOptions = {},
): UnitValue {
  const sourceMeta = getUnitMeta(value.unit);
  const candidates =
    options.candidates ?? getUnitBestFitCandidates(value.dimension, options);

  if (candidates.length === 0) {
    return convertUnit(
      value,
      getPreferredUnitForValue(value, options),
      options,
    );
  }

  assertCandidateDimensions(sourceMeta.dimension, candidates);

  if (isZero(value.value)) {
    return value;
  }

  const minimumMagnitude = options.minimumMagnitude ?? "1";
  const selectionScale = options.selectionScale ?? 12;
  const orderedCandidates = [...candidates].reverse();

  for (const candidate of orderedCandidates) {
    const convertedForSelection = convertUnit(value, candidate, {
      ...options,
      scale: selectionScale,
    });

    if (
      compareDecimal(
        absDecimalText(convertedForSelection.value),
        minimumMagnitude,
      ) >= 0
    ) {
      return convertUnit(value, candidate, options);
    }
  }

  return convertUnit(value, candidates[0]!, options);
}

function assertCandidateDimensions(
  dimension: UnitDimension | string,
  candidates: readonly string[],
): void {
  for (const candidate of candidates) {
    const candidateMeta = getUnitMeta(candidate);

    if (candidateMeta.dimension !== dimension) {
      throw new NumeratorError("INVALID_UNIT", {
        candidate,
        dimension,
        reason: "Best-fit candidates must share the source dimension.",
      });
    }
  }
}

function absDecimalText(value: string): string {
  return value.startsWith("-") ? value.slice(1) : value;
}

function isZero(value: string): boolean {
  return compareDecimal(absDecimalText(value), "0") === 0;
}
