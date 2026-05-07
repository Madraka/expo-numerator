import type { CurrencyCode } from "./currencyMeta";
import { getCurrencyMeta } from "./currencyRegistry";
import { normalizeDecimal } from "../core/decimal/normalizeDecimal";
import { NumeratorError } from "../core/errors/NumeratorError";
import type { DecimalInput, MoneyValue } from "../core/value/types";

export function money(amount: DecimalInput, currency: string): MoneyValue {
  if (currency === undefined || currency === null) {
    throw new NumeratorError("INVALID_CURRENCY", { currency });
  }

  const meta = getCurrencyMeta(currency);
  const normalized = normalizeDecimal(amount);

  return Object.freeze({
    kind: "money",
    amount: normalized.value,
    currency: meta.code,
    scale: meta.minorUnit,
    minor: getMinorUnits(normalized.value, meta.minorUnit),
  });
}

function getMinorUnits(amount: string, scale: number): bigint | undefined {
  const sign = amount.startsWith("-") ? -1n : 1n;
  const magnitude = sign === -1n ? amount.slice(1) : amount;
  const [integer, fraction = ""] = magnitude.split(".");

  if (fraction.length > scale) {
    return undefined;
  }

  const digits = `${integer}${fraction.padEnd(scale, "0")}`;
  return BigInt(digits) * sign;
}

export type { CurrencyCode };
