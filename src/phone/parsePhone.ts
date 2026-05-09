import {
  getGeneratedPhoneCountriesByCallingCode,
  getGeneratedPhoneCountryMeta,
  getSupportedCallingCodes,
} from "./phoneRegistry";
import type {
  GeneratedPhoneCountryMeta,
  PhoneNumberType,
  PhoneParseOptions,
  PhoneValue,
} from "./phoneTypes";
import { NumeratorError } from "../core/errors/NumeratorError";
import { normalizeCaughtError } from "../core/errors/normalizeCaughtError";
import type { NumeratorResult } from "../core/value/safeConstructors";
import { normalizeDigits } from "../locale/normalizeDigits";

const MAX_E164_DIGITS = 15;

export function parsePhone(
  text: string | PhoneValue,
  options: PhoneParseOptions = {},
): PhoneValue {
  if (isPhoneValue(text)) {
    return text;
  }

  const normalized = normalizePhoneText(text);

  if (normalized === "" || normalized === "+") {
    throw new NumeratorError("INVALID_PHONE_NUMBER", { input: text });
  }

  const parsed = normalized.startsWith("+")
    ? parseInternationalPhone(normalized)
    : parseNationalPhone(normalized, options);

  assertPhoneValueAllowed(parsed, options);

  return Object.freeze(parsed);
}

export function safeParsePhone(
  text: string | PhoneValue,
  options: PhoneParseOptions = {},
): NumeratorResult<PhoneValue> {
  try {
    return Object.freeze({
      ok: true,
      value: parsePhone(text, options),
    });
  } catch (error) {
    return Object.freeze({
      ok: false,
      error: normalizeCaughtError(error, "Phone parse failed."),
    });
  }
}

export function isPossiblePhoneNumber(
  text: string | PhoneValue,
  options: PhoneParseOptions = {},
): boolean {
  const result = safeParsePhone(text, {
    ...options,
    validationMode: "possible",
  });

  return result.ok && result.value.isPossible;
}

export function isValidPhoneNumber(
  text: string | PhoneValue,
  options: PhoneParseOptions = {},
): boolean {
  const result = safeParsePhone(text, {
    ...options,
    validationMode: "strict",
  });

  return result.ok && result.value.isValid;
}

export function isMobileEligiblePhoneNumber(
  text: string | PhoneValue,
  options: PhoneParseOptions = {},
): boolean {
  const result = safeParsePhone(text, {
    ...options,
    validationMode: "mobile",
  });

  return result.ok && result.value.isMobileEligible;
}

export function normalizePhoneText(text: string): string {
  const normalized = normalizeDigits(text);
  let output = "";

  for (const character of Array.from(normalized)) {
    if (/\d/.test(character)) {
      output += character;
    } else if (character === "+" && output.length === 0) {
      output += character;
    }
  }

  return output;
}

export function isPhoneValue(value: unknown): value is PhoneValue {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { readonly kind?: unknown }).kind === "phone" &&
    typeof (value as { readonly e164?: unknown }).e164 === "string"
  );
}

function parseInternationalPhone(normalized: string): PhoneValue {
  const digits = normalized.slice(1);

  if (!/^\d+$/.test(digits) || digits.length > MAX_E164_DIGITS) {
    throw new NumeratorError("INVALID_PHONE_NUMBER", { input: normalized });
  }

  for (const callingCode of getSupportedCallingCodes()) {
    if (!digits.startsWith(callingCode)) {
      continue;
    }

    const nationalNumber = digits.slice(callingCode.length);
    const countryMetas = getGeneratedPhoneCountriesByCallingCode(callingCode);

    if (countryMetas.length === 0) {
      throw new NumeratorError("PHONE_METADATA_MISSING", {
        countryCallingCode: callingCode,
      });
    }

    return createPhoneValue(callingCode, nationalNumber, countryMetas);
  }

  throw new NumeratorError("UNSUPPORTED_PHONE_REGION", {
    countryCallingCode: digits.slice(0, 3),
  });
}

function parseNationalPhone(
  normalized: string,
  options: PhoneParseOptions,
): PhoneValue {
  const defaultRegion = options.defaultRegion;

  if (defaultRegion === undefined) {
    throw new NumeratorError("INVALID_PHONE_REGION", {
      reason: "defaultRegion is required for national phone input",
    });
  }

  const meta = getGeneratedPhoneCountryMeta(defaultRegion);
  const digits = normalized.replace(/^\+/, "");
  const nationalNumber = getNationalSignificantNumber(digits, meta);

  return createPhoneValue(
    meta.countryCallingCode,
    nationalNumber,
    [meta],
    meta,
  );
}

function getNationalSignificantNumber(
  digits: string,
  meta: GeneratedPhoneCountryMeta,
): string {
  if (
    digits.startsWith(meta.countryCallingCode) &&
    isPossibleLength(digits.length - meta.countryCallingCode.length, meta)
  ) {
    return digits.slice(meta.countryCallingCode.length);
  }

  if (
    meta.nationalPrefixMode === "leading-zero" &&
    digits.startsWith("0") &&
    isPossibleLength(digits.length - 1, meta)
  ) {
    return digits.slice(1);
  }

  if (
    meta.nationalPrefixMode === "leading-eight" &&
    digits.startsWith("8") &&
    isPossibleLength(digits.length - 1, meta)
  ) {
    return digits.slice(1);
  }

  return digits;
}

function createPhoneValue(
  countryCallingCode: string,
  nationalNumber: string,
  countryMetas: readonly GeneratedPhoneCountryMeta[],
  preferredMeta?: GeneratedPhoneCountryMeta,
): PhoneValue {
  if (!/^\d+$/.test(nationalNumber)) {
    throw new NumeratorError("INVALID_PHONE_NUMBER", { nationalNumber });
  }

  if (countryCallingCode.length + nationalNumber.length > MAX_E164_DIGITS) {
    throw new NumeratorError("INVALID_PHONE_NUMBER", {
      countryCallingCode,
      nationalNumber,
    });
  }

  const candidateMetas = getLeadingDigitCandidateMetas(
    nationalNumber,
    countryMetas,
  );
  const possibleMetas = candidateMetas.filter((meta) =>
    isPossibleLength(nationalNumber.length, meta),
  );
  const validMetas = possibleMetas.filter((meta) =>
    matchesPattern(nationalNumber, meta.validPattern),
  );
  const matchingMetas = validMetas.length > 0 ? validMetas : possibleMetas;
  const selectedMeta =
    preferredMeta !== undefined && matchingMetas.includes(preferredMeta)
      ? preferredMeta
      : (matchingMetas[0] ?? countryMetas[0]);
  const isPossible = possibleMetas.length > 0;
  const isValid = validMetas.length > 0;
  const type = inferPhoneNumberType(nationalNumber, selectedMeta, isValid);
  const possibleRegions = matchingMetas.map((meta) => meta.region);

  return {
    kind: "phone",
    e164: `+${countryCallingCode}${nationalNumber}`,
    countryCallingCode,
    nationalNumber,
    region: selectedMeta?.region,
    possibleRegions,
    type,
    isPossible,
    isValid,
    isMobileEligible: type === "MOBILE" || type === "FIXED_LINE_OR_MOBILE",
  };
}

function getLeadingDigitCandidateMetas(
  nationalNumber: string,
  countryMetas: readonly GeneratedPhoneCountryMeta[],
): readonly GeneratedPhoneCountryMeta[] {
  const leadingMatches = countryMetas.filter(
    (meta) =>
      meta.leadingDigits !== undefined &&
      matchesLeadingDigits(nationalNumber, meta.leadingDigits),
  );

  if (leadingMatches.length > 0) {
    return leadingMatches;
  }

  return countryMetas;
}

function assertPhoneValueAllowed(
  value: PhoneValue,
  options: PhoneParseOptions,
): void {
  const validationMode = options.validationMode ?? "mobile";

  if (value.region === "001" && options.includeNonGeographic !== true) {
    throw new NumeratorError("UNSUPPORTED_PHONE_REGION", {
      region: value.region,
      countryCallingCode: value.countryCallingCode,
    });
  }

  if (validationMode === "possible" && value.isPossible) {
    return;
  }

  if (validationMode === "strict" && value.isValid) {
    return;
  }

  if (validationMode === "mobile" && value.isValid && value.isMobileEligible) {
    return;
  }

  throw new NumeratorError("INVALID_PHONE_NUMBER", {
    e164: value.e164,
    validationMode,
    type: value.type,
  });
}

function inferPhoneNumberType(
  nationalNumber: string,
  meta: GeneratedPhoneCountryMeta | undefined,
  isValid: boolean,
): PhoneNumberType | undefined {
  if (!isValid || meta === undefined) {
    return undefined;
  }

  if (meta.nationalPrefixMode === "nanp") {
    return "FIXED_LINE_OR_MOBILE";
  }

  for (const phoneType of [
    "TOLL_FREE",
    "PREMIUM_RATE",
    "SHARED_COST",
    "VOIP",
    "PAGER",
    "UAN",
    "VOICEMAIL",
    "PERSONAL_NUMBER",
  ] as const) {
    const pattern = meta.typePatterns?.[phoneType];

    if (pattern && matchesPattern(nationalNumber, pattern)) {
      return phoneType;
    }
  }

  const matchesMobile =
    meta.mobilePattern !== undefined &&
    matchesPattern(nationalNumber, meta.mobilePattern);
  const matchesFixedLine =
    meta.typePatterns?.FIXED_LINE !== undefined &&
    matchesPattern(nationalNumber, meta.typePatterns.FIXED_LINE);

  if (matchesMobile && matchesFixedLine) {
    return "FIXED_LINE_OR_MOBILE";
  }

  if (matchesMobile) {
    return meta.mobilePattern === meta.validPattern
      ? "FIXED_LINE_OR_MOBILE"
      : "MOBILE";
  }

  if (matchesFixedLine) {
    return "FIXED_LINE";
  }

  return "FIXED_LINE";
}

function isPossibleLength(
  length: number,
  meta: GeneratedPhoneCountryMeta,
): boolean {
  return meta.possibleLengths.includes(length);
}

function matchesPattern(value: string, pattern: string): boolean {
  return new RegExp(`^(?:${pattern})$`).test(value);
}

function matchesLeadingDigits(value: string, pattern: string): boolean {
  return new RegExp(`^(?:${pattern})`).test(value);
}
