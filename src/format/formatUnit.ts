import { formatNumber } from "./formatNumber";
import type { NumberFormatOptions } from "./formatOptions";
import { compareDecimal } from "../core/decimal/compareDecimal";
import type { UnitValue } from "../core/value/types";
import {
  convertUnitToBestFit,
  type UnitBestFitOptions,
} from "../unit/unitMagnitude";
import type { UnitDisplay } from "../unit/unitMeta";
import {
  convertUnitForLocale,
  type UnitLocaleConversionOptions,
} from "../unit/unitPreferences";
import { getUnitLabels } from "../unit/unitRegistry";
import { getUnitValueMeta } from "../unit/unitValueIntegrity";

export type UnitFormatOptions = NumberFormatOptions & {
  unitDisplay?: UnitDisplay;
};

export type UnitLocaleFormatOptions = UnitFormatOptions &
  UnitLocaleConversionOptions;

export type UnitBestFitFormatOptions = UnitFormatOptions & UnitBestFitOptions;

export function formatUnit(
  value: UnitValue,
  options: UnitFormatOptions = {},
): string {
  const display = options.unitDisplay ?? "short";
  const formattedValue = formatNumber(value.value, options);
  const label = getUnitDisplayLabel(value, display, options.locale);

  return `${formattedValue} ${label}`;
}

export function formatUnitForLocale(
  value: UnitValue,
  options: UnitLocaleFormatOptions = {},
): string {
  return formatUnit(convertUnitForLocale(value, options), options);
}

export function formatUnitBestFit(
  value: UnitValue,
  options: UnitBestFitFormatOptions = {},
): string {
  return formatUnit(convertUnitToBestFit(value, options), options);
}

function getUnitDisplayLabel(
  value: UnitValue,
  display: UnitDisplay,
  locale?: string,
): string {
  const meta = getUnitValueMeta(value);

  if (display === "code") {
    return meta.code;
  }

  const labels = getUnitLabels(meta.code, locale);

  if (display === "long") {
    return compareDecimal(value.value.replace(/^-/, ""), "1") === 0
      ? labels.long.one
      : labels.long.other;
  }

  return labels[display];
}
