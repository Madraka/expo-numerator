import { parseLocalizedDecimal } from "./parseLocalizedDecimal";
import type { MoneyParseOptions } from "./parseOptions";
import { NumeratorError } from "../core/errors/NumeratorError";
import type { MoneyValue } from "../core/value/types";
import { normalizeDigits } from "../locale/normalizeDigits";
import {
  getCurrencyMeta,
  getRegisteredCurrencies,
} from "../money/currencyRegistry";
import { money } from "../money/money";

const SURROUNDING_ACCOUNTING_PATTERN = /^\((.*)\)$/;

export function parseMoney(
  text: string,
  options: MoneyParseOptions,
): MoneyValue {
  if (!options || options.currency === undefined || options.currency === null) {
    throw new NumeratorError("INVALID_CURRENCY", { currency: undefined });
  }

  const meta = getCurrencyMeta(options.currency);
  const normalized = normalizeDigits(text).trim();
  assertNoMismatchedCurrency(normalized, meta.code);

  const { negative, inner } = unwrapAccounting(normalized);
  const numericText = removeCurrencyMarkers(inner, meta);
  const signedText = negative ? `-${numericText}` : numericText;
  const parsed = parseLocalizedDecimal(signedText, options);

  return money(parsed.value, meta.code);
}

function unwrapAccounting(text: string): { negative: boolean; inner: string } {
  const match = SURROUNDING_ACCOUNTING_PATTERN.exec(text);

  if (!match) {
    return { negative: false, inner: text };
  }

  return { negative: true, inner: match[1] };
}

function removeCurrencyMarkers(
  text: string,
  meta: ReturnType<typeof getCurrencyMeta>,
): string {
  return getCurrencyMarkers(meta).reduce(
    (current, marker) => removeLiteral(current, marker),
    text,
  );
}

function assertNoMismatchedCurrency(text: string, targetCode: string): void {
  const upper = text.toUpperCase();
  const detectedSymbolCodes = getDetectedCurrencySymbolCodes(text);

  for (const currency of getRegisteredCurrencies()) {
    if (currency.code === targetCode) {
      continue;
    }

    if (containsCurrencyCode(upper, currency.code)) {
      throw new NumeratorError("INVALID_CURRENCY", {
        currency: targetCode,
        detectedCurrency: currency.code,
      });
    }
  }

  for (const detectedCurrency of detectedSymbolCodes) {
    if (detectedCurrency !== targetCode) {
      throw new NumeratorError("INVALID_CURRENCY", {
        currency: targetCode,
        detectedCurrency,
      });
    }
  }
}

function getCurrencyMarkers(
  meta: ReturnType<typeof getCurrencyMeta>,
): string[] {
  return [meta.symbol, meta.code, meta.name]
    .filter((marker): marker is string => Boolean(marker))
    .sort((a, b) => b.length - a.length);
}

function getUniqueCurrencySymbols(): Set<string> {
  const counts = new Map<string, number>();

  for (const currency of getRegisteredCurrencies()) {
    if (currency.symbol) {
      counts.set(currency.symbol, (counts.get(currency.symbol) ?? 0) + 1);
    }
  }

  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count === 1)
      .map(([symbol]) => symbol),
  );
}

function getDetectedCurrencySymbolCodes(text: string): string[] {
  const uniqueSymbols = getUniqueCurrencySymbols();
  const symbols = getRegisteredCurrencies()
    .flatMap((currency) =>
      currency.symbol && uniqueSymbols.has(currency.symbol)
        ? [{ code: currency.code, symbol: currency.symbol }]
        : [],
    )
    .sort((a, b) => b.symbol.length - a.symbol.length);
  const occupiedRanges: { start: number; end: number }[] = [];
  const detectedCodes = new Set<string>();

  for (const currency of symbols) {
    let start = text.indexOf(currency.symbol);

    while (start !== -1) {
      const end = start + currency.symbol.length;

      if (!isOverlappingRange(start, end, occupiedRanges)) {
        occupiedRanges.push({ start, end });
        detectedCodes.add(currency.code);
      }

      start = text.indexOf(currency.symbol, end);
    }
  }

  return [...detectedCodes];
}

function isOverlappingRange(
  start: number,
  end: number,
  ranges: { start: number; end: number }[],
): boolean {
  return ranges.some((range) => start < range.end && end > range.start);
}

function containsCurrencyCode(text: string, code: string): boolean {
  const pattern = new RegExp(`(^|[^A-Z])${escapeRegExp(code)}([^A-Z]|$)`);
  return pattern.test(text);
}

function removeLiteral(text: string, literal: string): string {
  return text.replace(new RegExp(escapeRegExp(literal), "gi"), "");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
