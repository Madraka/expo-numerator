import { compareDecimal } from "../decimal/compareDecimal";
import type {
  DecimalValue,
  MoneyValue,
  NumericValue,
  PercentValue,
  UnitValue,
} from "../value/types";

export function isDecimal(value: unknown): value is DecimalValue {
  return (
    isRecord(value) &&
    value.kind === "decimal" &&
    typeof value.value === "string"
  );
}

export function isMoney(value: unknown): value is MoneyValue {
  return (
    isRecord(value) &&
    value.kind === "money" &&
    typeof value.amount === "string" &&
    typeof value.currency === "string" &&
    typeof value.scale === "number"
  );
}

export function isPercent(value: unknown): value is PercentValue {
  return (
    isRecord(value) &&
    value.kind === "percent" &&
    typeof value.value === "string"
  );
}

export function isUnit(value: unknown): value is UnitValue {
  return (
    isRecord(value) &&
    value.kind === "unit" &&
    typeof value.value === "string" &&
    typeof value.unit === "string"
  );
}

export function isNumericValue(value: unknown): value is NumericValue {
  return (
    isDecimal(value) || isMoney(value) || isPercent(value) || isUnit(value)
  );
}

export function isWithinRange(
  value: DecimalValue,
  range: { min?: string; max?: string },
): boolean {
  if (range.min !== undefined && compareDecimal(value, range.min) < 0) {
    return false;
  }

  if (range.max !== undefined && compareDecimal(value, range.max) > 0) {
    return false;
  }

  return true;
}

export function hasScale(value: DecimalValue, scale: number): boolean {
  return (value.scale ?? 0) === scale;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
