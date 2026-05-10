import type { UnitMeta } from "./unitMeta";
import { getUnitMeta } from "./unitRegistry";
import { NumeratorError } from "../core/errors/NumeratorError";
import type { UnitValue } from "../core/value/types";

export function getUnitValueMeta(value: UnitValue): UnitMeta {
  const meta = getUnitMeta(value.unit);

  if (value.dimension !== meta.dimension) {
    throw new NumeratorError("INVALID_UNIT", {
      dimension: value.dimension,
      expectedDimension: meta.dimension,
      reason: "Unit value dimension must match the registered unit.",
      unit: meta.code,
    });
  }

  return meta;
}
