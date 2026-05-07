import {
  fromMinorUnits,
  toMinorUnits,
  type ToMinorUnitsOptions,
} from "./minorUnits";
import { NumeratorError } from "../core/errors/NumeratorError";
import type { MoneyValue } from "../core/value/types";

export type AllocationRatio = bigint | number | string;

export type AllocateMoneyOptions = ToMinorUnitsOptions;

type AllocationShare = {
  readonly index: number;
  readonly units: bigint;
  readonly remainder: bigint;
};

export function allocateMinorUnits(
  total: bigint | number | string,
  ratios: readonly AllocationRatio[],
): bigint[] {
  const totalMinor = normalizeInteger(total, "total");
  const normalizedRatios = normalizeRatios(ratios);
  const totalWeight = normalizedRatios.reduce((sum, ratio) => sum + ratio, 0n);

  if (totalWeight === 0n) {
    throw new NumeratorError("VALUE_OUT_OF_RANGE", {
      reason: "At least one allocation ratio must be greater than zero.",
      ratios,
    });
  }

  const sign = totalMinor < 0n ? -1n : 1n;
  const totalMagnitude = absBigInt(totalMinor);
  const shares = normalizedRatios.map((ratio, index): AllocationShare => {
    const numerator = totalMagnitude * ratio;

    return {
      index,
      remainder: numerator % totalWeight,
      units: numerator / totalWeight,
    };
  });
  let remainderUnits =
    totalMagnitude - shares.reduce((sum, share) => sum + share.units, 0n);
  const orderedRemainders = [...shares].sort((left, right) => {
    if (left.remainder === right.remainder) {
      return left.index - right.index;
    }

    return left.remainder > right.remainder ? -1 : 1;
  });
  const allocated = shares.map((share) => share.units);

  for (const share of orderedRemainders) {
    if (remainderUnits === 0n) {
      break;
    }

    if (share.remainder === 0n) {
      continue;
    }

    allocated[share.index] += 1n;
    remainderUnits -= 1n;
  }

  return allocated.map((units) => units * sign);
}

export function allocateMoney(
  value: MoneyValue,
  ratios: readonly AllocationRatio[],
  options: AllocateMoneyOptions = {},
): MoneyValue[] {
  const totalMinor = toMinorUnits(value.amount, value.currency, options);

  return allocateMinorUnits(totalMinor, ratios).map((minor) =>
    fromMinorUnits(minor, value.currency),
  );
}

function normalizeRatios(ratios: readonly AllocationRatio[]): bigint[] {
  if (ratios.length === 0) {
    throw new NumeratorError("VALUE_OUT_OF_RANGE", {
      reason: "Allocation ratios must not be empty.",
    });
  }

  return ratios.map((ratio, index) => {
    const normalized = normalizeInteger(ratio, `ratios[${index}]`);

    if (normalized < 0n) {
      throw new NumeratorError("VALUE_OUT_OF_RANGE", {
        index,
        ratio,
        reason: "Allocation ratios must be non-negative integers.",
      });
    }

    return normalized;
  });
}

function normalizeInteger(
  value: bigint | number | string,
  label: string,
): bigint {
  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) {
      throw new NumeratorError("VALUE_OUT_OF_RANGE", {
        reason: `${label} must be a safe integer.`,
        value,
      });
    }

    return BigInt(value);
  }

  if (!/^-?\d+$/.test(value.trim())) {
    throw new NumeratorError("INVALID_DECIMAL", { label, value });
  }

  return BigInt(value.trim());
}

function absBigInt(value: bigint): bigint {
  return value < 0n ? -value : value;
}
