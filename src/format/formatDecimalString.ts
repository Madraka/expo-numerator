import { applyGrouping } from "./applyGrouping";
import type { BaseFormatOptions } from "./formatOptions";
import { normalizeDecimal } from "../core/decimal/normalizeDecimal";
import { NumeratorError } from "../core/errors/NumeratorError";
import type { DecimalInput } from "../core/value/types";
import { getLocaleSymbols } from "../locale/resolveLocale";
import { roundDecimal } from "../rounding/roundDecimal";

export function formatDecimalString(
  value: DecimalInput,
  options: BaseFormatOptions = {},
): string {
  const targetScale = getTargetScale(value, options);
  const rounded =
    targetScale === null
      ? normalizeDecimal(value)
      : roundDecimal(value, {
          scale: targetScale,
          roundingMode: options.roundingMode,
        });

  const symbols = getLocaleSymbols({ locale: options.locale });
  const magnitude =
    rounded.sign === -1 ? rounded.value.slice(1) : rounded.value;
  const [rawInteger, rawFraction = ""] = magnitude.split(".");
  const minimumFractionDigits = options.minimumFractionDigits ?? 0;
  const fraction = rawFraction.padEnd(minimumFractionDigits, "0");
  const visibleFraction = shouldStripFraction(fraction, options)
    ? ""
    : fraction;
  const integer = shouldUseGrouping(rawInteger, options.useGrouping)
    ? applyGrouping(rawInteger, symbols.grouping)
    : rawInteger;
  const formattedMagnitude =
    visibleFraction.length > 0
      ? `${integer}${symbols.decimal}${visibleFraction}`
      : integer;

  return `${getSignPrefix(rounded.sign, options.signDisplay, symbols)}${formattedMagnitude}`;
}

function getTargetScale(
  value: DecimalInput,
  options: BaseFormatOptions,
): number | null {
  if (options.maximumFractionDigits !== undefined) {
    assertFractionDigits(options.maximumFractionDigits);
    return options.maximumFractionDigits;
  }

  if (options.minimumFractionDigits !== undefined) {
    assertFractionDigits(options.minimumFractionDigits);
  }

  return null;
}

function assertFractionDigits(value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new NumeratorError("VALUE_OUT_OF_RANGE", {
      value,
      reason: "Fraction digits must be an integer between 0 and 100.",
    });
  }
}

function shouldUseGrouping(
  integer: string,
  useGrouping: BaseFormatOptions["useGrouping"],
): boolean {
  if (useGrouping === false) {
    return false;
  }

  if (useGrouping === "min2") {
    return integer.length > 4;
  }

  return true;
}

function shouldStripFraction(
  fraction: string,
  options: BaseFormatOptions,
): boolean {
  return (
    options.trailingZeroDisplay === "stripIfInteger" &&
    fraction.length > 0 &&
    /^0+$/.test(fraction)
  );
}

function getSignPrefix(
  sign: -1 | 0 | 1,
  signDisplay: BaseFormatOptions["signDisplay"],
  symbols: ReturnType<typeof getLocaleSymbols>,
): string {
  if (signDisplay === "never") {
    return "";
  }

  if (sign === -1) {
    return signDisplay === "negative" ||
      signDisplay === undefined ||
      signDisplay === "auto"
      ? symbols.minusSign
      : symbols.minusSign;
  }

  if (
    signDisplay === "always" ||
    (signDisplay === "exceptZero" && sign !== 0)
  ) {
    return symbols.plusSign;
  }

  return "";
}
