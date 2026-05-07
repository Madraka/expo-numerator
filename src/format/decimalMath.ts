import { normalizeDecimal } from "../core/decimal/normalizeDecimal";
import type { DecimalInput } from "../core/value/types";

export function multiplyDecimalByPowerOfTen(
  value: DecimalInput,
  power: number,
): string {
  const normalized = normalizeDecimal(value);

  if (normalized.sign === 0) {
    return "0";
  }

  const signPrefix = normalized.sign === -1 ? "-" : "";
  const magnitude =
    normalized.sign === -1 ? normalized.value.slice(1) : normalized.value;
  const [integer, fraction = ""] = magnitude.split(".");
  const digits = `${integer}${fraction}`;
  const decimalIndex = integer.length + power;

  if (decimalIndex <= 0) {
    return `${signPrefix}0.${"0".repeat(Math.abs(decimalIndex))}${digits}`;
  }

  if (decimalIndex >= digits.length) {
    return `${signPrefix}${digits}${"0".repeat(decimalIndex - digits.length)}`;
  }

  return `${signPrefix}${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
}
