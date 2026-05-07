import type { NumericValue } from "expo-numerator";

export function getNumericValueText(value: NumericValue | null): string | null {
  if (!value) {
    return null;
  }

  if (value.kind === "money") {
    return value.amount;
  }

  return value.value;
}
