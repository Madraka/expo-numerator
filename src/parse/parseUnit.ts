import { parseNumber } from "./parseNumber";
import type { UnitParseOptions } from "./parseOptions";
import { NumeratorError } from "../core/errors/NumeratorError";
import type { UnitValue } from "../core/value/types";
import { unit } from "../core/value/unit";
import {
  getRegisteredUnits,
  getUnitAliases,
  getUnitMeta,
  normalizeUnitCode,
} from "../unit/unitRegistry";

export function parseUnit(
  text: string,
  options: UnitParseOptions = {},
): UnitValue {
  const trimmed = text.trim();
  const expectedCode = options.unit
    ? normalizeUnitCode(options.unit)
    : undefined;

  if (options.unit && expectedCode === null) {
    throw new NumeratorError("INVALID_UNIT", { unit: options.unit });
  }

  const matched = findUnitSuffix(trimmed, options.locale);

  if (matched === null) {
    if (expectedCode) {
      assertUnitDimension(expectedCode, options);
      return unit(parseNumber(trimmed, options), expectedCode);
    }

    throw new NumeratorError("INVALID_UNIT", { value: text });
  }

  if (expectedCode && matched.code !== expectedCode) {
    throw new NumeratorError("INVALID_UNIT", {
      expected: expectedCode,
      received: matched.code,
    });
  }

  assertUnitDimension(matched.code, options);

  return unit(parseNumber(matched.numberText, options), matched.code);
}

function assertUnitDimension(
  unitCode: string,
  options: UnitParseOptions,
): void {
  if (!options.dimension) {
    return;
  }

  const meta = getUnitMeta(unitCode);

  if (meta.dimension !== options.dimension) {
    throw new NumeratorError("INVALID_UNIT", {
      dimension: options.dimension,
      received: meta.dimension,
      unit: unitCode,
    });
  }
}

function findUnitSuffix(
  text: string,
  locale?: string,
): { code: string; numberText: string } | null {
  const candidates = getRegisteredUnits()
    .flatMap((unitMeta) =>
      getUnitAliases(unitMeta.code, locale).map((alias) => ({
        alias,
        code: unitMeta.code,
      })),
    )
    .filter((candidate) => candidate.alias.trim().length > 0)
    .sort((left, right) => right.alias.length - left.alias.length);

  const normalizedText = text.normalize("NFKC").toLowerCase();

  for (const candidate of candidates) {
    const normalizedAlias = candidate.alias.normalize("NFKC").toLowerCase();

    if (!normalizedText.endsWith(normalizedAlias)) {
      continue;
    }

    const numberText = text
      .slice(0, text.length - candidate.alias.length)
      .trim();

    if (numberText.length === 0 || /[A-Za-z]$/.test(numberText)) {
      continue;
    }

    return {
      code: candidate.code,
      numberText,
    };
  }

  return null;
}
