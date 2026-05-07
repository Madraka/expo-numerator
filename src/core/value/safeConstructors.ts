import { decimal } from "./decimal";
import { percent } from "./percent";
import type {
  DecimalInput,
  DecimalValue,
  MoneyValue,
  PercentValue,
  UnitValue,
} from "./types";
import { unit } from "./unit";
import { money } from "../../money/money";
import type { NumeratorError } from "../errors/NumeratorError";
import { normalizeCaughtError } from "../errors/normalizeCaughtError";

export type NumeratorSuccess<T> = {
  readonly ok: true;
  readonly value: T;
};

export type NumeratorFailure = {
  readonly ok: false;
  readonly error: NumeratorError;
};

export type NumeratorResult<T> = NumeratorSuccess<T> | NumeratorFailure;

export function safeDecimal(
  value: DecimalInput,
): NumeratorResult<DecimalValue> {
  return safeCall(() => decimal(value));
}

export function safeMoney(
  amount: DecimalInput,
  currency: string,
): NumeratorResult<MoneyValue> {
  return safeCall(() => money(amount, currency));
}

export function safePercent(
  value: DecimalInput,
): NumeratorResult<PercentValue> {
  return safeCall(() => percent(value));
}

export function safeUnit(
  value: DecimalInput,
  unitName: string,
): NumeratorResult<UnitValue> {
  return safeCall(() => unit(value, unitName));
}

function safeCall<T>(operation: () => T): NumeratorResult<T> {
  try {
    return Object.freeze({
      ok: true,
      value: operation(),
    });
  } catch (error) {
    return Object.freeze({
      ok: false,
      error: normalizeCaughtError(error, "Unexpected constructor failure."),
    });
  }
}
