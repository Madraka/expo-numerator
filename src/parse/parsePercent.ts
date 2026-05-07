import { parseLocalizedDecimal } from "./parseLocalizedDecimal";
import type { PercentParseOptions } from "./parseOptions";
import { percent } from "../core/value/percent";
import type { PercentValue } from "../core/value/types";
import { multiplyDecimalByPowerOfTen } from "../format/decimalMath";
import type { PercentPattern } from "../locale/localeRegistry";
import { getLocaleSymbols, resolveLocale } from "../locale/resolveLocale";

export function parsePercent(
  text: string,
  options: PercentParseOptions = {},
): PercentValue {
  const locale = resolveLocale({ locale: options.locale });
  const symbols = getLocaleSymbols(locale);
  const numericText = stripPercentAffixes(text, symbols.percentPattern)
    .split(symbols.percentSign)
    .join("");
  const parsed = parseLocalizedDecimal(numericText, {
    ...options,
    locale,
  });

  return percent(multiplyDecimalByPowerOfTen(parsed.value, -2));
}

function stripPercentAffixes(text: string, pattern: PercentPattern): string {
  let stripped = text.trim();

  if (pattern.prefix.length > 0 && stripped.startsWith(pattern.prefix)) {
    stripped = stripped.slice(pattern.prefix.length);
  }

  if (pattern.suffix.length > 0 && stripped.endsWith(pattern.suffix)) {
    stripped = stripped.slice(0, -pattern.suffix.length);
  }

  return stripped.trim();
}
