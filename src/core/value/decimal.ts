import type { DecimalInput, DecimalValue } from "./types";
import { normalizeDecimal } from "../decimal/normalizeDecimal";

export function decimal(value: DecimalInput): DecimalValue {
  return normalizeDecimal(value);
}
