import { roundDecimal } from "../../rounding/roundDecimal";
import type { RoundingMode } from "../../rounding/roundingModes";
import type { DecimalInput, DecimalValue } from "../value/types";

export function scaleDecimal(
  value: DecimalInput,
  scale: number,
  roundingMode: RoundingMode = "halfExpand",
): DecimalValue {
  return roundDecimal(value, { scale, roundingMode });
}
