import { formatNumber } from "./formatNumber";
import type { NumberFormatOptions } from "./formatOptions";
import type { DecimalInput } from "../core/value/types";
import { getLocaleSymbols } from "../locale/resolveLocale";

export type NumberFormatPartType =
  | "integer"
  | "group"
  | "decimal"
  | "fraction"
  | "plusSign"
  | "minusSign"
  | "exponentSeparator"
  | "exponentMinusSign"
  | "exponentInteger"
  | "compact"
  | "literal";

export type NumberFormatPart = {
  readonly type: NumberFormatPartType;
  readonly value: string;
};

export function formatNumberToParts(
  value: DecimalInput,
  options: NumberFormatOptions = {},
): NumberFormatPart[] {
  const formatted = formatNumber(value, options);
  const [mantissa, exponent] = formatted.split("E");
  const parts = splitDecimalParts(mantissa, options);

  if (exponent === undefined) {
    return parts;
  }

  parts.push({ type: "exponentSeparator", value: "E" });

  if (exponent.startsWith("-")) {
    parts.push({ type: "exponentMinusSign", value: "-" });
    parts.push({ type: "exponentInteger", value: exponent.slice(1) });
  } else {
    parts.push({ type: "exponentInteger", value: exponent });
  }

  return parts;
}

function splitDecimalParts(
  formatted: string,
  options: NumberFormatOptions,
): NumberFormatPart[] {
  const symbols = getLocaleSymbols({ locale: options.locale });
  const parts: NumberFormatPart[] = [];
  let cursor = formatted;

  if (cursor.startsWith(symbols.minusSign)) {
    parts.push({ type: "minusSign", value: symbols.minusSign });
    cursor = cursor.slice(symbols.minusSign.length);
  } else if (cursor.startsWith(symbols.plusSign)) {
    parts.push({ type: "plusSign", value: symbols.plusSign });
    cursor = cursor.slice(symbols.plusSign.length);
  }

  const compactAffix =
    options.notation === "compact" ? findCompactAffix(cursor, options) : null;

  if (compactAffix) {
    const prefix = compactAffix.prefix ?? "";
    const suffix = compactAffix.suffix ?? "";

    if (prefix.length > 0) {
      parts.push({ type: "literal", value: prefix });
      cursor = cursor.slice(prefix.length);
    }

    cursor = cursor.slice(0, cursor.length - suffix.length);
  }

  const decimalIndex = cursor.indexOf(symbols.decimal);
  const integerText =
    decimalIndex >= 0 ? cursor.slice(0, decimalIndex) : cursor;
  const fractionText =
    decimalIndex >= 0
      ? cursor.slice(decimalIndex + symbols.decimal.length)
      : "";

  pushIntegerParts(parts, integerText, symbols.group);

  if (decimalIndex >= 0) {
    parts.push({ type: "decimal", value: symbols.decimal });
    parts.push({ type: "fraction", value: fractionText });
  }

  if (compactAffix?.suffix) {
    parts.push({ type: "compact", value: compactAffix.suffix });
  }

  return parts;
}

function findCompactAffix(
  formattedWithoutSign: string,
  options: NumberFormatOptions,
): { prefix?: string; suffix?: string } | null {
  const symbols = getLocaleSymbols({ locale: options.locale });
  const patterns =
    symbols.compactPatterns?.[options.compactDisplay ?? "short"] ?? [];
  const affixes = patterns
    .flatMap((pattern) => [pattern.one, pattern.other])
    .filter((affix): affix is { prefix?: string; suffix?: string } =>
      Boolean(affix),
    )
    .sort(
      (left, right) =>
        (right.prefix?.length ?? 0) +
        (right.suffix?.length ?? 0) -
        ((left.prefix?.length ?? 0) + (left.suffix?.length ?? 0)),
    );

  return (
    affixes.find(
      (affix) =>
        ((affix.prefix?.length ?? 0) > 0 || (affix.suffix?.length ?? 0) > 0) &&
        formattedWithoutSign.startsWith(affix.prefix ?? "") &&
        formattedWithoutSign.endsWith(affix.suffix ?? ""),
    ) ?? null
  );
}

function pushIntegerParts(
  parts: NumberFormatPart[],
  integerText: string,
  groupSeparator: string,
): void {
  const groups = integerText.split(groupSeparator);

  groups.forEach((group, index) => {
    if (index > 0) {
      parts.push({ type: "group", value: groupSeparator });
    }

    parts.push({ type: "integer", value: group });
  });
}
