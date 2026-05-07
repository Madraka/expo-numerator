import { getUnitMeta } from "./unitRegistry";
import { normalizeDecimal } from "../core/decimal/normalizeDecimal";
import { NumeratorError } from "../core/errors/NumeratorError";
import type { UnitValue } from "../core/value/types";
import { unit } from "../core/value/unit";
import type { RoundingMode } from "../rounding/roundingModes";

export type UnitConversionOptions = {
  scale?: number;
  roundingMode?: RoundingMode;
};

type ScaledInteger = {
  readonly integer: bigint;
  readonly scale: number;
  readonly sign: -1 | 0 | 1;
};

type Rational = {
  readonly denominator: bigint;
  readonly numerator: bigint;
};

export function convertUnit(
  value: UnitValue,
  targetUnit: string,
  options: UnitConversionOptions = {},
): UnitValue {
  const sourceMeta = getUnitMeta(value.unit);
  const targetMeta = getUnitMeta(targetUnit);

  if (sourceMeta.dimension !== targetMeta.dimension) {
    throw new NumeratorError("INVALID_UNIT", {
      from: sourceMeta.code,
      reason: "Units must share the same dimension.",
      to: targetMeta.code,
    });
  }

  if (!hasConversionFormula(sourceMeta) || !hasConversionFormula(targetMeta)) {
    throw new NumeratorError("INVALID_UNIT", {
      dimension: sourceMeta.dimension,
      from: sourceMeta.code,
      reason: "This unit dimension does not have a conversion formula in v0.1.",
      to: targetMeta.code,
    });
  }

  const converted = convertDecimalByFormula(
    value.value,
    sourceMeta.conversionFactorToBase,
    sourceMeta.conversionOffsetToBase ?? "0",
    targetMeta.conversionFactorToBase,
    targetMeta.conversionOffsetToBase ?? "0",
    {
      roundingMode: options.roundingMode ?? "halfExpand",
      scale: options.scale ?? 6,
    },
  );

  return unit(converted, targetMeta.code);
}

export function canConvertUnit(
  sourceUnit: string,
  targetUnit: string,
): boolean {
  try {
    const sourceMeta = getUnitMeta(sourceUnit);
    const targetMeta = getUnitMeta(targetUnit);

    return (
      sourceMeta.dimension === targetMeta.dimension &&
      hasConversionFormula(sourceMeta) &&
      hasConversionFormula(targetMeta)
    );
  } catch {
    return false;
  }
}

function hasConversionFormula(meta: {
  readonly conversionFactorToBase?: string;
}): meta is { readonly conversionFactorToBase: string } {
  return meta.conversionFactorToBase !== undefined;
}

function convertDecimalByFormula(
  value: string,
  sourceFactor: string,
  sourceOffset: string,
  targetFactor: string,
  targetOffset: string,
  options: Required<UnitConversionOptions>,
): string {
  const sourceValue = parseRational(value);

  const baseValue = addRational(
    multiplyRational(sourceValue, parseRational(sourceFactor)),
    parseRational(sourceOffset),
  );
  const targetValue = divideRational(
    subtractRational(baseValue, parseRational(targetOffset)),
    parseRational(targetFactor),
  );
  const sign = getRationalSign(targetValue);

  const rounded = divideToScaledInteger(
    absBigInt(targetValue.numerator),
    targetValue.denominator,
    sign,
    options.scale,
    options.roundingMode,
  );

  if (sign === 0) {
    return normalizeDecimal(
      options.scale === 0 ? "0" : `0.${"0".repeat(options.scale)}`,
    ).value;
  }

  return normalizeDecimal(formatScaledInteger(rounded, options.scale, sign))
    .value;
}

function divideToScaledInteger(
  numerator: bigint,
  denominator: bigint,
  sign: -1 | 0 | 1,
  scale: number,
  roundingMode: RoundingMode,
): bigint {
  if (sign === 0) {
    return 0n;
  }

  const scaledNumerator = numerator * pow10(assertScale(scale));
  const quotient = scaledNumerator / denominator;
  const remainder = scaledNumerator % denominator;

  return shouldIncrement(quotient, remainder, denominator, sign, roundingMode)
    ? quotient + 1n
    : quotient;
}

function shouldIncrement(
  quotient: bigint,
  remainder: bigint,
  denominator: bigint,
  sign: -1 | 1,
  roundingMode: RoundingMode,
): boolean {
  if (remainder === 0n) {
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

  const comparison = remainder * 2n - denominator;

  if (comparison > 0n) {
    return true;
  }

  if (comparison < 0n) {
    return false;
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
    return quotient % 2n === 1n;
  }

  throw new NumeratorError("ROUNDING_FAILED", { roundingMode });
}

function toScaledInteger(value: string): ScaledInteger {
  const normalized = normalizeDecimal(value);

  if (normalized.sign === 0) {
    return { integer: 0n, scale: 0, sign: 0 };
  }

  const magnitude =
    normalized.sign === -1 ? normalized.value.slice(1) : normalized.value;
  const [integer, fraction = ""] = magnitude.split(".");
  const digits = `${integer}${fraction}`.replace(/^0+/, "") || "0";

  return {
    integer: BigInt(digits),
    scale: fraction.length,
    sign: normalized.sign,
  };
}

function parseRational(value: string): Rational {
  const [numeratorText, denominatorText] = value.split("/");

  if (denominatorText === undefined) {
    return rationalFromDecimal(numeratorText);
  }

  const numerator = rationalFromDecimal(numeratorText);
  const denominator = rationalFromDecimal(denominatorText);

  return divideRational(numerator, denominator);
}

function rationalFromDecimal(value: string): Rational {
  const scaled = toScaledInteger(value);
  const sign = scaled.sign === -1 ? -1n : 1n;

  return normalizeRational({
    denominator: pow10(scaled.scale),
    numerator: scaled.integer * sign,
  });
}

function addRational(left: Rational, right: Rational): Rational {
  return normalizeRational({
    denominator: left.denominator * right.denominator,
    numerator:
      left.numerator * right.denominator + right.numerator * left.denominator,
  });
}

function subtractRational(left: Rational, right: Rational): Rational {
  return addRational(left, {
    denominator: right.denominator,
    numerator: -right.numerator,
  });
}

function multiplyRational(left: Rational, right: Rational): Rational {
  return normalizeRational({
    denominator: left.denominator * right.denominator,
    numerator: left.numerator * right.numerator,
  });
}

function divideRational(left: Rational, right: Rational): Rational {
  if (right.numerator === 0n) {
    throw new NumeratorError("INVALID_UNIT", {
      reason: "Unit conversion denominator must not be zero.",
    });
  }

  return normalizeRational({
    denominator: left.denominator * absBigInt(right.numerator),
    numerator:
      right.numerator < 0n
        ? -left.numerator * right.denominator
        : left.numerator * right.denominator,
  });
}

function normalizeRational(value: Rational): Rational {
  if (value.denominator === 0n) {
    throw new NumeratorError("INVALID_UNIT", {
      reason: "Unit conversion denominator must not be zero.",
    });
  }

  const sign = value.denominator < 0n ? -1n : 1n;
  const numerator = value.numerator * sign;
  const denominator = absBigInt(value.denominator);
  const divisor = gcd(absBigInt(numerator), denominator);

  return {
    denominator: denominator / divisor,
    numerator: numerator / divisor,
  };
}

function getRationalSign(value: Rational): -1 | 0 | 1 {
  if (value.numerator === 0n) {
    return 0;
  }

  return value.numerator < 0n ? -1 : 1;
}

function absBigInt(value: bigint): bigint {
  return value < 0n ? -value : value;
}

function gcd(left: bigint, right: bigint): bigint {
  let a = left;
  let b = right;

  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }

  return a === 0n ? 1n : a;
}

function formatScaledInteger(
  value: bigint,
  scale: number,
  sign: -1 | 1,
): string {
  const digits = value.toString().padStart(scale + 1, "0");

  if (scale === 0) {
    return sign === -1 ? `-${digits}` : digits;
  }

  const integer = digits.slice(0, -scale);
  const fraction = digits.slice(-scale);
  const formatted = `${integer}.${fraction}`;

  return sign === -1 ? `-${formatted}` : formatted;
}

function assertScale(scale: number): number {
  if (!Number.isInteger(scale) || scale < 0 || scale > 100) {
    throw new NumeratorError("ROUNDING_FAILED", {
      reason: "Scale must be an integer between 0 and 100.",
      scale,
    });
  }

  return scale;
}

function pow10(power: number): bigint {
  return 10n ** BigInt(power);
}
