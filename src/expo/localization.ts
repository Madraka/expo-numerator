import { getNativePreferredLocale } from "./nativePlatform";

declare const require: (moduleName: string) => unknown;

export type ExpoLocalizationInfo = {
  locale: string | null;
  locales: readonly string[];
  timezone: string | null;
  source: "expo-localization" | "native" | "intl" | "none";
};

type ExpoLocalizationModule = {
  locale?: string | null;
  timezone?: string | null;
  getLocales?: () => { languageTag?: string | null }[];
  getCalendars?: () => { timeZone?: string | null }[];
};

let cachedLocalizationModule: ExpoLocalizationModule | null | undefined;

export function getExpoLocalizationInfo(): ExpoLocalizationInfo {
  const expoInfo = readExpoLocalizationInfo();

  if (expoInfo) {
    return expoInfo;
  }

  const nativeLocale = getNativePreferredLocale();

  if (nativeLocale) {
    return {
      locale: nativeLocale,
      locales: [nativeLocale],
      timezone: getIntlTimezone(),
      source: "native",
    };
  }

  const intlLocale = getIntlLocale();

  if (intlLocale) {
    return {
      locale: intlLocale,
      locales: [intlLocale],
      timezone: getIntlTimezone(),
      source: "intl",
    };
  }

  return {
    locale: null,
    locales: [],
    timezone: null,
    source: "none",
  };
}

function readExpoLocalizationInfo(): ExpoLocalizationInfo | null {
  const localization = getExpoLocalizationModule();

  if (!localization) {
    return null;
  }

  const locales =
    localization
      .getLocales?.()
      ?.map((locale) => locale.languageTag)
      .filter((locale): locale is string => Boolean(locale)) ?? [];
  const locale = locales[0] ?? localization.locale ?? null;

  if (!locale) {
    return null;
  }

  return {
    locale,
    locales,
    timezone:
      localization.getCalendars?.()[0]?.timeZone ??
      localization.timezone ??
      getIntlTimezone(),
    source: "expo-localization",
  };
}

function getExpoLocalizationModule(): ExpoLocalizationModule | null {
  if (cachedLocalizationModule !== undefined) {
    return cachedLocalizationModule;
  }

  try {
    cachedLocalizationModule =
      require("expo-localization") as ExpoLocalizationModule;
  } catch {
    cachedLocalizationModule = null;
  }

  return cachedLocalizationModule;
}

function getIntlLocale(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale ?? null;
  } catch {
    return null;
  }
}

function getIntlTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}
