import type { NumberInputOptions } from "./numberInputTypes";

export type PercentInputOptions = Omit<NumberInputOptions, "mode">;

export function createPercentInputOptions(
  options: PercentInputOptions = {},
): NumberInputOptions {
  return {
    ...options,
    formatOnBlur: options.formatOnBlur ?? true,
    mode: "percent",
  };
}
