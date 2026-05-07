import type { DecimalInput, PercentValue } from "./types";
import { normalizeDecimal } from "../decimal/normalizeDecimal";

export function percent(value: DecimalInput): PercentValue {
  const normalized = normalizeDecimal(value);

  return Object.freeze({
    kind: "percent",
    value: normalized.value,
  });
}
