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
import { normalizeCaughtError } from "../core/errors/normalizeCaughtError";
import type { NumeratorResult } from "../core/value/safeConstructors";
import type {
  DecimalValue,
  MoneyValue,
  NumericValue,
  PercentValue,
  UnitValue,
} from "../core/value/types";

export function safeParseNumber(
  text: string,
  options: NumberParseOptions = {},
): NumeratorResult<DecimalValue> {
  return safeParseCall(() => parseNumber(text, options));
}

export function safeParseMoney(
  text: string,
  options: MoneyParseOptions,
): NumeratorResult<MoneyValue> {
  return safeParseCall(() => parseMoney(text, options));
}

export function safeParsePercent(
  text: string,
  options: PercentParseOptions = {},
): NumeratorResult<PercentValue> {
  return safeParseCall(() => parsePercent(text, options));
}

export function safeParseUnit(
  text: string,
  options: UnitParseOptions = {},
): NumeratorResult<UnitValue> {
  return safeParseCall(() => parseUnit(text, options));
}

export function safeParse(
  text: string,
  options?: NumberParseOptions & { kind?: "number" },
): NumeratorResult<DecimalValue>;
export function safeParse(
  text: string,
  options: MoneyParseOptions & { kind: "money" },
): NumeratorResult<MoneyValue>;
export function safeParse(
  text: string,
  options: PercentParseOptions & { kind: "percent" },
): NumeratorResult<PercentValue>;
export function safeParse(
  text: string,
  options: UnitParseOptions & { kind: "unit" },
): NumeratorResult<UnitValue>;
export function safeParse(
  text: string,
  options: UnifiedParseOptions = {},
): NumeratorResult<NumericValue> {
  if (options.kind === "money") {
    return safeParseMoney(text, options);
  }

  if (options.kind === "percent") {
    return safeParsePercent(text, options);
  }

  if (options.kind === "unit") {
    return safeParseUnit(text, options);
  }

  return safeParseNumber(text, options);
}

function safeParseCall<T>(operation: () => T): NumeratorResult<T> {
  try {
    return Object.freeze({
      ok: true,
      value: operation(),
    });
  } catch (error) {
    return Object.freeze({
      ok: false,
      error: normalizeCaughtError(error, "Unexpected parse failure."),
    });
  }
}
