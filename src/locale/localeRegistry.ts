import { generatedLocaleSymbols } from "./generatedLocaleSymbols";

export type GroupingStrategy = {
  readonly primary: number;
  readonly secondary?: number;
  readonly separator: string;
};

export type PercentPattern = {
  readonly prefix: string;
  readonly suffix: string;
};

export type CurrencyPattern = {
  readonly prefix: string;
  readonly suffix: string;
};

export type CompactAffixPattern = {
  readonly prefix?: string;
  readonly suffix?: string;
};

export type CompactPowerPattern = {
  readonly thresholdPower: number;
  readonly divisorPower: number;
  readonly one?: CompactAffixPattern;
  readonly other: CompactAffixPattern;
};

export type CompactPatternSet = {
  readonly short: readonly CompactPowerPattern[];
  readonly long: readonly CompactPowerPattern[];
};

export type LocaleSymbols = {
  readonly locale: string;
  readonly decimal: string;
  readonly group: string;
  readonly plusSign: string;
  readonly minusSign: string;
  readonly percentSign: string;
  readonly percentPattern: PercentPattern;
  readonly currencyPattern: CurrencyPattern;
  readonly grouping: GroupingStrategy;
  readonly compactPatterns?: CompactPatternSet;
};

export type LocaleSymbolsRegistration = Omit<
  LocaleSymbols,
  "locale" | "percentPattern" | "currencyPattern"
> & {
  readonly locale: string;
  readonly percentPattern?: PercentPattern;
  readonly currencyPattern?: CurrencyPattern;
};

export const initialLocaleSymbols: Record<string, LocaleSymbols> =
  generatedLocaleSymbols;

const localeRegistry = new Map<string, LocaleSymbols>(
  Object.entries(initialLocaleSymbols),
);

export function getRegisteredLocaleSymbols(
  locale: string,
): LocaleSymbols | null {
  return localeRegistry.get(locale) ?? null;
}

export function registerLocaleSymbols(
  symbols: LocaleSymbolsRegistration,
): LocaleSymbols {
  const frozen = freezeLocaleSymbols(symbols);
  localeRegistry.set(frozen.locale, frozen);
  return frozen;
}

export function getRegisteredLocaleCodes(): string[] {
  return [...localeRegistry.keys()];
}

function freezeLocaleSymbols(
  symbols: LocaleSymbolsRegistration,
): LocaleSymbols {
  return Object.freeze({
    locale: symbols.locale,
    decimal: symbols.decimal,
    group: symbols.group,
    plusSign: symbols.plusSign,
    minusSign: symbols.minusSign,
    percentSign: symbols.percentSign,
    percentPattern: Object.freeze(
      symbols.percentPattern ?? {
        prefix: "",
        suffix: symbols.percentSign,
      },
    ),
    currencyPattern: Object.freeze(
      symbols.currencyPattern ?? {
        prefix: "{currency}",
        suffix: "",
      },
    ),
    grouping: Object.freeze({ ...symbols.grouping }),
    compactPatterns: symbols.compactPatterns
      ? freezeCompactPatternSet(symbols.compactPatterns)
      : undefined,
  });
}

function freezeCompactPatternSet(
  patterns: CompactPatternSet,
): CompactPatternSet {
  return Object.freeze({
    short: Object.freeze(patterns.short.map(freezeCompactPowerPattern)),
    long: Object.freeze(patterns.long.map(freezeCompactPowerPattern)),
  });
}

function freezeCompactPowerPattern(
  pattern: CompactPowerPattern,
): CompactPowerPattern {
  return Object.freeze({
    thresholdPower: pattern.thresholdPower,
    divisorPower: pattern.divisorPower,
    one: pattern.one ? Object.freeze({ ...pattern.one }) : undefined,
    other: Object.freeze({ ...pattern.other }),
  });
}
