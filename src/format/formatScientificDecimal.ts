import { formatDecimalString } from "./formatDecimalString";
import type { NumberFormatOptions, NumberNotation } from "./formatOptions";
import { normalizeDecimal } from "../core/decimal/normalizeDecimal";
import type { DecimalInput } from "../core/value/types";

type ScientificParts = {
  coefficient: string;
  exponent: number;
};

export function formatScientificDecimal(
  value: DecimalInput,
  options: NumberFormatOptions,
): string {
  const notation =
    options.notation === "engineering" ? "engineering" : "scientific";
  const {
    notation: _notation,
    compactDisplay: _compactDisplay,
    ...rest
  } = options;
  const parts = toScientificParts(value, notation);
  const coefficient = formatDecimalString(parts.coefficient, {
    ...rest,
    useGrouping: false,
  });

  return `${coefficient}E${parts.exponent}`;
}

function toScientificParts(
  value: DecimalInput,
  notation: Extract<NumberNotation, "scientific" | "engineering">,
): ScientificParts {
  const normalized = normalizeDecimal(value);

  if (normalized.sign === 0) {
    return { coefficient: "0", exponent: 0 };
  }

  const magnitude =
    normalized.sign === -1 ? normalized.value.slice(1) : normalized.value;
  const [integerPart, fractionPart = ""] = magnitude.split(".");
  const allDigits = `${integerPart}${fractionPart}`;
  const firstNonZeroIndex = allDigits.search(/[1-9]/);
  const scientificExponent = integerPart.length - firstNonZeroIndex - 1;
  const exponent =
    notation === "engineering"
      ? Math.floor(scientificExponent / 3) * 3
      : scientificExponent;
  const integerDigitCount = scientificExponent - exponent + 1;
  const significantDigits = allDigits.slice(firstNonZeroIndex);
  const paddedDigits = significantDigits.padEnd(integerDigitCount, "0");
  const coefficientInteger = paddedDigits.slice(0, integerDigitCount);
  const coefficientFraction = paddedDigits.slice(integerDigitCount);
  const coefficientMagnitude =
    coefficientFraction.length > 0
      ? `${coefficientInteger}.${coefficientFraction}`
      : coefficientInteger;
  const coefficient =
    normalized.sign === -1 ? `-${coefficientMagnitude}` : coefficientMagnitude;

  return { coefficient, exponent };
}
