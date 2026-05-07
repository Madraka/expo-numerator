import { digitMaps, type NumberingSystem } from "./digitMaps";
import { NumeratorError } from "../core/errors/NumeratorError";

export type NormalizeDigitsOptions = {
  numberingSystem?: NumberingSystem | string;
};

const digitLookup = createDigitLookup();

export function normalizeDigits(
  text: string,
  options: NormalizeDigitsOptions = {},
): string {
  if (options.numberingSystem !== undefined) {
    return normalizeForNumberingSystem(text, options.numberingSystem);
  }

  return Array.from(
    text,
    (character) => digitLookup.get(character) ?? character,
  ).join("");
}

function normalizeForNumberingSystem(
  text: string,
  numberingSystem: NumberingSystem | string,
): string {
  const digits = digitMaps[numberingSystem as NumberingSystem];

  if (!digits) {
    throw new NumeratorError("UNSUPPORTED_NUMBERING_SYSTEM", {
      numberingSystem,
    });
  }

  const lookup = new Map(digits.map((digit, index) => [digit, String(index)]));
  return Array.from(
    text,
    (character) => lookup.get(character) ?? character,
  ).join("");
}

function createDigitLookup(): Map<string, string> {
  const lookup = new Map<string, string>();

  for (const digits of Object.values(digitMaps)) {
    digits.forEach((digit, index) => {
      lookup.set(digit, String(index));
    });
  }

  return lookup;
}
