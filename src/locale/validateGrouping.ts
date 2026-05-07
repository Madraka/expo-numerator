import type { GroupingStrategy, LocaleSymbols } from "./localeRegistry";
import { getLocaleSymbols } from "./resolveLocale";

export type ValidateGroupingOptions = {
  locale?: string;
  symbols?: LocaleSymbols;
};

export function validateGrouping(
  text: string,
  options: ValidateGroupingOptions = {},
): boolean {
  const symbols = options.symbols ?? getLocaleSymbols(options.locale);
  const unsigned = stripSign(text, symbols);
  const integerPart = unsigned.split(symbols.decimal)[0];

  if (integerPart.length === 0) {
    return false;
  }

  if (!integerPart.includes(symbols.group)) {
    return true;
  }

  return validateGroupedInteger(integerPart, symbols.grouping);
}

function stripSign(text: string, symbols: LocaleSymbols): string {
  if (text.startsWith(symbols.plusSign) || text.startsWith(symbols.minusSign)) {
    return text.slice(1);
  }

  return text;
}

function validateGroupedInteger(
  integerPart: string,
  grouping: GroupingStrategy,
): boolean {
  const groups = integerPart.split(grouping.separator);

  if (groups.length < 2 || groups.some((group) => group.length === 0)) {
    return false;
  }

  const lastGroup = groups[groups.length - 1];

  if (lastGroup.length !== grouping.primary) {
    return false;
  }

  const secondarySize = grouping.secondary ?? grouping.primary;
  const middleGroups = groups.slice(1, -1);

  if (middleGroups.some((group) => group.length !== secondarySize)) {
    return false;
  }

  const firstGroup = groups[0];
  return firstGroup.length >= 1 && firstGroup.length <= secondarySize;
}
