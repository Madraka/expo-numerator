import { getCurrencyMeta } from "./currencyRegistry";
import { money } from "./money";
import { compareDecimal } from "../core/decimal/compareDecimal";
import {
  divideDecimal,
  multiplyDecimal,
} from "../core/decimal/decimalArithmetic";
import { normalizeDecimal } from "../core/decimal/normalizeDecimal";
import { NumeratorError } from "../core/errors/NumeratorError";
import type { DecimalInput, MoneyValue } from "../core/value/types";
import type { RoundingMode } from "../rounding/roundingModes";

export type MinorUnitScalePolicy = "strict" | "round";

export type ToMinorUnitsOptions = {
  scalePolicy?: MinorUnitScalePolicy;
  roundingMode?: RoundingMode;
};

export function toMinorUnits(
  amount: DecimalInput,
  currency: string,
  options: ToMinorUnitsOptions = {},
): bigint {
  const meta = getCurrencyMeta(currency);
  const normalized = normalizeDecimal(amount);
  const scaled = multiplyDecimal(normalized, `1${"0".repeat(meta.minorUnit)}`);

  if (isIntegerText(scaled.value)) {
    return BigInt(toIntegerText(scaled.value));
  }

  if (options.scalePolicy === "round") {
    return BigInt(
      divideDecimal(scaled, "1", {
        roundingMode: options.roundingMode ?? "halfExpand",
        scale: 0,
      }).value,
    );
  }

  throw new NumeratorError("VALUE_OUT_OF_RANGE", {
    currency: meta.code,
    minorUnit: meta.minorUnit,
    reason: "Amount has more fractional digits than the currency minor unit.",
    value: normalized.value,
  });
}

export function fromMinorUnits(
  minor: bigint | number | string,
  currency: string,
): MoneyValue {
  const meta = getCurrencyMeta(currency);
  const minorInteger = normalizeMinorInteger(minor);
  const sign = minorInteger < 0n ? "-" : "";
  const magnitude = String(absBigInt(minorInteger)).padStart(
    meta.minorUnit + 1,
    "0",
  );
  const amount =
    meta.minorUnit === 0
      ? `${sign}${magnitude}`
      : `${sign}${magnitude.slice(0, magnitude.length - meta.minorUnit)}.${magnitude.slice(
          magnitude.length - meta.minorUnit,
        )}`;

  return money(amount, meta.code);
}

function normalizeMinorInteger(value: bigint | number | string): bigint {
  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) {
      throw new NumeratorError("VALUE_OUT_OF_RANGE", {
        reason: "Minor unit numbers must be safe integers.",
        value,
      });
    }

    return BigInt(value);
  }

  if (!/^-?\d+$/.test(value.trim())) {
    throw new NumeratorError("INVALID_DECIMAL", { value });
  }

  return BigInt(value.trim());
}

function isIntegerText(value: string): boolean {
  return (
    compareDecimal(value, String(BigInt(value.split(".")[0] ?? "0"))) === 0
  );
}

function toIntegerText(value: string): string {
  return value.split(".")[0] ?? "0";
}

function absBigInt(value: bigint): bigint {
  return value < 0n ? -value : value;
}
