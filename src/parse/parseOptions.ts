import type { CurrencyCode } from "../money/currencyMeta";
import type { UnitDimension } from "../unit/unitMeta";

export type ParseMode = "strict" | "loose";

export type BaseParseOptions = {
  locale?: string;
  mode?: ParseMode;
};

export type NumberParseOptions = BaseParseOptions;

export type MoneyParseOptions = BaseParseOptions & {
  currency: CurrencyCode | string;
};

export type PercentParseOptions = BaseParseOptions;

export type UnitParseOptions = BaseParseOptions & {
  dimension?: UnitDimension | string;
  unit?: string;
};

export type UnifiedParseOptions =
  | (NumberParseOptions & { kind?: "number" })
  | (MoneyParseOptions & { kind: "money" })
  | (PercentParseOptions & { kind: "percent" })
  | (UnitParseOptions & { kind: "unit" });
