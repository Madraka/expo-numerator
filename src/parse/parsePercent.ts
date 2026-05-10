import { parseLocalizedDecimal } from "./parseLocalizedDecimal";
import type { PercentParseOptions } from "./parseOptions";
import { NumeratorError } from "../core/errors/NumeratorError";
import { percent } from "../core/value/percent";
import type { PercentValue } from "../core/value/types";
import { multiplyDecimalByPowerOfTen } from "../format/decimalMath";
import type { LocaleSymbols } from "../locale/localeRegistry";
import { getLocaleSymbols, resolveLocale } from "../locale/resolveLocale";

export function parsePercent(
  text: string,
  options: PercentParseOptions = {},
): PercentValue {
  const locale = resolveLocale({ locale: options.locale });
  const symbols = getLocaleSymbols(locale);
  const numericText = stripPercentAffixes(text, symbols);
  const parsed = parseLocalizedDecimal(numericText, {
    ...options,
    locale,
  });

  return percent(multiplyDecimalByPowerOfTen(parsed.value, -2));
}

function stripPercentAffixes(text: string, symbols: LocaleSymbols): string {
  const pattern = symbols.percentPattern;
  let stripped = text.trim();
  let consumedAffix = false;

  if (pattern.prefix.length > 0 && stripped.startsWith(pattern.prefix)) {
    stripped = stripped.slice(pattern.prefix.length);
    consumedAffix = true;
  }

  if (pattern.suffix.length > 0 && stripped.endsWith(pattern.suffix)) {
    stripped = stripped.slice(0, -pattern.suffix.length);
    consumedAffix = true;
  }

  stripped = stripped.trim();

  if (!consumedAffix) {
    if (stripped.startsWith(symbols.percentSign)) {
      stripped = stripped.slice(symbols.percentSign.length).trim();
    } else if (stripped.endsWith(symbols.percentSign)) {
      stripped = stripped.slice(0, -symbols.percentSign.length).trim();
    }
  }

  if (stripped.includes(symbols.percentSign)) {
    throw new NumeratorError("INVALID_PERCENT", {
      locale: symbols.locale,
      value: text,
    });
  }

  return stripped;
}
