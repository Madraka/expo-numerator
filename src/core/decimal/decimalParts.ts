import { normalizeDecimal } from "./normalizeDecimal";
import type { DecimalInput } from "../value/types";

export type DecimalParts = {
  sign: -1 | 0 | 1;
  integer: string;
  fraction: string;
};

export function getDecimalParts(input: DecimalInput): DecimalParts {
  const normalized = normalizeDecimal(input);

  if (normalized.sign === 0) {
    return {
      sign: 0,
      integer: "0",
      fraction: "",
    };
  }

  const magnitude =
    normalized.sign === -1 ? normalized.value.slice(1) : normalized.value;
  const [integer, fraction = ""] = magnitude.split(".");

  return {
    sign: normalized.sign,
    integer,
    fraction,
  };
}
