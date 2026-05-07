import { normalizeDecimal } from "./normalizeDecimal";
import type { RoundingMode } from "../../rounding/roundingModes";
import { NumeratorError } from "../errors/NumeratorError";
import type { DecimalInput, DecimalValue } from "../value/types";

type ScaledDecimal = {
  readonly integer: bigint;
  readonly scale: number;
};

export type DivideDecimalOptions = {
  scale: number;
  roundingMode?: RoundingMode;
};

export function addDecimal(
  left: DecimalInput,
  right: DecimalInput,
): DecimalValue {
  const leftScaled = toScaledDecimal(left);
  const rightScaled = toScaledDecimal(right);
  const scale = Math.max(leftScaled.scale, rightScaled.scale);
  const result = alignScale(leftScaled, scale) + alignScale(rightScaled, scale);

  return normalizeDecimal(formatScaledDecimal(result, scale));
}

export function subtractDecimal(
  left: DecimalInput,
  right: DecimalInput,
): DecimalValue {
  const leftScaled = toScaledDecimal(left);
  const rightScaled = toScaledDecimal(right);
  const scale = Math.max(leftScaled.scale, rightScaled.scale);
  const result = alignScale(leftScaled, scale) - alignScale(rightScaled, scale);

  return normalizeDecimal(formatScaledDecimal(result, scale));
}

export function multiplyDecimal(
  left: DecimalInput,
  right: DecimalInput,
): DecimalValue {
  const leftScaled = toScaledDecimal(left);
  const rightScaled = toScaledDecimal(right);
  const scale = leftScaled.scale + rightScaled.scale;
  const result = leftScaled.integer * rightScaled.integer;

  return normalizeDecimal(formatScaledDecimal(result, scale));
}

export function divideDecimal(
  left: DecimalInput,
  right: DecimalInput,
  options: DivideDecimalOptions,
): DecimalValue {
  const scale = assertScale(options.scale);
  const leftScaled = toScaledDecimal(left);
  const rightScaled = toScaledDecimal(right);

  if (rightScaled.integer === 0n) {
    throw new NumeratorError("ARITHMETIC_FAILED", {
      operation: "divide",
      reason: "Division by zero.",
    });
  }

  if (leftScaled.integer === 0n) {
    return normalizeDecimal(scale === 0 ? "0" : `0.${"0".repeat(scale)}`);
  }

  const sign: -1 | 1 =
    getBigIntSign(leftScaled.integer) === getBigIntSign(rightScaled.integer)
      ? 1
      : -1;
  const numerator =
    absBigInt(leftScaled.integer) * pow10(rightScaled.scale + scale);
  const denominator = absBigInt(rightScaled.integer) * pow10(leftScaled.scale);
  const quotient = numerator / denominator;
  const remainder = numerator % denominator;
  const rounded = shouldIncrement(
    quotient,
    remainder,
    denominator,
    sign,
    options.roundingMode ?? "halfExpand",
  )
    ? quotient + 1n
    : quotient;

  return normalizeDecimal(formatScaledDecimal(rounded * BigInt(sign), scale));
}

function toScaledDecimal(value: DecimalInput): ScaledDecimal {
  const normalized = normalizeDecimal(value);

  if (normalized.sign === 0) {
    return {
      integer: 0n,
      scale: 0,
    };
  }

  const magnitude =
    normalized.sign === -1 ? normalized.value.slice(1) : normalized.value;
  const [integer, fraction = ""] = magnitude.split(".");
  const digits = `${integer}${fraction}`.replace(/^0+/, "") || "0";

  return {
    integer: BigInt(digits) * BigInt(normalized.sign),
    scale: fraction.length,
  };
}

function alignScale(value: ScaledDecimal, scale: number): bigint {
  return value.integer * pow10(scale - value.scale);
}

function formatScaledDecimal(value: bigint, scale: number): string {
  const sign = value < 0n ? "-" : "";
  const magnitude = String(absBigInt(value)).padStart(scale + 1, "0");

  if (scale === 0) {
    return `${sign}${magnitude}`;
  }

  const integer = magnitude.slice(0, magnitude.length - scale);
  const fraction = magnitude.slice(magnitude.length - scale);

  return `${sign}${integer}.${fraction}`;
}

function assertScale(scale: number): number {
  if (!Number.isInteger(scale) || scale < 0 || scale > 100) {
    throw new NumeratorError("ARITHMETIC_FAILED", {
      scale,
      reason: "Scale must be an integer between 0 and 100.",
    });
  }

  return scale;
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

  throw new NumeratorError("ARITHMETIC_FAILED", { roundingMode });
}

function getBigIntSign(value: bigint): -1 | 1 {
  return value < 0n ? -1 : 1;
}

function absBigInt(value: bigint): bigint {
  return value < 0n ? -value : value;
}

function pow10(power: number): bigint {
  return 10n ** BigInt(power);
}
