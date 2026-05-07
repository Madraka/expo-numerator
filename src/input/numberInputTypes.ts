import type { NumeratorError } from "../core/errors/NumeratorError";
import type { DecimalInput, NumericValue } from "../core/value/types";
import type { NumberFormatOptions } from "../format/formatOptions";
import type { ParseMode } from "../parse/parseOptions";

export type TextSelection = {
  start: number;
  end: number;
};

export type NumberInputMode = "decimal" | "money" | "percent" | "unit";
export type NumberInputCaretBehavior = "preserve" | "end";
export type NumberInputEntryStrategy =
  | "standard"
  | "minorUnits"
  | "integerMajor";

export type NumberInputExternalValue = DecimalInput | NumericValue;

export type NumberInputOptions = Omit<NumberFormatOptions, "style"> & {
  mode?: NumberInputMode;
  initialValue?: DecimalInput | null;
  defaultValue?: NumberInputExternalValue | null;
  value?: NumberInputExternalValue | null;
  currency?: string;
  unit?: string;
  allowNegative?: boolean;
  allowDecimal?: boolean;
  caretBehavior?: NumberInputCaretBehavior;
  entryStrategy?: NumberInputEntryStrategy;
  parseMode?: ParseMode;
  formatOnBlur?: boolean;
  formatWhileEditing?: boolean;
  maxInputLength?: number;
};

export type NumberInputState = {
  text: string;
  value: NumericValue | null;
  committedValue: NumericValue | null;
  selection: TextSelection;
  isValid: boolean;
  isDirty: boolean;
  isFocused: boolean;
  error: NumeratorError | null;
};

export type NumberInputEdit = {
  replacementText: string;
  selection?: TextSelection;
};

export type NumberInputSelectionEvent = {
  nativeEvent: {
    selection: TextSelection;
  };
};

export type NumberInputTextInputProps = {
  value: string;
  selection: TextSelection;
  onChangeText: (text: string) => void;
  onSelectionChange: (event: NumberInputSelectionEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
};

export type UseNumberInputResult = NumberInputState & {
  inputProps: NumberInputTextInputProps;
  setText: (text: string, selection?: TextSelection) => void;
  setSelection: (selection: TextSelection) => void;
  applyEdit: (edit: NumberInputEdit) => void;
  toggleSign: () => void;
  focus: () => void;
  blur: () => void;
  commit: () => void;
  reset: (value?: NumberInputExternalValue | null) => void;
};
