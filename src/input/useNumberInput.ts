import { useCallback, useEffect, useRef, useState } from "react";

import {
  applyNumberInputEdit,
  applyNumberInputNativeTextChange,
  applyNumberInputText,
  commitNumberInputState,
  createNumberInputState,
  focusNumberInputState,
  formatNumberInputOnBlur,
  resetNumberInputState,
  setNumberInputSelection,
  toggleNumberInputSign,
} from "./numberInputState";
import type {
  NumberInputExternalValue,
  NumberInputEdit,
  NumberInputOptions,
  NumberInputSelectionEvent,
  TextSelection,
  UseNumberInputResult,
} from "./numberInputTypes";

export function useNumberInput(
  options: NumberInputOptions = {},
): UseNumberInputResult {
  const [state, setState] = useState(() => createNumberInputState(options));
  const isControlled = "value" in options;
  const pendingFormattedSelectionRef = useRef<TextSelection | null>(null);

  useEffect(() => {
    if (isControlled) {
      setState(createNumberInputState(options));
    }
  }, [
    isControlled,
    options.allowDecimal,
    options.allowNegative,
    options.currency,
    options.entryStrategy,
    options.locale,
    options.maximumFractionDigits,
    options.minimumFractionDigits,
    options.mode,
    options.parseMode,
    options.roundingMode,
    options.signDisplay,
    options.trailingZeroDisplay,
    options.unit,
    options.useGrouping,
    options.value,
  ]);

  const setText = useCallback(
    (text: string, selection?: TextSelection) => {
      setState((current) => {
        const next = selection
          ? applyNumberInputText(current, text, selection, options)
          : applyNumberInputNativeTextChange(current, text, options);

        pendingFormattedSelectionRef.current =
          options.formatWhileEditing === true &&
          selection === undefined &&
          next.text !== text
            ? next.selection
            : null;

        return next;
      });
    },
    [options],
  );

  const setSelection = useCallback(
    (selection: TextSelection) => {
      if (options.caretBehavior === "end") {
        return;
      }

      setState((current) => setNumberInputSelection(current, selection));
    },
    [options.caretBehavior],
  );

  const applyEdit = useCallback(
    (edit: NumberInputEdit) => {
      setState((current) => applyNumberInputEdit(current, edit, options));
    },
    [options],
  );

  const toggleSign = useCallback(() => {
    setState((current) => toggleNumberInputSign(current, options));
  }, [options]);

  const focus = useCallback(() => {
    setState((current) => focusNumberInputState(current));
  }, []);

  const blur = useCallback(() => {
    setState((current) => formatNumberInputOnBlur(current, options));
  }, [options]);

  const commit = useCallback(() => {
    setState((current) => commitNumberInputState(current));
  }, []);

  const reset = useCallback(
    (value?: NumberInputExternalValue | null) => {
      setState((current) =>
        value !== undefined
          ? resetNumberInputState(current, options, value)
          : resetNumberInputState(current, options),
      );
    },
    [options],
  );

  const onSelectionChange = useCallback(
    (event: NumberInputSelectionEvent) => {
      const pendingSelection = pendingFormattedSelectionRef.current;

      if (pendingSelection !== null) {
        pendingFormattedSelectionRef.current = null;

        if (
          !textSelectionsEqual(event.nativeEvent.selection, pendingSelection)
        ) {
          return;
        }
      }

      setSelection(event.nativeEvent.selection);
    },
    [setSelection],
  );

  return {
    ...state,
    inputProps: {
      value: state.text,
      selection:
        options.caretBehavior === "end"
          ? getEndSelection(state.text)
          : state.selection,
      onChangeText: setText,
      onSelectionChange,
      onFocus: focus,
      onBlur: blur,
    },
    setText,
    setSelection,
    applyEdit,
    toggleSign,
    focus,
    blur,
    commit,
    reset,
  };
}

function getEndSelection(text: string): TextSelection {
  return {
    end: text.length,
    start: text.length,
  };
}

function textSelectionsEqual(
  left: TextSelection,
  right: TextSelection,
): boolean {
  return left.start === right.start && left.end === right.end;
}
