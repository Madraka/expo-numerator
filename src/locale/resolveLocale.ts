import {
  getRegisteredLocaleCodes,
  getRegisteredLocaleSymbols,
  type LocaleSymbols,
} from "./localeRegistry";
import { NumeratorError } from "../core/errors/NumeratorError";

export const DEFAULT_LOCALE = "en-US";

export type ResolveLocaleOptions = {
  locale?: string | null;
  fallbackLocale?: string;
};

export function resolveLocale(options: ResolveLocaleOptions = {}): string {
  const requested = options.locale ?? options.fallbackLocale ?? DEFAULT_LOCALE;
  const canonical = canonicalizeLocale(requested);

  if (getRegisteredLocaleSymbols(canonical)) {
    return canonical;
  }

  const languageMatch = getRegisteredLocaleCodes().find(
    (code) => code.split("-")[0] === canonical.split("-")[0],
  );

  if (languageMatch) {
    return languageMatch;
  }

  const fallback = canonicalizeLocale(options.fallbackLocale ?? DEFAULT_LOCALE);

  if (getRegisteredLocaleSymbols(fallback)) {
    return fallback;
  }

  throw new NumeratorError("INVALID_LOCALE", {
    locale: requested,
    fallbackLocale: options.fallbackLocale,
  });
}

export function getLocaleSymbols(
  options: string | ResolveLocaleOptions = {},
): LocaleSymbols {
  const locale =
    typeof options === "string"
      ? resolveLocale({ locale: options })
      : resolveLocale(options);
  const symbols = getRegisteredLocaleSymbols(locale);

  if (!symbols) {
    throw new NumeratorError("INVALID_LOCALE", { locale });
  }

  return symbols;
}

function canonicalizeLocale(locale: string): string {
  const trimmed = locale.trim();

  if (trimmed.length === 0) {
    throw new NumeratorError("INVALID_LOCALE", { locale });
  }

  try {
    return Intl.getCanonicalLocales(trimmed)[0];
  } catch {
    throw new NumeratorError("INVALID_LOCALE", { locale });
  }
}
