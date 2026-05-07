import type { DecimalInput, UnitValue } from "./types";
import { getUnitMeta, normalizeUnitCode } from "../../unit/unitRegistry";
import { normalizeDecimal } from "../decimal/normalizeDecimal";
import { NumeratorError } from "../errors/NumeratorError";

export function unit(value: DecimalInput, unitName: string): UnitValue {
  const trimmedUnit = unitName.trim();

  if (trimmedUnit.length === 0) {
    throw new NumeratorError("VALUE_OUT_OF_RANGE", { unit: unitName });
  }

  const unitCode = normalizeUnitCode(trimmedUnit);

  if (unitCode === null) {
    throw new NumeratorError("INVALID_UNIT", { unit: unitName });
  }

  const normalized = normalizeDecimal(value);
  const meta = getUnitMeta(unitCode);

  return Object.freeze({
    dimension: meta.dimension,
    kind: "unit",
    unit: meta.code,
    value: normalized.value,
  });
}
