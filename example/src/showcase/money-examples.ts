import { createMoneyInputOptions } from "expo-numerator";

export function getShowcaseCurrencyForLocale(locale: string): string {
  if (locale === "tr-TR") {
    return "TRY";
  }

  if (locale === "de-DE" || locale === "fr-FR") {
    return "EUR";
  }

  if (locale === "en-IN") {
    return "INR";
  }

  if (locale === "ja-JP") {
    return "JPY";
  }

  return "USD";
}

export function getCurrencyFractionDigits(currency: string): number {
  return createMoneyInputOptions(currency).maximumFractionDigits ?? 0;
}

export function getDefaultMoneyInputValue(currency: string): string {
  return getCurrencyFractionDigits(currency) === 0 ? "1234" : "1234.50";
}

export function getMoneyInputPlaceholder(locale: string, currency: string): string {
  if (getCurrencyFractionDigits(currency) === 0) {
    return "1234";
  }

  return locale === "tr-TR" || locale === "de-DE" || locale === "fr-FR"
    ? "1234,56"
    : "1234.56";
}
