import type { RoundingMode } from "../rounding/roundingModes";
import type { UnitDisplay } from "../unit/unitMeta";

export type UseGrouping = boolean | "auto" | "always" | "min2";
export type NumberNotation =
  | "standard"
  | "compact"
  | "scientific"
  | "engineering";

export type BaseFormatOptions = {
  locale?: string;
  useGrouping?: UseGrouping;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  roundingMode?: RoundingMode;
  trailingZeroDisplay?: "auto" | "stripIfInteger";
  signDisplay?: "auto" | "never" | "always" | "exceptZero" | "negative";
};

export type NumberFormatOptions = BaseFormatOptions & {
  style?: "decimal";
  notation?: NumberNotation;
  compactDisplay?: "short" | "long";
};

export type MoneyFormatOptions = BaseFormatOptions & {
  style?: "currency";
  currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name";
  currencySign?: "standard" | "accounting";
};

export type PercentFormatOptions = BaseFormatOptions & {
  style?: "percent";
};

export type FormatOptions = BaseFormatOptions & {
  style?: "currency" | "decimal" | "percent" | "unit";
  notation?: NumberNotation;
  compactDisplay?: NumberFormatOptions["compactDisplay"];
  currencyDisplay?: MoneyFormatOptions["currencyDisplay"];
  currencySign?: MoneyFormatOptions["currencySign"];
  unitDisplay?: UnitDisplay;
};
