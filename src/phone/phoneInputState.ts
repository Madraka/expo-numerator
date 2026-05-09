import {
  formatGroupedDigits,
  formatNationalSignificantNumber,
  formatPhone,
} from "./formatPhone";
import { normalizePhoneText, parsePhone } from "./parsePhone";
import { getGeneratedPhoneCountryMeta } from "./phoneRegistry";
import type {
  PhoneInputOptions,
  PhoneInputState,
  PhoneRegionCode,
  PhoneTextSelection,
  PhoneValue,
} from "./phoneTypes";
import { NumeratorError } from "../core/errors/NumeratorError";

const DEFAULT_SELECTION: PhoneTextSelection = Object.freeze({
  start: 0,
  end: 0,
});
const DEFAULT_MAX_PHONE_INPUT_LENGTH = 18;

export function createPhoneInputState(
  options: PhoneInputOptions = {},
): PhoneInputState {
  const externalValue = getInitialExternalValue(options);
  const country = getInputCountry(options);

  if (externalValue === undefined || externalValue === null) {
    return markCommitted(createState("", DEFAULT_SELECTION, options, country));
  }

  const value =
    typeof externalValue === "string" ? externalValue : externalValue.e164;
  const state = createState(
    value,
    getCollapsedSelection(value.length),
    options,
    country,
  );

  return markCommitted({
    ...state,
    text: state.value
      ? formatPhone(state.value, { format: "national" })
      : state.text,
    selection: getCollapsedSelection(
      state.value
        ? formatPhone(state.value, { format: "national" }).length
        : state.text.length,
    ),
  });
}

export function applyPhoneInputText(
  state: PhoneInputState,
  text: string,
  selection: PhoneTextSelection = getCollapsedSelection(text.length),
  options: PhoneInputOptions = {},
): PhoneInputState {
  const country = state.country ?? getInputCountry(options);
  const sanitized = sanitizePhoneInputText(text, options);
  const formatted = formatEditablePhoneText(sanitized, country, options);
  const caret = getFormattedPhoneEditingCaret(
    sanitized,
    getSanitizedPhoneCaret(text, selection.end, options),
    formatted,
    country,
    options,
  );
  const next = createState(
    formatted,
    getCollapsedSelection(caret),
    options,
    country,
    state,
    sanitized,
  );

  if (options.formatWhileEditing === false) {
    return {
      ...next,
      selection: clampSelection(selection, next.text),
    };
  }

  return {
    ...next,
    selection: getCollapsedSelection(caret),
  };
}

export function applyPhoneInputNativeTextChange(
  state: PhoneInputState,
  text: string,
  options: PhoneInputOptions = {},
): PhoneInputState {
  return applyPhoneInputText(
    state,
    text,
    getCollapsedSelection(text.length),
    options,
  );
}

export function setPhoneInputCountry(
  state: PhoneInputState,
  country: PhoneRegionCode,
  options: PhoneInputOptions = {},
): PhoneInputState {
  return createState(
    state.text,
    getCollapsedSelection(state.text.length),
    options,
    country,
    state,
  );
}

export function setPhoneInputSelection(
  state: PhoneInputState,
  selection: PhoneTextSelection,
): PhoneInputState {
  return {
    ...state,
    selection: clampSelection(selection, state.text),
  };
}

export function focusPhoneInputState(state: PhoneInputState): PhoneInputState {
  return {
    ...state,
    isFocused: true,
  };
}

export function blurPhoneInputState(
  state: PhoneInputState,
  options: PhoneInputOptions = {},
): PhoneInputState {
  if (state.value === null) {
    return {
      ...state,
      isFocused: false,
    };
  }

  const text = formatPhone(state.value, {
    format: "national",
    region: state.country ?? options.defaultRegion,
  });

  return createState(
    text,
    getCollapsedSelection(text.length),
    options,
    state.country,
    {
      ...state,
      isFocused: false,
    },
  );
}

export function commitPhoneInputState(state: PhoneInputState): PhoneInputState {
  return {
    ...state,
    committedValue: state.value,
    isDirty: false,
  };
}

export function resetPhoneInputState(
  state: PhoneInputState,
  options: PhoneInputOptions = {},
  value?: string | PhoneValue | null,
): PhoneInputState {
  const resetValue = arguments.length >= 3 ? value : state.committedValue;

  if (resetValue === null || resetValue === undefined) {
    return markCommitted(
      createState("", DEFAULT_SELECTION, options, state.country, {
        ...state,
        committedValue: null,
      }),
    );
  }

  return markCommitted(
    createState(
      typeof resetValue === "string" ? resetValue : resetValue.e164,
      DEFAULT_SELECTION,
      options,
      state.country,
      state,
    ),
  );
}

export function sanitizePhoneInputText(
  text: string,
  options: PhoneInputOptions = {},
): string {
  return normalizePhoneText(text).slice(
    0,
    options.maxInputLength ?? DEFAULT_MAX_PHONE_INPUT_LENGTH,
  );
}

function createState(
  text: string,
  selection: PhoneTextSelection,
  options: PhoneInputOptions,
  country: PhoneRegionCode | null,
  previous?: PhoneInputState,
  parseText = text,
): PhoneInputState {
  const committedValue = previous?.committedValue ?? null;
  const isFocused = previous?.isFocused ?? false;

  if (isPartialPhoneInput(parseText)) {
    return {
      text,
      value: null,
      committedValue,
      country,
      selection: clampSelection(selection, text),
      isValid: true,
      isDirty: committedValue !== null,
      isFocused,
      error: null,
    };
  }

  try {
    const value = parsePhone(parseText, {
      defaultRegion: country ?? options.defaultRegion,
      includeNonGeographic: options.includeNonGeographic,
      metadataProfile: options.metadataProfile,
      validationMode: options.validationMode ?? "possible",
    });

    return {
      text,
      value,
      committedValue,
      country: value.region ?? country,
      selection: clampSelection(selection, text),
      isValid: true,
      isDirty: !phoneValuesEqual(value, committedValue),
      isFocused,
      error: null,
    };
  } catch (error) {
    const partialValid = isPossiblePartialPhone(parseText, country);
    let normalizedError: NumeratorError | null;

    if (partialValid) {
      normalizedError = null;
    } else if (error instanceof NumeratorError) {
      normalizedError = error;
    } else {
      normalizedError = new NumeratorError("INVALID_PHONE_NUMBER");
    }

    return {
      text,
      value: null,
      committedValue,
      country,
      selection: clampSelection(selection, text),
      isValid: partialValid,
      isDirty: committedValue !== null || parseText.length > 0,
      isFocused,
      error: normalizedError,
    };
  }
}

function formatEditablePhoneText(
  sanitized: string,
  country: PhoneRegionCode | null,
  options: PhoneInputOptions,
): string {
  if (
    options.formatWhileEditing === false ||
    sanitized === "" ||
    sanitized === "+"
  ) {
    return sanitized;
  }

  if (sanitized.startsWith("+")) {
    return sanitized;
  }

  if (country === null) {
    return sanitized;
  }

  try {
    const meta = getGeneratedPhoneCountryMeta(country);
    return formatEditableNationalDigits(sanitized.replace(/^0/, ""), meta);
  } catch {
    return sanitized;
  }
}

function formatEditableNationalDigits(
  digits: string,
  meta: ReturnType<typeof getGeneratedPhoneCountryMeta>,
): string {
  const matchingFormat = meta.availableFormats?.find((availableFormat) => {
    if (
      availableFormat.leadingDigits?.length &&
      !availableFormat.leadingDigits.some((pattern) =>
        new RegExp(`^(?:${pattern})`).test(digits),
      )
    ) {
      return false;
    }

    const groups = getAvailableFormatGroups(availableFormat.pattern);

    return groups.length > 0 && digits.length <= sumGroups(groups);
  });

  if (matchingFormat !== undefined) {
    const groups = getAvailableFormatGroups(matchingFormat.pattern);

    if (digits.length === sumGroups(groups)) {
      return formatNationalSignificantNumber(digits, meta);
    }

    return formatGroupedDigits(digits, groups);
  }

  return formatGroupedDigits(digits, meta.nationalGroups);
}

function getAvailableFormatGroups(pattern: string): readonly number[] {
  return [...pattern.matchAll(/\\d\{(\d+)(?:,(\d+))?\}|\\d/g)].map((match) =>
    Number(match[1] ?? 1),
  );
}

function sumGroups(groups: readonly number[]): number {
  return groups.reduce((sum, group) => sum + group, 0);
}

function getFormattedPhoneEditingCaret(
  sanitized: string,
  sanitizedCaret: number,
  formatted: string,
  country: PhoneRegionCode | null,
  options: PhoneInputOptions,
): number {
  if (options.formatWhileEditing === false || sanitized === formatted) {
    return Math.min(sanitizedCaret, formatted.length);
  }

  const target = getVisiblePhoneDigitCaret(
    sanitized,
    sanitizedCaret,
    country,
    formatted,
  );

  if (target <= 0) {
    return sanitized.startsWith("+") && formatted.startsWith("+") ? 1 : 0;
  }

  let seen = 0;

  for (let index = 0; index < formatted.length; index += 1) {
    if (/\d/.test(formatted[index])) {
      seen += 1;
    }

    if (seen === target) {
      return index + 1;
    }
  }

  return formatted.length;
}

function getVisiblePhoneDigitCaret(
  sanitized: string,
  sanitizedCaret: number,
  country: PhoneRegionCode | null,
  formatted: string,
): number {
  const beforeCaret = sanitized.slice(0, sanitizedCaret);
  let digitCount = countPhoneDigits(beforeCaret);

  if (
    country !== null &&
    !sanitized.startsWith("+") &&
    sanitized.startsWith("0") &&
    !formatted.startsWith("0") &&
    sanitizedCaret > 0
  ) {
    digitCount -= 1;
  }

  if (
    country !== null &&
    !sanitized.startsWith("+") &&
    !sanitized.startsWith("0") &&
    formatted.startsWith("0") &&
    sanitizedCaret > 0
  ) {
    digitCount += 1;
  }

  return Math.max(0, digitCount);
}

function getSanitizedPhoneCaret(
  rawText: string,
  rawCaret: number,
  options: PhoneInputOptions,
): number {
  return sanitizePhoneInputText(rawText.slice(0, rawCaret), options).length;
}

function countPhoneDigits(text: string): number {
  return Array.from(text).filter((character) => /\d/.test(character)).length;
}

function isPartialPhoneInput(text: string): boolean {
  return text === "" || text === "+";
}

function isPossiblePartialPhone(
  text: string,
  country: PhoneRegionCode | null,
): boolean {
  const digits = text.startsWith("+") ? text.slice(1) : text.replace(/\D/g, "");

  if (digits.length === 0 || digits.length <= 3) {
    return true;
  }

  if (country === null) {
    return digits.length <= DEFAULT_MAX_PHONE_INPUT_LENGTH;
  }

  try {
    const meta = getGeneratedPhoneCountryMeta(country);
    const maxLength = Math.max(...meta.possibleLengths);
    return digits.length <= maxLength + meta.countryCallingCode.length;
  } catch {
    return false;
  }
}

function markCommitted(state: PhoneInputState): PhoneInputState {
  return {
    ...state,
    committedValue: state.value,
    isDirty: false,
  };
}

function getInitialExternalValue(
  options: PhoneInputOptions,
): string | PhoneValue | null | undefined {
  if ("value" in options) {
    return options.value;
  }

  if ("defaultValue" in options) {
    return options.defaultValue;
  }

  return options.initialValue;
}

function getInputCountry(options: PhoneInputOptions): PhoneRegionCode | null {
  return (
    options.country ?? options.defaultCountry ?? options.defaultRegion ?? null
  );
}

function phoneValuesEqual(
  left: PhoneValue | null,
  right: PhoneValue | null,
): boolean {
  return left?.e164 === right?.e164;
}

function clampSelection(
  selection: PhoneTextSelection,
  text: string,
): PhoneTextSelection {
  const start = Math.max(0, Math.min(selection.start, text.length));
  const end = Math.max(0, Math.min(selection.end, text.length));

  return {
    start: Math.min(start, end),
    end: Math.max(start, end),
  };
}

function getCollapsedSelection(offset: number): PhoneTextSelection {
  return {
    start: offset,
    end: offset,
  };
}
