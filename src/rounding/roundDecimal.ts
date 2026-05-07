import { DEFAULT_ROUNDING_MODE, type RoundingMode } from "./roundingModes";
import { getDecimalParts } from "../core/decimal/decimalParts";
import { normalizeDecimal } from "../core/decimal/normalizeDecimal";
import { NumeratorError } from "../core/errors/NumeratorError";
import type { DecimalInput, DecimalValue } from "../core/value/types";

export type RoundDecimalOptions = {
  scale: number;
  roundingMode?: RoundingMode;
  roundingIncrement?: number;
};

export function roundDecimal(
  value: DecimalInput,
  options: RoundDecimalOptions,
): DecimalValue {
  const scale = assertScale(options.scale);
  const roundingIncrement = options.roundingIncrement ?? 1;

  if (roundingIncrement !== 1) {
    throw new NumeratorError("ROUNDING_FAILED", {
      roundingIncrement,
      reason:
        "Only roundingIncrement: 1 is supported in the internal string engine v0.1.",
    });
  }

  const parts = getDecimalParts(value);

  if (parts.sign === 0) {
    return normalizeDecimal(scale === 0 ? "0" : `0.${"".padEnd(scale, "0")}`);
  }

  if (parts.fraction.length <= scale) {
    return normalizeDecimal(
      formatMagnitude(
        parts.sign,
        parts.integer,
        parts.fraction.padEnd(scale, "0"),
        scale,
      ),
    );
  }

  const keptFraction = parts.fraction.slice(0, scale);
  const discarded = parts.fraction.slice(scale);
  const shouldIncrement = shouldIncrementMagnitude(
    options.roundingMode ?? DEFAULT_ROUNDING_MODE,
    parts.sign,
    parts.integer,
    keptFraction,
    discarded,
  );

  const rounded = shouldIncrement
    ? incrementMagnitude(parts.integer, keptFraction, scale)
    : { integer: parts.integer, fraction: keptFraction };

  return normalizeDecimal(
    formatMagnitude(parts.sign, rounded.integer, rounded.fraction, scale),
  );
}

function assertScale(scale: number): number {
  if (!Number.isInteger(scale) || scale < 0 || scale > 100) {
    throw new NumeratorError("ROUNDING_FAILED", {
      scale,
      reason: "Scale must be an integer between 0 and 100.",
    });
  }

  return scale;
}

function shouldIncrementMagnitude(
  roundingMode: RoundingMode,
  sign: -1 | 1,
  integer: string,
  keptFraction: string,
  discarded: string,
): boolean {
  const hasDiscardedValue = /[1-9]/.test(discarded);

  if (!hasDiscardedValue) {
    return false;
  }

  if (roundingMode === "trunc") {
    return false;
  }

  if (roundingMode === "expand") {
    return true;
  }

  if (roundingMode === "ceil") {
    return sign === 1;
  }

  if (roundingMode === "floor") {
    return sign === -1;
  }

  const firstDiscarded = discarded.charCodeAt(0) - 48;
  const hasNonZeroAfterFirst = /[1-9]/.test(discarded.slice(1));

  if (firstDiscarded > 5) {
    return true;
  }

  if (firstDiscarded < 5) {
    return false;
  }

  if (hasNonZeroAfterFirst) {
    return true;
  }

  if (roundingMode === "halfExpand") {
    return true;
  }

  if (roundingMode === "halfTrunc") {
    return false;
  }

  if (roundingMode === "halfCeil") {
    return sign === 1;
  }

  if (roundingMode === "halfFloor") {
    return sign === -1;
  }

  if (roundingMode === "halfEven") {
    const lastKeptDigit = getLastKeptDigit(integer, keptFraction);
    return lastKeptDigit % 2 === 1;
  }

  return assertNever(roundingMode);
}

function incrementMagnitude(
  integer: string,
  fraction: string,
  scale: number,
): { integer: string; fraction: string } {
  const digits = `${integer}${fraction}`.split("");
  let carry = 1;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    const nextDigit = digits[index].charCodeAt(0) - 48 + carry;

    if (nextDigit === 10) {
      digits[index] = "0";
      carry = 1;
    } else {
      digits[index] = String(nextDigit);
      carry = 0;
      break;
    }
  }

  if (carry === 1) {
    digits.unshift("1");
  }

  const integerLength = digits.length - scale;
  const nextInteger = digits.slice(0, integerLength).join("");
  const nextFraction =
    scale > 0 ? digits.slice(integerLength).join("").padStart(scale, "0") : "";

  return {
    integer: nextInteger,
    fraction: nextFraction,
  };
}

function formatMagnitude(
  sign: -1 | 1,
  integer: string,
  fraction: string,
  scale: number,
): string {
  const magnitude = scale > 0 ? `${integer}.${fraction}` : integer;
  return sign === -1 ? `-${magnitude}` : magnitude;
}

function getLastKeptDigit(integer: string, fraction: string): number {
  const digit =
    fraction.length > 0
      ? fraction[fraction.length - 1]
      : integer[integer.length - 1];
  return digit.charCodeAt(0) - 48;
}

function assertNever(value: never): never {
  throw new NumeratorError("ROUNDING_FAILED", { roundingMode: value });
}
