import type { NumberInputOptions } from "./numberInputTypes";
import type { UnitDimension } from "../unit/unitMeta";
import { getUnitMeta } from "../unit/unitRegistry";

export type UnitInputOptions = Omit<NumberInputOptions, "mode" | "unit">;

const defaultFractionDigitsByDimension: Partial<Record<UnitDimension, number>> =
  {
    acceleration: 3,
    angle: 2,
    area: 2,
    data: 0,
    density: 3,
    "electric-current": 3,
    "electric-potential": 3,
    energy: 2,
    force: 2,
    frequency: 2,
    length: 3,
    mass: 3,
    power: 2,
    pressure: 2,
    speed: 2,
    temperature: 2,
    time: 2,
    torque: 2,
    volume: 3,
  };

export function createUnitInputOptions(
  unitCode: string,
  options: UnitInputOptions = {},
): NumberInputOptions {
  const meta = getUnitMeta(unitCode);
  const maximumFractionDigits =
    options.maximumFractionDigits ??
    defaultFractionDigitsByDimension[meta.dimension as UnitDimension] ??
    3;

  return {
    ...options,
    maximumFractionDigits,
    mode: "unit",
    unit: meta.code,
  };
}
