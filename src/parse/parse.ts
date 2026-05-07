import { parseMoney } from "./parseMoney";
import { parseNumber } from "./parseNumber";
import type {
  MoneyParseOptions,
  NumberParseOptions,
  PercentParseOptions,
  UnitParseOptions,
  UnifiedParseOptions,
} from "./parseOptions";
import { parsePercent } from "./parsePercent";
import { parseUnit } from "./parseUnit";
import type {
  DecimalValue,
  MoneyValue,
  NumericValue,
  PercentValue,
  UnitValue,
} from "../core/value/types";

export function parse(
  text: string,
  options?: NumberParseOptions & { kind?: "number" },
): DecimalValue;
export function parse(
  text: string,
  options: MoneyParseOptions & { kind: "money" },
): MoneyValue;
export function parse(
  text: string,
  options: PercentParseOptions & { kind: "percent" },
): PercentValue;
export function parse(
  text: string,
  options: UnitParseOptions & { kind: "unit" },
): UnitValue;
export function parse(
  text: string,
  options: UnifiedParseOptions = {},
): NumericValue {
  if (options.kind === "money") {
    return parseMoney(text, options);
  }

  if (options.kind === "percent") {
    return parsePercent(text, options);
  }

  if (options.kind === "unit") {
    return parseUnit(text, options);
  }

  return parseNumber(text, options);
}
