import { convertUnit, type UnitConversionOptions } from "./convertUnit";
import type { UnitDimension } from "./unitMeta";
import { getUnitMeta } from "./unitRegistry";
import { NumeratorError } from "../core/errors/NumeratorError";
import type { UnitValue } from "../core/value/types";

export type UnitSystem = "metric" | "uk" | "us";

export type UnitPreferenceOptions = {
  locale?: string;
  unitSystem?: UnitSystem;
};

export type UnitLocaleConversionOptions = UnitPreferenceOptions &
  UnitConversionOptions;

const unitSystemByRegion: Readonly<Record<string, UnitSystem>> = Object.freeze({
  GB: "uk",
  LR: "us",
  MM: "us",
  US: "us",
});

const preferredUnitsBySystem: Readonly<
  Record<UnitSystem, Readonly<Record<UnitDimension, string>>>
> = Object.freeze({
  metric: Object.freeze({
    acceleration: "meter-per-second-squared",
    angle: "degree",
    area: "square-meter",
    data: "megabyte",
    density: "kilogram-per-cubic-meter",
    "electric-current": "ampere",
    "electric-potential": "volt",
    energy: "kilowatt-hour",
    force: "newton",
    frequency: "hertz",
    length: "kilometer",
    mass: "kilogram",
    power: "kilowatt",
    pressure: "bar",
    speed: "kilometer-per-hour",
    temperature: "celsius",
    time: "second",
    torque: "newton-meter",
    volume: "liter",
  }),
  uk: Object.freeze({
    acceleration: "meter-per-second-squared",
    angle: "degree",
    area: "square-meter",
    data: "megabyte",
    density: "kilogram-per-cubic-meter",
    "electric-current": "ampere",
    "electric-potential": "volt",
    energy: "kilowatt-hour",
    force: "newton",
    frequency: "hertz",
    length: "mile",
    mass: "kilogram",
    power: "kilowatt",
    pressure: "bar",
    speed: "mile-per-hour",
    temperature: "celsius",
    time: "second",
    torque: "newton-meter",
    volume: "liter",
  }),
  us: Object.freeze({
    acceleration: "foot-per-second-squared",
    angle: "degree",
    area: "acre",
    data: "megabyte",
    density: "pound-per-cubic-foot",
    "electric-current": "ampere",
    "electric-potential": "volt",
    energy: "kilowatt-hour",
    force: "pound-force",
    frequency: "hertz",
    length: "mile",
    mass: "pound",
    power: "horsepower",
    pressure: "psi",
    speed: "mile-per-hour",
    temperature: "fahrenheit",
    time: "second",
    torque: "pound-foot",
    volume: "gallon",
  }),
});

export function getUnitSystemForLocale(locale?: string): UnitSystem {
  if (!locale) {
    return "metric";
  }

  const region = getLocaleRegion(locale);
  return region ? (unitSystemByRegion[region] ?? "metric") : "metric";
}

export function getPreferredUnitForDimension(
  dimension: UnitDimension | string,
  options: UnitPreferenceOptions = {},
): string {
  const unitSystem =
    options.unitSystem ?? getUnitSystemForLocale(options.locale);
  const preferredUnit =
    preferredUnitsBySystem[unitSystem][dimension as UnitDimension];

  if (preferredUnit === undefined) {
    throw new NumeratorError("INVALID_UNIT", {
      dimension,
      reason: "No preferred unit is registered for this dimension.",
      unitSystem,
    });
  }

  return preferredUnit;
}

export function getPreferredUnitForValue(
  value: UnitValue,
  options: UnitPreferenceOptions = {},
): string {
  return getPreferredUnitForDimension(value.dimension, options);
}

export function convertUnitForLocale(
  value: UnitValue,
  options: UnitLocaleConversionOptions = {},
): UnitValue {
  const targetUnit = getPreferredUnitForValue(value, options);
  const sourceMeta = getUnitMeta(value.unit);
  const targetMeta = getUnitMeta(targetUnit);

  if (sourceMeta.code === targetMeta.code) {
    return value;
  }

  return convertUnit(value, targetMeta.code, options);
}

function getLocaleRegion(locale: string): string | null {
  const normalized = locale.replace(/_/g, "-");
  const parts = normalized.split("-");

  for (let index = parts.length - 1; index >= 1; index -= 1) {
    const part = parts[index];

    if (/^[A-Za-z]{2}$/.test(part) || /^\d{3}$/.test(part)) {
      return part.toUpperCase();
    }
  }

  return null;
}
