import { DEFAULT_MAX_DECIMAL_INPUT_LENGTH } from "./decimalConstants";
import { NumeratorError } from "../errors/NumeratorError";
import type { DecimalInput, DecimalValue } from "../value/types";

export type DecimalNormalizationOptions = {
  maxInputLength?: number;
};

export function normalizeDecimal(
  input: DecimalInput,
  options: DecimalNormalizationOptions = {},
): DecimalValue {
  if (isDecimalValue(input)) {
    return input;
  }

  const raw = coerceDecimalInput(input);
  const maxInputLength =
    options.maxInputLength ?? DEFAULT_MAX_DECIMAL_INPUT_LENGTH;

  if (raw.length > maxInputLength) {
    throw new NumeratorError("VALUE_OUT_OF_RANGE", {
      maxInputLength,
      length: raw.length,
    });
  }

  const match = /^([+-])?(\d+)(?:\.(\d+))?$/.exec(raw);

  if (!match) {
    throw new NumeratorError("INVALID_DECIMAL", { value: raw });
  }

  const [, signToken, integerToken, fractionToken] = match;
  const integer = integerToken.replace(/^0+(?=\d)/, "");
  const fraction = fractionToken ?? "";
  const isZero =
    /^0+$/.test(integer) && (fraction.length === 0 || /^0+$/.test(fraction));

  if (isZero) {
    return Object.freeze({
      kind: "decimal",
      value: "0",
      sign: 0,
    });
  }

  const magnitude = fraction.length > 0 ? `${integer}.${fraction}` : integer;
  const value = signToken === "-" ? `-${magnitude}` : magnitude;

  return Object.freeze({
    kind: "decimal",
    value,
    scale: fraction.length > 0 ? fraction.length : undefined,
    sign: signToken === "-" ? -1 : 1,
  });
}

function coerceDecimalInput(input: string | number): string {
  if (typeof input === "number") {
    if (!Number.isSafeInteger(input)) {
      throw new NumeratorError("INVALID_DECIMAL", {
        value: input,
        reason:
          "Only safe integers are accepted as numbers. Pass decimal values as strings.",
      });
    }

    return String(input);
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    throw new NumeratorError("INVALID_DECIMAL", { value: input });
  }

  return trimmed;
}

function isDecimalValue(value: DecimalInput): value is DecimalValue {
  return (
    typeof value === "object" && value !== null && value.kind === "decimal"
  );
}
