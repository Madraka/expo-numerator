import { multiplyDecimalByPowerOfTen } from "./decimalMath";
import { formatDecimalString } from "./formatDecimalString";
import type { PercentFormatOptions } from "./formatOptions";
import type { PercentValue } from "../core/value/types";
import { getLocaleSymbols, resolveLocale } from "../locale/resolveLocale";

export function formatPercent(
  value: PercentValue,
  options: PercentFormatOptions = {},
): string {
  const locale = resolveLocale({ locale: options.locale });
  const symbols = getLocaleSymbols(locale);
  const formatted = formatDecimalString(
    multiplyDecimalByPowerOfTen(value.value, 2),
    {
      ...options,
      locale,
    },
  );

  return `${symbols.percentPattern.prefix}${formatted}${symbols.percentPattern.suffix}`;
}
