import type { NumberInputOptions } from "./numberInputTypes";

export type IntegerInputOptions = Omit<
  NumberInputOptions,
  "allowDecimal" | "maximumFractionDigits" | "minimumFractionDigits" | "mode"
>;

export function createIntegerInputOptions(
  options: IntegerInputOptions = {},
): NumberInputOptions {
  return {
    ...options,
    allowDecimal: false,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    mode: "decimal",
  };
}
