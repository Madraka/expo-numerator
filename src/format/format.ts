import { formatMoney } from "./formatMoney";
import { formatNumber } from "./formatNumber";
import type {
  FormatOptions,
  MoneyFormatOptions,
  NumberFormatOptions,
  PercentFormatOptions,
} from "./formatOptions";
import { formatPercent } from "./formatPercent";
import { formatUnit } from "./formatUnit";
import type { UnitFormatOptions } from "./formatUnit";
import { NumeratorError } from "../core/errors/NumeratorError";
import type { NumericValue } from "../core/value/types";

export function format(
  value: NumericValue,
  options: FormatOptions = {},
): string {
  if (value.kind === "money") {
    assertStandardNotationForKind(value.kind, options);
    return formatMoney(value, toMoneyFormatOptions(options));
  }

  if (value.kind === "percent") {
    assertStandardNotationForKind(value.kind, options);
    return formatPercent(value, toPercentFormatOptions(options));
  }

  if (value.kind === "unit") {
    return formatUnit(value, toUnitFormatOptions(options));
  }

  return formatNumber(value, toNumberFormatOptions(options));
}

function toMoneyFormatOptions(options: FormatOptions): MoneyFormatOptions {
  const { style, ...rest } = options;
  return rest;
}

function toPercentFormatOptions(options: FormatOptions): PercentFormatOptions {
  const { style, currencyDisplay, currencySign, ...rest } = options;
  return rest;
}

function toNumberFormatOptions(options: FormatOptions): NumberFormatOptions {
  const { style, currencyDisplay, currencySign, unitDisplay, ...rest } =
    options;
  return rest;
}

function toUnitFormatOptions(options: FormatOptions): UnitFormatOptions {
  const { style, currencyDisplay, currencySign, ...rest } = options;
  return rest;
}

function assertStandardNotationForKind(
  kind: "money" | "percent",
  options: FormatOptions,
): void {
  if (options.notation === undefined || options.notation === "standard") {
    return;
  }

  throw new NumeratorError("UNSUPPORTED_NOTATION", {
    kind,
    notation: options.notation,
    reason:
      "Advanced notation is currently supported for decimal and unit values.",
  });
}
