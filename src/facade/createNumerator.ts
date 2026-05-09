import { compareDecimal } from "../core/decimal/compareDecimal";
import {
  addDecimal,
  divideDecimal,
  multiplyDecimal,
  subtractDecimal,
} from "../core/decimal/decimalArithmetic";
import { normalizeDecimal } from "../core/decimal/normalizeDecimal";
import { scaleDecimal } from "../core/decimal/scaleDecimal";
import { isMoney, isPercent, isUnit } from "../core/validation/numericGuards";
import { decimal } from "../core/value/decimal";
import { percent } from "../core/value/percent";
import {
  safeDecimal,
  safeMoney,
  safePercent,
  safeUnit,
} from "../core/value/safeConstructors";
import type { NumeratorResult } from "../core/value/safeConstructors";
import type {
  DecimalInput,
  MoneyValue,
  NumericValue,
  PercentValue,
  UnitValue,
} from "../core/value/types";
import { unit } from "../core/value/unit";
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
import {
  formatUnit,
  formatUnitBestFit,
  formatUnitForLocale,
  type UnitBestFitFormatOptions,
  type UnitFormatOptions,
  type UnitLocaleFormatOptions,
} from "../format/formatUnit";
import { createIntegerInputOptions } from "../input/integerInputOptions";
import type { IntegerInputOptions } from "../input/integerInputOptions";
import { createMoneyInputOptions } from "../input/moneyInputOptions";
import type { MoneyInputOptions } from "../input/moneyInputOptions";
import { createNumberInputState } from "../input/numberInputState";
import type { NumberInputOptions } from "../input/numberInputTypes";
import { createPercentInputOptions } from "../input/percentInputOptions";
import type { PercentInputOptions } from "../input/percentInputOptions";
import { createUnitInputOptions } from "../input/unitInputOptions";
import type { UnitInputOptions } from "../input/unitInputOptions";
import type { LocaleSymbols } from "../locale/localeRegistry";
import { normalizeDigits } from "../locale/normalizeDigits";
import { getLocaleSymbols, resolveLocale } from "../locale/resolveLocale";
import { allocateMoney } from "../money/allocation";
import type {
  AllocateMoneyOptions,
  AllocationRatio,
} from "../money/allocation";
import type { CurrencyCode } from "../money/currencyMeta";
import {
  getCurrencyMeta,
  getRegisteredCurrencies,
  getRegisteredCurrencyCodes,
  isCurrencyCode,
  registerCurrency,
} from "../money/currencyRegistry";
import { fromMinorUnits, toMinorUnits } from "../money/minorUnits";
import type { ToMinorUnitsOptions } from "../money/minorUnits";
import { money } from "../money/money";
import { parseMoney } from "../parse/parseMoney";
import { parseNumber } from "../parse/parseNumber";
import type {
  MoneyParseOptions,
  NumberParseOptions,
  PercentParseOptions,
  UnifiedParseOptions,
  UnitParseOptions,
} from "../parse/parseOptions";
import { parsePercent } from "../parse/parsePercent";
import { parseUnit } from "../parse/parseUnit";
import {
  safeParseMoney,
  safeParseNumber,
  safeParsePercent,
  safeParseUnit,
} from "../parse/safeParse";
import { formatPhone } from "../phone/formatPhone";
import { parsePhone, safeParsePhone } from "../phone/parsePhone";
import { phone } from "../phone/phone";
import { createPhoneInputState } from "../phone/phoneInputState";
import {
  getPhoneCountries,
  getPhoneCountryMeta,
  getPhoneExampleNumber,
  getPhoneMetadataInfo,
} from "../phone/phoneRegistry";
import type {
  PhoneFormatOptions,
  PhoneValue,
  PhoneInputOptions,
  PhoneCountryListOptions,
  PhoneParseOptions,
} from "../phone/phoneTypes";
import { roundDecimal } from "../rounding/roundDecimal";
import { convertUnit } from "../unit/convertUnit";
import {
  convertUnitToBestFit,
  getUnitBestFitCandidates,
} from "../unit/unitMagnitude";
import type { UnitBestFitOptions } from "../unit/unitMagnitude";
import type { UnitRegistration } from "../unit/unitMeta";
import {
  convertUnitForLocale,
  getPreferredUnitForDimension,
  getPreferredUnitForValue,
  getUnitSystemForLocale,
} from "../unit/unitPreferences";
import type {
  UnitLocaleConversionOptions,
  UnitPreferenceOptions,
} from "../unit/unitPreferences";
import {
  getRegisteredUnitCodes,
  getRegisteredUnits,
  getUnitAliases,
  getUnitLabels,
  getUnitMeta,
  getUnitsByDimension,
  isUnitCode,
  normalizeUnitCode,
  registerUnit,
} from "../unit/unitRegistry";

export type CreateNumeratorOptions = {
  readonly locale?: string | null;
  readonly fallbackLocale?: string;
};

export type NumeratorFacade = {
  readonly locale: string;
  readonly fallbackLocale: string;
  readonly symbols: LocaleSymbols;
  format: (value: NumericValue, options?: FormatOptions) => string;
  parse: (text: string, options?: UnifiedParseOptions) => NumericValue;
  safeParse: (
    text: string,
    options?: UnifiedParseOptions,
  ) => NumeratorResult<NumericValue>;
  decimal: {
    create: typeof decimal;
    safe: typeof safeDecimal;
    normalize: typeof normalizeDecimal;
    compare: typeof compareDecimal;
    scale: typeof scaleDecimal;
    round: typeof roundDecimal;
    add: typeof addDecimal;
    subtract: typeof subtractDecimal;
    multiply: typeof multiplyDecimal;
    divide: typeof divideDecimal;
    format: (value: DecimalInput, options?: NumberFormatOptions) => string;
    parse: (
      text: string,
      options?: NumberParseOptions,
    ) => ReturnType<typeof parseNumber>;
    safeParse: (
      text: string,
      options?: NumberParseOptions,
    ) => ReturnType<typeof safeParseNumber>;
    input: (options?: NumberInputOptions) => NumberInputOptions;
  };
  money: {
    create: typeof money;
    safe: typeof safeMoney;
    format: {
      (value: MoneyValue, options?: MoneyFormatOptions): string;
      (
        value: DecimalInput,
        currency: CurrencyCode | string,
        options?: MoneyFormatOptions,
      ): string;
    };
    parse: {
      (text: string, options: MoneyParseOptions): ReturnType<typeof parseMoney>;
      (
        text: string,
        currency: CurrencyCode | string,
        options?: Omit<MoneyParseOptions, "currency">,
      ): ReturnType<typeof parseMoney>;
    };
    safeParse: {
      (
        text: string,
        options: MoneyParseOptions,
      ): ReturnType<typeof safeParseMoney>;
      (
        text: string,
        currency: CurrencyCode | string,
        options?: Omit<MoneyParseOptions, "currency">,
      ): ReturnType<typeof safeParseMoney>;
    };
    input: (
      currencyCode: string,
      options?: MoneyInputOptions,
    ) => NumberInputOptions;
    toMinorUnits: typeof toMinorUnits;
    fromMinorUnits: typeof fromMinorUnits;
    allocate: typeof allocateMoney;
    getMeta: typeof getCurrencyMeta;
    list: typeof getRegisteredCurrencies;
    codes: typeof getRegisteredCurrencyCodes;
    isCode: typeof isCurrencyCode;
    register: typeof registerCurrency;
  };
  percent: {
    create: typeof percent;
    safe: typeof safePercent;
    format: (
      value: DecimalInput | PercentValue,
      options?: PercentFormatOptions,
    ) => string;
    parse: (
      text: string,
      options?: PercentParseOptions,
    ) => ReturnType<typeof parsePercent>;
    safeParse: (
      text: string,
      options?: PercentParseOptions,
    ) => ReturnType<typeof safeParsePercent>;
    input: (options?: PercentInputOptions) => NumberInputOptions;
  };
  unit: {
    create: typeof unit;
    safe: typeof safeUnit;
    format: {
      (value: UnitValue, options?: UnitFormatOptions): string;
      (
        value: DecimalInput,
        unitCode: string,
        options?: UnitFormatOptions,
      ): string;
    };
    formatForLocale: {
      (value: UnitValue, options?: UnitLocaleFormatOptions): string;
      (
        value: DecimalInput,
        unitCode: string,
        options?: UnitLocaleFormatOptions,
      ): string;
    };
    formatBestFit: {
      (value: UnitValue, options?: UnitBestFitFormatOptions): string;
      (
        value: DecimalInput,
        unitCode: string,
        options?: UnitBestFitFormatOptions,
      ): string;
    };
    parse: (
      text: string,
      options?: UnitParseOptions,
    ) => ReturnType<typeof parseUnit>;
    safeParse: (
      text: string,
      options?: UnitParseOptions,
    ) => ReturnType<typeof safeParseUnit>;
    convert: typeof convertUnit;
    convertForLocale: typeof convertUnitForLocale;
    convertToBestFit: typeof convertUnitToBestFit;
    input: (unitCode: string, options?: UnitInputOptions) => NumberInputOptions;
    getMeta: typeof getUnitMeta;
    list: typeof getRegisteredUnits;
    codes: typeof getRegisteredUnitCodes;
    aliases: typeof getUnitAliases;
    labels: typeof getUnitLabels;
    byDimension: typeof getUnitsByDimension;
    bestFitCandidates: typeof getUnitBestFitCandidates;
    preferredForDimension: typeof getPreferredUnitForDimension;
    preferredForValue: typeof getPreferredUnitForValue;
    systemForLocale: typeof getUnitSystemForLocale;
    isCode: typeof isUnitCode;
    normalizeCode: typeof normalizeUnitCode;
    register: typeof registerUnit;
  };
  phone: {
    create: typeof phone;
    format: (
      value: Parameters<typeof formatPhone>[0],
      options?: PhoneFormatOptions,
    ) => string;
    parse: (
      text: string,
      options?: PhoneParseOptions,
    ) => ReturnType<typeof parsePhone>;
    safeParse: (
      text: string,
      options?: PhoneParseOptions,
    ) => ReturnType<typeof safeParsePhone>;
    input: (options?: PhoneInputOptions) => PhoneInputOptions;
    state: typeof createPhoneInputState;
    countries: (
      options?: PhoneCountryListOptions,
    ) => ReturnType<typeof getPhoneCountries>;
    getCountry: typeof getPhoneCountryMeta;
    example: typeof getPhoneExampleNumber;
    metadata: typeof getPhoneMetadataInfo;
  };
  input: {
    state: typeof createNumberInputState;
    decimal: (options?: NumberInputOptions) => NumberInputOptions;
    money: (
      currencyCode: string,
      options?: MoneyInputOptions,
    ) => NumberInputOptions;
    percent: (options?: PercentInputOptions) => NumberInputOptions;
    integer: (options?: IntegerInputOptions) => NumberInputOptions;
    unit: (unitCode: string, options?: UnitInputOptions) => NumberInputOptions;
    phone: (options?: PhoneInputOptions) => PhoneInputOptions;
  };
  locales: {
    resolve: typeof resolveLocale;
    symbols: typeof getLocaleSymbols;
    normalizeDigits: typeof normalizeDigits;
  };
};

export function createNumerator(
  options: CreateNumeratorOptions = {},
): NumeratorFacade {
  const fallbackLocale = options.fallbackLocale ?? "en-US";
  const locale = resolveLocale({
    fallbackLocale,
    locale: options.locale ?? fallbackLocale,
  });
  const symbols = getLocaleSymbols(locale);

  return Object.freeze({
    locale,
    fallbackLocale,
    symbols,
    format(value, formatOptions = {}) {
      return format(value, withLocale(formatOptions, locale));
    },
    parse(text: string, parseOptions: UnifiedParseOptions = {}) {
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
    safeParse(text: string, parseOptions: UnifiedParseOptions = {}) {
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
    decimal: Object.freeze({
      create: decimal,
      safe: safeDecimal,
      normalize: normalizeDecimal,
      compare: compareDecimal,
      scale: scaleDecimal,
      round: roundDecimal,
      add: addDecimal,
      subtract: subtractDecimal,
      multiply: multiplyDecimal,
      divide: divideDecimal,
      format(value: DecimalInput, formatOptions = {}) {
        return formatNumber(value, withLocale(formatOptions, locale));
      },
      parse(text: string, parseOptions = {}) {
        return parseNumber(text, withLocale(parseOptions, locale));
      },
      safeParse(text: string, parseOptions = {}) {
        return safeParseNumber(text, withLocale(parseOptions, locale));
      },
      input(inputOptions = {}) {
        return withLocale(inputOptions, locale);
      },
    }),
    money: Object.freeze({
      create: money,
      safe: safeMoney,
      format(
        value: DecimalInput | MoneyValue,
        currencyOrOptions?: string | MoneyFormatOptions,
        formatOptions?: MoneyFormatOptions,
      ) {
        const moneyValue = isMoney(value)
          ? value
          : money(value, currencyOrOptions as string);
        const optionsWithLocale = isMoney(value)
          ? withLocale((currencyOrOptions as MoneyFormatOptions) ?? {}, locale)
          : withLocale(formatOptions ?? {}, locale);

        return formatMoney(moneyValue, optionsWithLocale);
      },
      parse(
        text: string,
        currencyOrOptions: string | MoneyParseOptions,
        parseOptions = {},
      ) {
        return parseMoney(
          text,
          withLocale(
            toMoneyParseOptions(currencyOrOptions, parseOptions),
            locale,
          ),
        );
      },
      safeParse(
        text: string,
        currencyOrOptions: string | MoneyParseOptions,
        parseOptions = {},
      ) {
        return safeParseMoney(
          text,
          withLocale(
            toMoneyParseOptions(currencyOrOptions, parseOptions),
            locale,
          ),
        );
      },
      input(currencyCode: string, inputOptions = {}) {
        return createMoneyInputOptions(
          currencyCode,
          withLocale(inputOptions, locale),
        );
      },
      toMinorUnits(
        value: DecimalInput,
        currencyCode: string,
        minorOptions?: ToMinorUnitsOptions,
      ) {
        return toMinorUnits(value, currencyCode, minorOptions);
      },
      fromMinorUnits,
      allocate(
        value: MoneyValue,
        ratios: readonly AllocationRatio[],
        allocationOptions?: AllocateMoneyOptions,
      ) {
        return allocateMoney(value, ratios, allocationOptions);
      },
      getMeta: getCurrencyMeta,
      list: getRegisteredCurrencies,
      codes: getRegisteredCurrencyCodes,
      isCode: isCurrencyCode,
      register: registerCurrency,
    }),
    percent: Object.freeze({
      create: percent,
      safe: safePercent,
      format(value: DecimalInput | PercentValue, formatOptions = {}) {
        return formatPercent(
          isPercent(value) ? value : percent(value),
          withLocale(formatOptions, locale),
        );
      },
      parse(text: string, parseOptions = {}) {
        return parsePercent(text, withLocale(parseOptions, locale));
      },
      safeParse(text: string, parseOptions = {}) {
        return safeParsePercent(text, withLocale(parseOptions, locale));
      },
      input(inputOptions = {}) {
        return createPercentInputOptions(withLocale(inputOptions, locale));
      },
    }),
    unit: Object.freeze({
      create: unit,
      safe: safeUnit,
      format(
        value: DecimalInput | UnitValue,
        unitOrOptions?: string | UnitFormatOptions,
        formatOptions?: UnitFormatOptions,
      ) {
        const unitValue = isUnit(value)
          ? value
          : unit(value, unitOrOptions as string);
        const optionsWithLocale = isUnit(value)
          ? withLocale((unitOrOptions as UnitFormatOptions) ?? {}, locale)
          : withLocale(formatOptions ?? {}, locale);

        return formatUnit(unitValue, optionsWithLocale);
      },
      formatForLocale(
        value: DecimalInput | UnitValue,
        unitOrOptions?: string | UnitLocaleFormatOptions,
        formatOptions?: UnitLocaleFormatOptions,
      ) {
        const unitValue = isUnit(value)
          ? value
          : unit(value, unitOrOptions as string);
        const optionsWithLocale = isUnit(value)
          ? withLocale((unitOrOptions as UnitLocaleFormatOptions) ?? {}, locale)
          : withLocale(formatOptions ?? {}, locale);

        return formatUnitForLocale(unitValue, optionsWithLocale);
      },
      formatBestFit(
        value: DecimalInput | UnitValue,
        unitOrOptions?: string | UnitBestFitFormatOptions,
        formatOptions?: UnitBestFitFormatOptions,
      ) {
        const unitValue = isUnit(value)
          ? value
          : unit(value, unitOrOptions as string);
        const optionsWithLocale = isUnit(value)
          ? withLocale(
              (unitOrOptions as UnitBestFitFormatOptions) ?? {},
              locale,
            )
          : withLocale(formatOptions ?? {}, locale);

        return formatUnitBestFit(unitValue, optionsWithLocale);
      },
      parse(text: string, parseOptions = {}) {
        return parseUnit(text, withLocale(parseOptions, locale));
      },
      safeParse(text: string, parseOptions = {}) {
        return safeParseUnit(text, withLocale(parseOptions, locale));
      },
      convert: convertUnit,
      convertForLocale(
        value: UnitValue,
        conversionOptions?: UnitLocaleConversionOptions,
      ) {
        return convertUnitForLocale(
          value,
          withLocale(conversionOptions ?? {}, locale),
        );
      },
      convertToBestFit(value: UnitValue, bestFitOptions?: UnitBestFitOptions) {
        return convertUnitToBestFit(value, bestFitOptions);
      },
      input(unitCode: string, inputOptions = {}) {
        return createUnitInputOptions(
          unitCode,
          withLocale(inputOptions, locale),
        );
      },
      getMeta: getUnitMeta,
      list: getRegisteredUnits,
      codes: getRegisteredUnitCodes,
      aliases: getUnitAliases,
      labels: getUnitLabels,
      byDimension: getUnitsByDimension,
      bestFitCandidates: getUnitBestFitCandidates,
      preferredForDimension(
        dimension: Parameters<typeof getPreferredUnitForDimension>[0],
        preferenceOptions?: UnitPreferenceOptions,
      ) {
        return getPreferredUnitForDimension(
          dimension,
          withLocale(preferenceOptions ?? {}, locale),
        );
      },
      preferredForValue(
        value: UnitValue,
        preferenceOptions?: UnitPreferenceOptions,
      ) {
        return getPreferredUnitForValue(
          value,
          withLocale(preferenceOptions ?? {}, locale),
        );
      },
      systemForLocale(targetLocale = locale) {
        return getUnitSystemForLocale(targetLocale);
      },
      isCode: isUnitCode,
      normalizeCode: normalizeUnitCode,
      register(registration: UnitRegistration) {
        return registerUnit(registration);
      },
    }),
    phone: Object.freeze({
      create(input: string | PhoneValue, parseOptions = {}) {
        return phone(input, withPhoneDefaults(parseOptions, locale));
      },
      format(
        value: string | PhoneValue,
        formatOptions: PhoneFormatOptions = {},
      ) {
        return formatPhone(value, formatOptions);
      },
      parse(text: string, parseOptions = {}) {
        return parsePhone(text, withPhoneDefaults(parseOptions, locale));
      },
      safeParse(text: string, parseOptions = {}) {
        return safeParsePhone(text, withPhoneDefaults(parseOptions, locale));
      },
      input(inputOptions = {}) {
        return withPhoneDefaults(inputOptions, locale);
      },
      state: createPhoneInputState,
      countries(countryOptions = {}) {
        return getPhoneCountries(withLocale(countryOptions, locale));
      },
      getCountry: getPhoneCountryMeta,
      example: getPhoneExampleNumber,
      metadata: getPhoneMetadataInfo,
    }),
    input: Object.freeze({
      state: createNumberInputState,
      decimal(inputOptions = {}) {
        return withLocale(inputOptions, locale);
      },
      money(currencyCode: string, inputOptions = {}) {
        return createMoneyInputOptions(
          currencyCode,
          withLocale(inputOptions, locale),
        );
      },
      percent(inputOptions = {}) {
        return createPercentInputOptions(withLocale(inputOptions, locale));
      },
      integer(inputOptions = {}) {
        return createIntegerInputOptions(withLocale(inputOptions, locale));
      },
      unit(unitCode: string, inputOptions = {}) {
        return createUnitInputOptions(
          unitCode,
          withLocale(inputOptions, locale),
        );
      },
      phone(inputOptions = {}) {
        return withPhoneDefaults(inputOptions, locale);
      },
    }),
    locales: Object.freeze({
      resolve: resolveLocale,
      symbols: getLocaleSymbols,
      normalizeDigits,
    }),
  });
}

function withPhoneDefaults<
  TOptions extends PhoneInputOptions | PhoneParseOptions,
>(options: TOptions, locale: string): TOptions {
  return {
    ...options,
    defaultRegion:
      options.defaultRegion ?? inferRegionFromLocale(locale) ?? "US",
  };
}

function inferRegionFromLocale(locale: string): string | null {
  const region = locale.split("-").find((part) => /^[A-Z]{2}$/.test(part));

  return region ?? null;
}

function withLocale<TOptions extends { readonly locale?: string }>(
  options: TOptions,
  locale: string,
): TOptions {
  return {
    ...options,
    locale: options.locale ?? locale,
  };
}

function toMoneyParseOptions(
  currencyOrOptions: string | MoneyParseOptions,
  options: Omit<MoneyParseOptions, "currency">,
): MoneyParseOptions {
  if (typeof currencyOrOptions === "string") {
    return {
      ...options,
      currency: currencyOrOptions,
    };
  }

  return currencyOrOptions;
}
