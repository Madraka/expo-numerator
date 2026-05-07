import type { BaseParseOptions } from "./parseOptions";
import { normalizeDecimal } from "../core/decimal/normalizeDecimal";
import { NumeratorError } from "../core/errors/NumeratorError";
import type { DecimalValue } from "../core/value/types";
import type { LocaleSymbols } from "../locale/localeRegistry";
import { normalizeDigits } from "../locale/normalizeDigits";
import { getLocaleSymbols, resolveLocale } from "../locale/resolveLocale";
import { validateGrouping } from "../locale/validateGrouping";

type ParseLocalizedDecimalOptions = BaseParseOptions;

const COMPACT_SPACE_PATTERN = /[\s\u00a0\u202f]/g;
const COMMON_SEPARATOR_PATTERN = /[.,]/g;

export function parseLocalizedDecimal(
  text: string,
  options: ParseLocalizedDecimalOptions = {},
): DecimalValue {
  if (typeof text !== "string") {
    throwParseFailed(text, "Input must be a string.");
  }

  const locale = resolveLocale({ locale: options.locale });
  const symbols = getLocaleSymbols(locale);
  const normalized = normalizeDigits(text).trim();

  if (normalized.length === 0) {
    throwParseFailed(text, "Input is empty.");
  }

  if (normalized.includes(symbols.percentSign)) {
    throw new NumeratorError("INVALID_PERCENT", { value: text, locale });
  }

  return options.mode === "loose"
    ? parseLooseDecimal(normalized, symbols, text)
    : parseStrictDecimal(normalized, symbols, text);
}

function parseStrictDecimal(
  normalized: string,
  symbols: LocaleSymbols,
  original: string,
): DecimalValue {
  const { sign, magnitude } = extractSign(normalized, symbols);

  if (magnitude.length === 0) {
    throwParseFailed(original, "Missing numeric magnitude.");
  }

  const decimalParts = magnitude.split(symbols.decimal);

  if (decimalParts.length > 2) {
    throwParseFailed(original, "Multiple decimal separators.");
  }

  const [integerPart, fractionPart = ""] = decimalParts;

  if (integerPart.length === 0 || !isStrictInteger(integerPart, symbols)) {
    throwParseFailed(original, "Invalid integer part.");
  }

  if (fractionPart.includes(symbols.group)) {
    throw new NumeratorError("INVALID_GROUPING", {
      value: original,
      locale: symbols.locale,
    });
  }

  if (fractionPart.length > 0 && !/^\d+$/.test(fractionPart)) {
    throwParseFailed(original, "Invalid fraction part.");
  }

  if (
    integerPart.includes(symbols.group) &&
    !validateGrouping(`${sign}${magnitude}`, { symbols })
  ) {
    throw new NumeratorError("INVALID_GROUPING", {
      value: original,
      locale: symbols.locale,
    });
  }

  const canonicalInteger = integerPart.split(symbols.group).join("");
  const canonical =
    fractionPart.length > 0
      ? `${sign}${canonicalInteger}.${fractionPart}`
      : `${sign}${canonicalInteger}`;

  return normalizeParsedDecimal(canonical, original);
}

function parseLooseDecimal(
  normalized: string,
  symbols: LocaleSymbols,
  original: string,
): DecimalValue {
  const compact = normalized.replace(COMPACT_SPACE_PATTERN, "");
  const { sign, magnitude } = extractSign(compact, symbols);

  if (magnitude.length === 0) {
    throwParseFailed(original, "Missing numeric magnitude.");
  }

  const decimalSeparator = chooseLooseDecimalSeparator(magnitude, symbols);
  const parts =
    decimalSeparator === null
      ? [magnitude]
      : splitAtLast(magnitude, decimalSeparator);

  if (parts.length !== 1 && parts.length !== 2) {
    throwParseFailed(original, "Invalid separator layout.");
  }

  const [rawInteger, rawFraction = ""] = parts;
  const integer = rawInteger.replace(COMMON_SEPARATOR_PATTERN, "");

  if (!/^\d+$/.test(integer)) {
    throwParseFailed(original, "Invalid integer part.");
  }

  if (rawFraction.length > 0 && !/^\d+$/.test(rawFraction)) {
    throwParseFailed(original, "Invalid fraction part.");
  }

  const canonical =
    rawFraction.length > 0
      ? `${sign}${integer}.${rawFraction}`
      : `${sign}${integer}`;

  return normalizeParsedDecimal(canonical, original);
}

function extractSign(
  text: string,
  symbols: LocaleSymbols,
): { sign: "" | "-" | "+"; magnitude: string } {
  if (text.startsWith(symbols.minusSign)) {
    return { sign: "-", magnitude: text.slice(symbols.minusSign.length) };
  }

  if (text.startsWith(symbols.plusSign)) {
    return { sign: "+", magnitude: text.slice(symbols.plusSign.length) };
  }

  return { sign: "", magnitude: text };
}

function isStrictInteger(integerPart: string, symbols: LocaleSymbols): boolean {
  return integerPart
    .split(symbols.group)
    .every((group) => group.length > 0 && /^\d+$/.test(group));
}

function chooseLooseDecimalSeparator(
  magnitude: string,
  symbols: LocaleSymbols,
): string | null {
  const candidates = unique([symbols.decimal, ".", ","]);
  const positions = candidates
    .map((separator) => ({
      separator,
      index: magnitude.lastIndexOf(separator),
    }))
    .filter((candidate) => candidate.index >= 0)
    .sort((a, b) => b.index - a.index);

  if (positions.length === 0) {
    return null;
  }

  const winner = positions[0];
  const after = magnitude.length - winner.index - winner.separator.length;
  const before = winner.index;
  const separatorCount = countOccurrences(magnitude, winner.separator);

  if (
    positions.length === 1 &&
    separatorCount === 1 &&
    winner.separator === symbols.group &&
    winner.separator !== symbols.decimal &&
    after === symbols.grouping.primary &&
    before >= 1
  ) {
    return null;
  }

  return winner.separator;
}

function splitAtLast(text: string, separator: string): [string, string] {
  const index = text.lastIndexOf(separator);
  return [text.slice(0, index), text.slice(index + separator.length)];
}

function countOccurrences(text: string, token: string): number {
  return text.split(token).length - 1;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.length > 0))];
}

function normalizeParsedDecimal(
  canonical: string,
  original: string,
): DecimalValue {
  try {
    return normalizeDecimal(canonical);
  } catch (error) {
    if (error instanceof NumeratorError) {
      throwParseFailed(original, error.message);
    }

    throw error;
  }
}

function throwParseFailed(value: unknown, reason: string): never {
  throw new NumeratorError("PARSE_FAILED", { value, reason });
}
