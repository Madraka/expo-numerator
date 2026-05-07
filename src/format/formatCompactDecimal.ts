import { multiplyDecimalByPowerOfTen } from "./decimalMath";
import { formatDecimalString } from "./formatDecimalString";
import type { NumberFormatOptions } from "./formatOptions";
import { compareDecimal } from "../core/decimal/compareDecimal";
import { normalizeDecimal } from "../core/decimal/normalizeDecimal";
import type { DecimalInput } from "../core/value/types";
import type {
  CompactAffixPattern,
  CompactPowerPattern,
} from "../locale/localeRegistry";
import { getLocaleSymbols } from "../locale/resolveLocale";
import { roundDecimal } from "../rounding/roundDecimal";

export function formatCompactDecimal(
  value: DecimalInput,
  options: NumberFormatOptions = {},
): string {
  const symbols = getLocaleSymbols({ locale: options.locale });
  const patterns =
    symbols.compactPatterns?.[options.compactDisplay ?? "short"] ?? [];
  const normalized = normalizeDecimal(value);

  if (normalized.sign === 0) {
    return formatDecimalString(normalized, options);
  }

  const exponent = getMagnitudeExponent(normalized.value);
  const pattern = selectCompactPattern(patterns, exponent);

  if (!pattern) {
    return formatDecimalString(value, options);
  }

  return formatWithPattern(value, options, pattern, patterns);
}

function formatWithPattern(
  value: DecimalInput,
  options: NumberFormatOptions,
  pattern: CompactPowerPattern,
  patterns: readonly CompactPowerPattern[],
): string {
  const scaled = multiplyDecimalByPowerOfTen(value, -pattern.divisorPower);
  const scale = getCompactScale(scaled, options);
  const rounded = roundDecimal(scaled, {
    scale,
    roundingMode: options.roundingMode,
  });
  const rolloverPattern = getRolloverPattern(rounded.value, pattern, patterns);

  if (rolloverPattern) {
    return formatWithPattern(value, options, rolloverPattern, patterns);
  }

  const affix = getCompactAffix(pattern, rounded.value);
  const formatted = formatDecimalString(rounded, {
    ...options,
    maximumFractionDigits: scale,
    trailingZeroDisplay: options.trailingZeroDisplay ?? "stripIfInteger",
    useGrouping: false,
  });

  return `${affix.prefix ?? ""}${formatted}${affix.suffix ?? ""}`;
}

function getCompactScale(
  scaledValue: DecimalInput,
  options: NumberFormatOptions,
): number {
  if (options.maximumFractionDigits !== undefined) {
    return options.maximumFractionDigits;
  }

  const defaultScale = getIntegerDigitCount(scaledValue) <= 1 ? 1 : 0;
  return Math.max(options.minimumFractionDigits ?? 0, defaultScale);
}

function getRolloverPattern(
  roundedValue: string,
  pattern: CompactPowerPattern,
  patterns: readonly CompactPowerPattern[],
): CompactPowerPattern | null {
  const nextPattern = patterns.find(
    (candidate) => candidate.divisorPower > pattern.divisorPower,
  );

  if (!nextPattern) {
    return null;
  }

  const divisorGap = nextPattern.divisorPower - pattern.divisorPower;
  const threshold = `1${"0".repeat(divisorGap)}`;
  const absoluteRounded = roundedValue.startsWith("-")
    ? roundedValue.slice(1)
    : roundedValue;

  return compareDecimal(absoluteRounded, threshold) >= 0 ? nextPattern : null;
}

function selectCompactPattern(
  patterns: readonly CompactPowerPattern[],
  exponent: number,
): CompactPowerPattern | null {
  let selected: CompactPowerPattern | null = null;

  for (const pattern of patterns) {
    if (pattern.thresholdPower <= exponent) {
      selected = pattern;
    }
  }

  return selected;
}

function getCompactAffix(
  pattern: CompactPowerPattern,
  roundedValue: string,
): CompactAffixPattern {
  if (isAbsoluteOne(roundedValue) && pattern.one) {
    return pattern.one;
  }

  return pattern.other;
}

function isAbsoluteOne(value: string): boolean {
  const absolute = value.startsWith("-") ? value.slice(1) : value;
  return compareDecimal(absolute, "1") === 0;
}

function getMagnitudeExponent(value: string): number {
  const magnitude = value.startsWith("-") ? value.slice(1) : value;
  const [integer, fraction = ""] = magnitude.split(".");

  if (integer !== "0") {
    return integer.length - 1;
  }

  const firstNonZeroFractionIndex = fraction.search(/[1-9]/);

  if (firstNonZeroFractionIndex < 0) {
    return 0;
  }

  return -(firstNonZeroFractionIndex + 1);
}

function getIntegerDigitCount(value: DecimalInput): number {
  const normalized = normalizeDecimal(value);
  const magnitude =
    normalized.sign === -1 ? normalized.value.slice(1) : normalized.value;
  const [integer] = magnitude.split(".");
  return integer.length;
}
