import type {
  NumberSeparators,
  PlatformInfo,
} from "../ExpoNumeratorModule.types";
import {
  getExpoLocalizationInfo,
  type ExpoLocalizationInfo,
} from "./localization";
import {
  getNativeNumberSeparators,
  getNativePlatformInfo,
} from "./nativePlatform";
import type { NumeratorResult } from "../core/value/safeConstructors";
import type {
  DecimalInput,
  MoneyValue,
  NumericValue,
  PercentValue,
  UnitValue,
} from "../core/value/types";
import {
  createNumerator,
  type NumeratorFacade,
} from "../facade/createNumerator";
import { format } from "../format/format";
import { formatMoney } from "../format/formatMoney";
import { formatNumber } from "../format/formatNumber";
import type {
  FormatOptions,
  MoneyFormatOptions,
  NumberFormatOptions,
  PercentFormatOptions,
} from "../format/formatOptions";
import { formatPercent } from "../format/formatPercent";
import { formatUnit, type UnitFormatOptions } from "../format/formatUnit";
import type { NumberInputOptions } from "../input/numberInputTypes";
import type { LocaleSymbols } from "../locale/localeRegistry";
import { getLocaleSymbols, resolveLocale } from "../locale/resolveLocale";
import { parseMoney } from "../parse/parseMoney";
import { parseNumber } from "../parse/parseNumber";
import type {
  MoneyParseOptions,
  NumberParseOptions,
  PercentParseOptions,
  UnitParseOptions,
  UnifiedParseOptions,
} from "../parse/parseOptions";
import { parsePercent } from "../parse/parsePercent";
import { parseUnit } from "../parse/parseUnit";
import {
  safeParseMoney,
  safeParseNumber,
  safeParsePercent,
  safeParseUnit,
} from "../parse/safeParse";
import { convertUnit, type UnitConversionOptions } from "../unit/convertUnit";

export type CreateExpoNumeratorOptions = {
  locale?: string | null;
  fallbackLocale?: string;
  useDeviceLocale?: boolean;
};

export type ExpoNumerator = {
  readonly locale: string;
  readonly fallbackLocale: string;
  readonly localization: ExpoLocalizationInfo;
  readonly platform: PlatformInfo;
  readonly symbols: LocaleSymbols;
  getNumberSeparators: (locale?: string) => NumberSeparators | null;
  format: (
    value: Parameters<typeof format>[0],
    options?: FormatOptions,
  ) => string;
  formatNumber: (value: DecimalInput, options?: NumberFormatOptions) => string;
  formatMoney: (value: MoneyValue, options?: MoneyFormatOptions) => string;
  formatPercent: (
    value: PercentValue,
    options?: PercentFormatOptions,
  ) => string;
  formatUnit: (value: UnitValue, options?: UnitFormatOptions) => string;
  convertUnit: (
    value: UnitValue,
    targetUnit: string,
    options?: UnitConversionOptions,
  ) => UnitValue;
  parse: (text: string, options?: UnifiedParseOptions) => NumericValue;
  parseNumber: (
    text: string,
    options?: NumberParseOptions,
  ) => ReturnType<typeof parseNumber>;
  parseMoney: (
    text: string,
    options: MoneyParseOptions,
  ) => ReturnType<typeof parseMoney>;
  parsePercent: (
    text: string,
    options?: PercentParseOptions,
  ) => ReturnType<typeof parsePercent>;
  parseUnit: (
    text: string,
    options?: UnitParseOptions,
  ) => ReturnType<typeof parseUnit>;
  safeParse: (
    text: string,
    options?: UnifiedParseOptions,
  ) => NumeratorResult<NumericValue>;
  safeParseNumber: (
    text: string,
    options?: NumberParseOptions,
  ) => ReturnType<typeof safeParseNumber>;
  safeParseMoney: (
    text: string,
    options: MoneyParseOptions,
  ) => ReturnType<typeof safeParseMoney>;
  safeParsePercent: (
    text: string,
    options?: PercentParseOptions,
  ) => ReturnType<typeof safeParsePercent>;
  safeParseUnit: (
    text: string,
    options?: UnitParseOptions,
  ) => ReturnType<typeof safeParseUnit>;
  phone: NumeratorFacade["phone"];
  getNumberInputOptions: (options?: NumberInputOptions) => NumberInputOptions;
};

export function createExpoNumerator(
  options: CreateExpoNumeratorOptions = {},
): ExpoNumerator {
  const fallbackLocale = options.fallbackLocale ?? "en-US";
  const localization = getExpoLocalizationInfo();
  const requestedLocale =
    options.locale ??
    (options.useDeviceLocale === false ? null : localization.locale) ??
    fallbackLocale;
  const locale = resolveLocale({ locale: requestedLocale, fallbackLocale });
  const platform = getNativePlatformInfo();
  const symbols = getLocaleSymbols(locale);
  const facade = createNumerator({ locale, fallbackLocale });

  return Object.freeze({
    locale,
    fallbackLocale,
    localization,
    platform,
    symbols,
    getNumberSeparators(targetLocale?: string) {
      return getNativeNumberSeparators(targetLocale ?? locale);
    },
    format(value, formatOptions = {}) {
      return format(value, withLocale(formatOptions, locale));
    },
    formatNumber(value, formatOptions = {}) {
      return formatNumber(value, withLocale(formatOptions, locale));
    },
    formatMoney(value, formatOptions = {}) {
      return formatMoney(value, withLocale(formatOptions, locale));
    },
    formatPercent(value, formatOptions = {}) {
      return formatPercent(value, withLocale(formatOptions, locale));
    },
    formatUnit(value, formatOptions = {}) {
      return formatUnit(value, withLocale(formatOptions, locale));
    },
    convertUnit(value, targetUnit, conversionOptions = {}) {
      return convertUnit(value, targetUnit, conversionOptions);
    },
    parse(text, parseOptions = {}) {
      const optionsWithLocale = withLocale(parseOptions, locale);

      if (optionsWithLocale.kind === "money") {
        return parseMoney(text, optionsWithLocale);
      }

      if (optionsWithLocale.kind === "percent") {
        return parsePercent(text, optionsWithLocale);
      }

      if (optionsWithLocale.kind === "unit") {
        return parseUnit(text, optionsWithLocale);
      }

      return parseNumber(text, optionsWithLocale);
    },
    parseNumber(text, parseOptions = {}) {
      return parseNumber(text, withLocale(parseOptions, locale));
    },
    parseMoney(text, parseOptions) {
      return parseMoney(text, withLocale(parseOptions, locale));
    },
    parsePercent(text, parseOptions = {}) {
      return parsePercent(text, withLocale(parseOptions, locale));
    },
    parseUnit(text, parseOptions = {}) {
      return parseUnit(text, withLocale(parseOptions, locale));
    },
    safeParse(text, parseOptions = {}) {
      const optionsWithLocale = withLocale(parseOptions, locale);

      if (optionsWithLocale.kind === "money") {
        return safeParseMoney(text, optionsWithLocale);
      }

      if (optionsWithLocale.kind === "percent") {
        return safeParsePercent(text, optionsWithLocale);
      }

      if (optionsWithLocale.kind === "unit") {
        return safeParseUnit(text, optionsWithLocale);
      }

      return safeParseNumber(text, optionsWithLocale);
    },
    safeParseNumber(text, parseOptions = {}) {
      return safeParseNumber(text, withLocale(parseOptions, locale));
    },
    safeParseMoney(text, parseOptions) {
      return safeParseMoney(text, withLocale(parseOptions, locale));
    },
    safeParsePercent(text, parseOptions = {}) {
      return safeParsePercent(text, withLocale(parseOptions, locale));
    },
    safeParseUnit(text, parseOptions = {}) {
      return safeParseUnit(text, withLocale(parseOptions, locale));
    },
    phone: facade.phone,
    getNumberInputOptions(inputOptions = {}) {
      return withLocale(inputOptions, locale);
    },
  });
}

function withLocale<TOptions extends { locale?: string }>(
  options: TOptions,
  locale: string,
): TOptions {
  return {
    ...options,
    locale: options.locale ?? locale,
  };
}
