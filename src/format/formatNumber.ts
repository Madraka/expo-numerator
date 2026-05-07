import { formatCompactDecimal } from "./formatCompactDecimal";
import { formatDecimalString } from "./formatDecimalString";
import type { NumberFormatOptions } from "./formatOptions";
import { formatScientificDecimal } from "./formatScientificDecimal";
import type { DecimalInput } from "../core/value/types";

export function formatNumber(
  value: DecimalInput,
  options: NumberFormatOptions = {},
): string {
  if (options.notation === "compact") {
    return formatCompactDecimal(value, options);
  }

  if (options.notation === "scientific" || options.notation === "engineering") {
    return formatScientificDecimal(value, options);
  }

  return formatDecimalString(value, options);
}
