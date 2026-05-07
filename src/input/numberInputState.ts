import type {
  NumberInputEdit,
  NumberInputExternalValue,
  NumberInputOptions,
  NumberInputState,
  TextSelection,
} from "./numberInputTypes";
import { DEFAULT_MAX_DECIMAL_INPUT_LENGTH } from "../core/decimal/decimalConstants";
import { NumeratorError } from "../core/errors/NumeratorError";
import { percent } from "../core/value/percent";
import type { DecimalInput, NumericValue } from "../core/value/types";
import { unit } from "../core/value/unit";
import { applyGrouping } from "../format/applyGrouping";
import { multiplyDecimalByPowerOfTen } from "../format/decimalMath";
import { formatNumber } from "../format/formatNumber";
import { normalizeDigits } from "../locale/normalizeDigits";
import { getLocaleSymbols } from "../locale/resolveLocale";
import { getCurrencyMeta } from "../money/currencyRegistry";
import { money } from "../money/money";
import { parseNumber } from "../parse/parseNumber";

const DEFAULT_SELECTION: TextSelection = Object.freeze({ start: 0, end: 0 });
const INPUT_SPACE_PATTERN = /[\s\u00a0\u202f]/g;

export function createNumberInputState(
  options: NumberInputOptions = {},
): NumberInputState {
  const externalValue = getInitialExternalValue(options);

  if (externalValue === undefined || externalValue === null) {
    return markCommitted(createState("", DEFAULT_SELECTION, options));
  }

  const text = formatEditableTextFromExternalValue(externalValue, options);

  return markCommitted(
    createState(text, getCollapsedSelection(text.length), options),
  );
}

export function applyNumberInputText(
  state: NumberInputState,
  text: string,
  selection: TextSelection = getCollapsedSelection(text.length),
  options: NumberInputOptions = {},
): NumberInputState {
  if (isDigitEntryStrategy(options)) {
    return applyDigitEntryStrategy(state, text, options);
  }

  const sanitized = sanitizeNumberInputText(text, options);
  const formatted = formatTextWhileEditing(sanitized, options);
  const sanitizedCaret = getSanitizedCaret(text, selection.end, options);
  const caret = getFormattedEditingCaret(
    sanitized,
    sanitizedCaret,
    formatted,
    options,
  );

  return createState(
    formatted,
    clampSelection(
      {
        start: Math.min(caret, formatted.length),
        end: Math.min(caret, formatted.length),
      },
      formatted,
    ),
    options,
    state,
    sanitized,
  );
}

export function applyNumberInputEdit(
  state: NumberInputState,
  edit: NumberInputEdit,
  options: NumberInputOptions = {},
): NumberInputState {
  const selection = clampSelection(
    edit.selection ?? state.selection,
    state.text,
  );
  const nextText = `${state.text.slice(0, selection.start)}${edit.replacementText}${state.text.slice(selection.end)}`;
  const rawCaret = selection.start + edit.replacementText.length;

  return applyNumberInputText(
    state,
    nextText,
    getCollapsedSelection(rawCaret),
    options,
  );
}

export function applyNumberInputNativeTextChange(
  state: NumberInputState,
  nativeText: string,
  options: NumberInputOptions = {},
): NumberInputState {
  if (nativeText === state.text) {
    return state;
  }

  return applyNumberInputEdit(
    state,
    repairStaleEndInsertion(
      state,
      inferNativeTextEdit(state.text, nativeText),
      nativeText,
      options,
    ),
    options,
  );
}

export function setNumberInputSelection(
  state: NumberInputState,
  selection: TextSelection,
): NumberInputState {
  return {
    ...state,
    selection: clampSelection(selection, state.text),
  };
}

export function focusNumberInputState(
  state: NumberInputState,
): NumberInputState {
  return {
    ...state,
    isFocused: true,
  };
}

export function toggleNumberInputSign(
  state: NumberInputState,
  options: NumberInputOptions = {},
): NumberInputState {
  if (options.allowNegative === false) {
    return state;
  }

  const symbols = getLocaleSymbols({ locale: options.locale });
  const hasMinus = state.text.startsWith(symbols.minusSign);
  const text = hasMinus
    ? state.text.slice(symbols.minusSign.length)
    : `${symbols.minusSign}${state.text}`;
  const delta = hasMinus ? -symbols.minusSign.length : symbols.minusSign.length;

  return createState(
    text,
    clampSelection(
      {
        start: Math.max(0, state.selection.start + delta),
        end: Math.max(0, state.selection.end + delta),
      },
      text,
    ),
    options,
    state,
  );
}

export function formatNumberInputOnBlur(
  state: NumberInputState,
  options: NumberInputOptions = {},
): NumberInputState {
  if (options.formatOnBlur === false || state.value === null) {
    return {
      ...state,
      isFocused: false,
    };
  }

  const text = formatEditableTextFromValue(state.value, options, false);
  return createState(text, getCollapsedSelection(text.length), options, {
    ...state,
    isFocused: false,
  });
}

export function commitNumberInputState(
  state: NumberInputState,
): NumberInputState {
  return {
    ...state,
    committedValue: state.value,
    isDirty: false,
  };
}

export function resetNumberInputState(
  state: NumberInputState,
  options: NumberInputOptions = {},
  value?: NumberInputExternalValue | null,
): NumberInputState {
  const resetValue = arguments.length >= 3 ? value : state.committedValue;

  if (resetValue === null || resetValue === undefined) {
    return markCommitted(
      createState("", DEFAULT_SELECTION, options, {
        ...state,
        committedValue: null,
      }),
    );
  }

  const text = formatEditableTextFromExternalValue(resetValue, options);
  return markCommitted(
    createState(text, getCollapsedSelection(text.length), options, state),
  );
}

function isDigitEntryStrategy(options: NumberInputOptions): boolean {
  return (
    options.entryStrategy === "minorUnits" ||
    options.entryStrategy === "integerMajor"
  );
}

function applyDigitEntryStrategy(
  state: NumberInputState,
  text: string,
  options: NumberInputOptions,
): NumberInputState {
  const parseText = getDigitEntryParseText(text, options);
  const displayText =
    parseText.length === 0 ? "" : getDigitEntryDisplayText(parseText, options);

  return createState(
    displayText,
    getCollapsedSelection(displayText.length),
    options,
    state,
    parseText,
  );
}

function getDigitEntryParseText(
  text: string,
  options: NumberInputOptions,
): string {
  const symbols = getLocaleSymbols({ locale: options.locale });
  const normalized = normalizeDigits(text).replace(INPUT_SPACE_PATTERN, "");
  const maxInputLength =
    options.maxInputLength ?? DEFAULT_MAX_DECIMAL_INPUT_LENGTH;
  const digits = Array.from(normalized)
    .filter((character) => /\d/.test(character))
    .join("")
    .slice(0, maxInputLength);
  const hasMinus =
    options.allowNegative !== false &&
    (normalized.includes(symbols.minusSign) || normalized.includes("-"));

  if (digits.length === 0) {
    return hasMinus ? symbols.minusSign : "";
  }

  const value =
    options.entryStrategy === "minorUnits"
      ? createMinorUnitDecimal(digits, getInputFractionScale(options))
      : digits;

  return hasMinus ? `${symbols.minusSign}${value}` : value;
}

function getDigitEntryDisplayText(
  parseText: string,
  options: NumberInputOptions,
): string {
  const isPartialNegative =
    parseText === getLocaleSymbols({ locale: options.locale }).minusSign;

  if (isPartialNegative) {
    return parseText;
  }

  return formatNumber(parseText, {
    ...getModeFormatOptions(options),
    maximumFractionDigits:
      options.entryStrategy === "integerMajor"
        ? 0
        : options.maximumFractionDigits,
    minimumFractionDigits:
      options.entryStrategy === "integerMajor"
        ? 0
        : options.minimumFractionDigits,
    useGrouping: options.useGrouping,
  });
}

function createMinorUnitDecimal(digits: string, scale: number): string {
  if (scale <= 0) {
    return digits;
  }

  const padded = digits.padStart(scale + 1, "0");
  const integer = padded.slice(0, -scale).replace(/^0+(?=\d)/, "");
  const fraction = padded.slice(-scale);

  return `${integer}.${fraction}`;
}

function getInputFractionScale(options: NumberInputOptions): number {
  if (options.maximumFractionDigits !== undefined) {
    return Math.max(0, Math.trunc(options.maximumFractionDigits));
  }

  if (options.currency !== undefined) {
    try {
      return getCurrencyMeta(options.currency).minorUnit;
    } catch {
      return 2;
    }
  }

  return 2;
}

export function sanitizeNumberInputText(
  text: string,
  options: NumberInputOptions = {},
): string {
  const symbols = getLocaleSymbols({ locale: options.locale });
  const normalized = normalizeDigits(text).replace(INPUT_SPACE_PATTERN, "");
  const maxInputLength =
    options.maxInputLength ?? DEFAULT_MAX_DECIMAL_INPUT_LENGTH;
  const minusSigns = new Set([symbols.minusSign, "-"]);
  let hasMinus = false;
  let output = "";

  const characters = Array.from(normalized);

  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];

    if (/\d/.test(character)) {
      output += character;
    } else if (options.allowNegative !== false && minusSigns.has(character)) {
      hasMinus = true;
    } else if (options.allowDecimal !== false) {
      const decimalSeparator = getEditableDecimalSeparator(
        characters,
        index,
        options,
      );

      if (decimalSeparator !== null) {
        output += decimalSeparator;
      }
    }

    if (output.length >= maxInputLength) {
      break;
    }
  }

  const constrained = constrainDecimalSeparators(output, options);
  return hasMinus ? `${symbols.minusSign}${constrained}` : constrained;
}

function getEditableDecimalSeparator(
  characters: readonly string[],
  index: number,
  options: NumberInputOptions,
): string | null {
  const symbols = getLocaleSymbols({ locale: options.locale });
  const character = characters[index];
  const decimalSeparators = new Set([symbols.decimal, ".", ","]);

  if (!decimalSeparators.has(character)) {
    return null;
  }

  const groupingSeparator = symbols.grouping.separator;

  if (
    options.formatWhileEditing === true &&
    options.useGrouping !== false &&
    character === groupingSeparator &&
    character !== symbols.decimal &&
    !isLikelyDecimalSeparator(characters, index, options)
  ) {
    return null;
  }

  return symbols.decimal;
}

function isLikelyDecimalSeparator(
  characters: readonly string[],
  index: number,
  options: NumberInputOptions,
): boolean {
  const symbols = getLocaleSymbols({ locale: options.locale });
  const character = characters[index];
  const suffixDigits = countAdjacentDigits(characters, index + 1, 1);

  if (character === symbols.decimal) {
    return true;
  }

  if (characters.some((candidate) => candidate === symbols.decimal)) {
    return false;
  }

  if (
    characters.filter((candidate) => candidate === character).length > 1 ||
    suffixDigits > symbols.grouping.primary
  ) {
    return false;
  }

  if (suffixDigits === 0) {
    return true;
  }

  if (suffixDigits < symbols.grouping.primary) {
    return true;
  }

  return false;
}

function countAdjacentDigits(
  characters: readonly string[],
  start: number,
  direction: 1 | -1,
): number {
  let count = 0;

  for (
    let index = start;
    index >= 0 && index < characters.length;
    index += direction
  ) {
    if (!/\d/.test(characters[index])) {
      break;
    }

    count += 1;
  }

  return count;
}

function createState(
  text: string,
  selection: TextSelection,
  options: NumberInputOptions,
  previous?: NumberInputState,
  parseText = text,
): NumberInputState {
  const committedValue = previous?.committedValue ?? null;
  const isFocused = previous?.isFocused ?? false;

  if (isPartialNumberInput(parseText, options)) {
    return {
      text,
      value: null,
      committedValue,
      selection: clampSelection(selection, text),
      isValid: true,
      isDirty: !numericValuesEqual(null, committedValue),
      isFocused,
      error: null,
    };
  }

  try {
    const parsed = parseNumber(parseText, {
      locale: options.locale,
      mode: options.parseMode ?? "loose",
    });
    const value = createModeValue(parsed, options);

    return {
      text,
      value,
      committedValue,
      selection: clampSelection(selection, text),
      isValid: true,
      isDirty: !numericValuesEqual(value, committedValue),
      isFocused,
      error: null,
    };
  } catch (error) {
    return {
      text,
      value: null,
      committedValue,
      selection: clampSelection(selection, text),
      isValid: false,
      isDirty: !numericValuesEqual(null, committedValue),
      isFocused,
      error:
        error instanceof NumeratorError
          ? error
          : new NumeratorError("PARSE_FAILED"),
    };
  }
}

function markCommitted(state: NumberInputState): NumberInputState {
  return {
    ...state,
    committedValue: state.value,
    isDirty: false,
  };
}

function getInitialExternalValue(
  options: NumberInputOptions,
): NumberInputExternalValue | null | undefined {
  if ("value" in options) {
    return options.value;
  }

  if ("defaultValue" in options) {
    return options.defaultValue;
  }

  return options.initialValue;
}

function formatEditableTextFromExternalValue(
  value: NumberInputExternalValue,
  options: NumberInputOptions,
): string {
  return formatEditableTextFromDecimal(
    getEditableDecimalInput(value, options),
    options,
    true,
  );
}

function formatEditableTextFromValue(
  value: NumericValue,
  options: NumberInputOptions,
  keepUngrouped: boolean,
): string {
  return formatEditableTextFromDecimal(
    getValueDecimalInput(value),
    options,
    keepUngrouped,
  );
}

function formatEditableTextFromDecimal(
  value: DecimalInput,
  options: NumberInputOptions,
  keepUngrouped: boolean,
): string {
  return formatNumber(value, {
    ...getModeFormatOptions(options),
    useGrouping: keepUngrouped
      ? (options.useGrouping ?? false)
      : options.useGrouping,
  });
}

function formatTextWhileEditing(
  text: string,
  options: NumberInputOptions,
): string {
  if (
    options.formatWhileEditing !== true ||
    options.useGrouping === false ||
    isPartialNumberInput(text, options)
  ) {
    return text;
  }

  const symbols = getLocaleSymbols({ locale: options.locale });
  const isNegative = text.startsWith(symbols.minusSign);
  const sign = isNegative ? symbols.minusSign : "";
  const unsigned = isNegative ? text.slice(symbols.minusSign.length) : text;
  const decimalIndex = unsigned.indexOf(symbols.decimal);
  const integer =
    decimalIndex >= 0 ? unsigned.slice(0, decimalIndex) : unsigned;
  const fraction = decimalIndex >= 0 ? unsigned.slice(decimalIndex) : "";

  if (integer.length === 0) {
    return text;
  }

  return `${sign}${applyGrouping(integer, symbols.grouping)}${fraction}`;
}

function getFormattedEditingCaret(
  sanitized: string,
  sanitizedCaret: number,
  formatted: string,
  options: NumberInputOptions,
): number {
  if (sanitized === formatted) {
    return sanitizedCaret;
  }

  const target = countEditableCharacters(
    sanitized.slice(0, sanitizedCaret),
    options,
  );

  if (target === 0) {
    return 0;
  }

  let seen = 0;

  for (let index = 0; index < formatted.length; index += 1) {
    if (isEditableCharacter(formatted[index], options)) {
      seen += 1;
    }

    if (seen === target) {
      return index + 1;
    }
  }

  return formatted.length;
}

function getEditableDecimalInput(
  value: NumberInputExternalValue,
  options: NumberInputOptions,
): DecimalInput {
  if (typeof value === "object" && value !== null && "kind" in value) {
    return getValueDecimalInput(value);
  }

  if (options.mode === "percent") {
    return multiplyDecimalByPowerOfTen(value, 2);
  }

  return value;
}

function getValueDecimalInput(value: NumericValue): DecimalInput {
  if (value.kind === "money") {
    return value.amount;
  }

  if (value.kind === "percent") {
    return multiplyDecimalByPowerOfTen(value.value, 2);
  }

  if (value.kind === "unit") {
    return value.value;
  }

  return value;
}

function createModeValue(
  value: ReturnType<typeof parseNumber>,
  options: NumberInputOptions,
): NumericValue {
  if (options.mode === "money") {
    return money(value, options.currency ?? "");
  }

  if (options.mode === "percent") {
    return percent(multiplyDecimalByPowerOfTen(value.value, -2));
  }

  if (options.mode === "unit") {
    return unit(value, options.unit ?? "");
  }

  return value;
}

function getModeFormatOptions(options: NumberInputOptions): NumberInputOptions {
  if (options.mode !== "money" || options.currency === undefined) {
    return options;
  }

  try {
    const meta = getCurrencyMeta(options.currency);

    return {
      ...options,
      minimumFractionDigits: options.minimumFractionDigits ?? meta.minorUnit,
      maximumFractionDigits: options.maximumFractionDigits ?? meta.minorUnit,
    };
  } catch {
    return options;
  }
}

function numericValuesEqual(
  left: NumericValue | null,
  right: NumericValue | null,
): boolean {
  if (left === right) {
    return true;
  }

  if (left === null || right === null || left.kind !== right.kind) {
    return false;
  }

  switch (left.kind) {
    case "decimal":
      return right.kind === "decimal" && left.value === right.value;
    case "percent":
      return right.kind === "percent" && left.value === right.value;
    case "money":
      return (
        right.kind === "money" &&
        left.amount === right.amount &&
        left.currency === right.currency
      );
    case "unit":
      return (
        right.kind === "unit" &&
        left.value === right.value &&
        left.unit === right.unit
      );
  }
}

function constrainDecimalSeparators(
  text: string,
  options: NumberInputOptions,
): string {
  if (options.allowDecimal === false) {
    return text.replace(/[.,]/g, "");
  }

  const symbols = getLocaleSymbols({ locale: options.locale });
  const decimalSeparator = getLastDecimalSeparator(text, symbols.decimal);

  if (decimalSeparator === null) {
    return text;
  }

  const index = text.lastIndexOf(decimalSeparator);
  const integer = text.slice(0, index).replace(/[.,]/g, "");
  const rawFraction = text
    .slice(index + decimalSeparator.length)
    .replace(/[.,]/g, "");
  const fraction =
    options.maximumFractionDigits === undefined
      ? rawFraction
      : rawFraction.slice(0, options.maximumFractionDigits);

  return `${integer}${symbols.decimal}${fraction}`;
}

function getLastDecimalSeparator(
  text: string,
  localeDecimal: string,
): string | null {
  const separators = [localeDecimal, ".", ","];
  const candidates = [...new Set(separators)].map((separator) => ({
    separator,
    index: text.lastIndexOf(separator),
  }));
  const winner = candidates.sort((a, b) => b.index - a.index)[0];

  return winner && winner.index >= 0 ? winner.separator : null;
}

function inferNativeTextEdit(
  previousText: string,
  nativeText: string,
): NumberInputEdit {
  const prefixLength = getCommonPrefixLength(previousText, nativeText);
  const suffixLength = getCommonSuffixLength(
    previousText,
    nativeText,
    prefixLength,
  );

  return {
    replacementText: nativeText.slice(
      prefixLength,
      nativeText.length - suffixLength,
    ),
    selection: {
      start: prefixLength,
      end: previousText.length - suffixLength,
    },
  };
}

function repairStaleEndInsertion(
  state: NumberInputState,
  edit: NumberInputEdit,
  nativeText: string,
  options: NumberInputOptions,
): NumberInputEdit {
  if (
    options.formatWhileEditing !== true ||
    options.useGrouping === false ||
    state.selection.start !== state.selection.end ||
    state.selection.end !== state.text.length ||
    edit.selection === undefined ||
    edit.selection.start !== edit.selection.end ||
    edit.selection.end >= state.text.length ||
    edit.replacementText.length === 0 ||
    nativeText.length <= state.text.length
  ) {
    return edit;
  }

  const inserted = sanitizeNumberInputText(edit.replacementText, {
    ...options,
    allowNegative: false,
  });

  if (inserted.length === 0) {
    return edit;
  }

  return {
    ...edit,
    selection: state.selection,
  };
}

function getCommonPrefixLength(a: string, b: string): number {
  const max = Math.min(a.length, b.length);
  let index = 0;

  while (index < max && a[index] === b[index]) {
    index += 1;
  }

  return index;
}

function getCommonSuffixLength(
  a: string,
  b: string,
  prefixLength: number,
): number {
  const max = Math.min(a.length, b.length) - prefixLength;
  let offset = 0;

  while (
    offset < max &&
    a[a.length - 1 - offset] === b[b.length - 1 - offset]
  ) {
    offset += 1;
  }

  return offset;
}

function getSanitizedCaret(
  rawText: string,
  rawCaret: number,
  options: NumberInputOptions,
): number {
  return sanitizeNumberInputText(rawText.slice(0, rawCaret), options).length;
}

function countEditableCharacters(
  text: string,
  options: NumberInputOptions,
): number {
  return Array.from(text).filter((character) =>
    isEditableCharacter(character, options),
  ).length;
}

function isEditableCharacter(
  character: string,
  options: NumberInputOptions,
): boolean {
  const symbols = getLocaleSymbols({ locale: options.locale });

  return (
    /\d/.test(character) ||
    character === symbols.decimal ||
    character === symbols.minusSign
  );
}

function isPartialNumberInput(
  text: string,
  options: NumberInputOptions,
): boolean {
  const symbols = getLocaleSymbols({ locale: options.locale });
  return (
    text.length === 0 ||
    text === symbols.minusSign ||
    text === symbols.plusSign ||
    text === symbols.decimal ||
    text === `${symbols.minusSign}${symbols.decimal}` ||
    text === `${symbols.plusSign}${symbols.decimal}`
  );
}

function clampSelection(selection: TextSelection, text: string): TextSelection {
  const start = clampIndex(selection.start, text.length);
  const end = clampIndex(selection.end, text.length);

  return {
    start: Math.min(start, end),
    end: Math.max(start, end),
  };
}

function clampIndex(index: number, max: number): number {
  if (!Number.isFinite(index)) {
    return max;
  }

  return Math.max(0, Math.min(Math.trunc(index), max));
}

function getCollapsedSelection(index: number): TextSelection {
  return { start: index, end: index };
}
