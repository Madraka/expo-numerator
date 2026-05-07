import { formatDecimalString } from "./formatDecimalString";
import type { MoneyFormatOptions } from "./formatOptions";
import type { MoneyValue } from "../core/value/types";
import { getLocaleSymbols } from "../locale/resolveLocale";
import { getCurrencyMeta } from "../money/currencyRegistry";

export function formatMoney(
  value: MoneyValue,
  options: MoneyFormatOptions = {},
): string {
  const meta = getCurrencyMeta(value.currency);
  const display = options.currencyDisplay ?? "symbol";
  const formatted = formatDecimalString(value.amount, {
    ...options,
    minimumFractionDigits: options.minimumFractionDigits ?? value.scale,
    maximumFractionDigits: options.maximumFractionDigits ?? value.scale,
    signDisplay: "never",
  });
  const currency = getCurrencyDisplay(meta, display);
  const signed = value.amount.startsWith("-");
  const prefixDisplay = display === "code" || display === "name";

  if (prefixDisplay && signed && options.currencySign === "accounting") {
    return `(${currency}${formatted})`;
  }

  if (prefixDisplay) {
    return `${signed ? "-" : ""}${currency}${formatted}`;
  }

  const symbols = getLocaleSymbols({ locale: options.locale });
  const unsigned = applyCurrencyPattern(
    formatted,
    currency,
    symbols.currencyPattern,
  );

  if (signed && options.currencySign === "accounting") {
    return `(${unsigned})`;
  }

  return `${signed ? symbols.minusSign : ""}${unsigned}`;
}

function getCurrencyDisplay(
  meta: ReturnType<typeof getCurrencyMeta>,
  display: NonNullable<MoneyFormatOptions["currencyDisplay"]>,
): string {
  if (display === "code") {
    return `${meta.code} `;
  }

  if (display === "name") {
    return `${meta.name ?? meta.code} `;
  }

  return meta.symbol ?? meta.code;
}

function applyCurrencyPattern(
  formatted: string,
  currency: string,
  pattern: { readonly prefix: string; readonly suffix: string },
): string {
  return `${pattern.prefix.replace(/\{currency\}/g, currency)}${formatted}${pattern.suffix.replace(/\{currency\}/g, currency)}`;
}
