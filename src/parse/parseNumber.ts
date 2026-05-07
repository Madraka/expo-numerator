import { parseLocalizedDecimal } from "./parseLocalizedDecimal";
import type { NumberParseOptions } from "./parseOptions";
import type { DecimalValue } from "../core/value/types";

export function parseNumber(
  text: string,
  options: NumberParseOptions = {},
): DecimalValue {
  return parseLocalizedDecimal(text, options);
}
