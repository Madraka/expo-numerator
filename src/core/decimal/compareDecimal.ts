import { getDecimalParts } from "./decimalParts";
import type { DecimalInput } from "../value/types";

export function compareDecimal(
  left: DecimalInput,
  right: DecimalInput,
): -1 | 0 | 1 {
  const leftParts = getDecimalParts(left);
  const rightParts = getDecimalParts(right);

  if (leftParts.sign !== rightParts.sign) {
    return leftParts.sign < rightParts.sign ? -1 : 1;
  }

  if (leftParts.sign === 0) {
    return 0;
  }

  const absoluteComparison = compareAbsolute(leftParts, rightParts);
  return leftParts.sign === 1
    ? absoluteComparison
    : invertComparison(absoluteComparison);
}

function compareAbsolute(
  left: ReturnType<typeof getDecimalParts>,
  right: ReturnType<typeof getDecimalParts>,
): -1 | 0 | 1 {
  const leftInteger = left.integer.replace(/^0+(?=\d)/, "");
  const rightInteger = right.integer.replace(/^0+(?=\d)/, "");

  if (leftInteger.length !== rightInteger.length) {
    return leftInteger.length < rightInteger.length ? -1 : 1;
  }

  if (leftInteger !== rightInteger) {
    return leftInteger < rightInteger ? -1 : 1;
  }

  const fractionLength = Math.max(left.fraction.length, right.fraction.length);
  const leftFraction = left.fraction.padEnd(fractionLength, "0");
  const rightFraction = right.fraction.padEnd(fractionLength, "0");

  if (leftFraction === rightFraction) {
    return 0;
  }

  return leftFraction < rightFraction ? -1 : 1;
}

function invertComparison(comparison: -1 | 0 | 1): -1 | 0 | 1 {
  return comparison === 0 ? 0 : comparison === 1 ? -1 : 1;
}
