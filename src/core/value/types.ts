import type { CurrencyCode } from "../../money/currencyMeta";
import type { UnitDimension } from "../../unit/unitMeta";

export type DecimalInput = string | number | DecimalValue;

export type NumericValue = DecimalValue | MoneyValue | PercentValue | UnitValue;

export interface DecimalValue {
  readonly kind: "decimal";
  readonly value: string;
  readonly scale?: number;
  readonly sign: -1 | 0 | 1;
}

export interface MoneyValue {
  readonly kind: "money";
  readonly amount: string;
  readonly currency: CurrencyCode;
  readonly scale: number;
  readonly minor?: bigint;
}

export interface PercentValue {
  readonly kind: "percent";
  readonly value: string;
}

export interface UnitValue {
  readonly kind: "unit";
  readonly dimension: UnitDimension | string;
  readonly value: string;
  readonly unit: string;
}
