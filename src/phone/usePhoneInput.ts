import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";

import {
  applyPhoneInputNativeTextChange,
  applyPhoneInputText,
  blurPhoneInputState,
  commitPhoneInputState,
  createPhoneInputState,
  focusPhoneInputState,
  resetPhoneInputState,
  setPhoneInputCountry,
  setPhoneInputSelection,
} from "./phoneInputState";
import type {
  PhoneInputOptions,
  PhoneInputSelectionEvent,
  PhoneRegionCode,
  PhoneTextSelection,
  PhoneValue,
  UsePhoneInputResult,
} from "./phoneTypes";

export function usePhoneInput(
  options: PhoneInputOptions = {},
): UsePhoneInputResult {
  const [state, setState] = useState(() => createPhoneInputState(options));
  const pendingFormattedSelection = useRef<{
    readonly text: string;
    readonly selection: PhoneTextSelection;
  } | null>(null);
  const pendingSelectionTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isControlled = "value" in options;

  useEffect(() => {
    if (isControlled) {
      clearPendingFormattedSelection(
        pendingFormattedSelection,
        pendingSelectionTimer,
      );
      setState(createPhoneInputState(options));
    }
  }, [isControlled, options.value]);

  useEffect(
    () => () => {
      clearPendingFormattedSelection(
        pendingFormattedSelection,
        pendingSelectionTimer,
      );
    },
    [],
  );

  const setText = useCallback(
    (text: string, selection?: PhoneTextSelection) => {
      setState((current) => {
        const next = selection
          ? applyPhoneInputText(current, text, selection, options)
          : applyPhoneInputNativeTextChange(current, text, options);

        if (next.text !== text) {
          setPendingFormattedSelection(
            pendingFormattedSelection,
            pendingSelectionTimer,
            { text: next.text, selection: next.selection },
          );
        } else {
          clearPendingFormattedSelection(
            pendingFormattedSelection,
            pendingSelectionTimer,
          );
        }

        return next;
      });
    },
    [options],
  );

  const setCountry = useCallback(
    (country: PhoneRegionCode) => {
      setState((current) => setPhoneInputCountry(current, country, options));
    },
    [options],
  );

  const setSelection = useCallback((selection: PhoneTextSelection) => {
    setState((current) => setPhoneInputSelection(current, selection));
  }, []);

  const focus = useCallback(() => {
    setState((current) => focusPhoneInputState(current));
  }, []);

  const blur = useCallback(() => {
    setState((current) => blurPhoneInputState(current, options));
  }, [options]);

  const commit = useCallback(() => {
    setState((current) => commitPhoneInputState(current));
  }, []);

  const reset = useCallback(
    (value?: string | PhoneValue | null) => {
      setState((current) =>
        value !== undefined
          ? resetPhoneInputState(current, options, value)
          : resetPhoneInputState(current, options),
      );
    },
    [options],
  );

  const onSelectionChange = useCallback(
    (event: PhoneInputSelectionEvent) => {
      const pending = pendingFormattedSelection.current;
      const selection = event.nativeEvent.selection;

      if (
        pending !== null &&
        selection.start < pending.selection.start &&
        selection.end <= pending.selection.end
      ) {
        return;
      }

      clearPendingFormattedSelection(
        pendingFormattedSelection,
        pendingSelectionTimer,
      );
      setSelection(selection);
    },
    [setSelection],
  );

  return {
    ...state,
    inputProps: {
      value: state.text,
      selection: state.selection,
      onChangeText: setText,
      onSelectionChange,
      onFocus: focus,
      onBlur: blur,
    },
    setText,
    setCountry,
    setSelection,
    focus,
    blur,
    commit,
    reset,
  };
}

function setPendingFormattedSelection(
  pendingRef: MutableRefObject<{
    readonly text: string;
    readonly selection: PhoneTextSelection;
  } | null>,
  timerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>,
  pending: {
    readonly text: string;
    readonly selection: PhoneTextSelection;
  },
): void {
  if (timerRef.current !== null) {
    clearTimeout(timerRef.current);
  }

  pendingRef.current = pending;
  timerRef.current = setTimeout(() => {
    pendingRef.current = null;
    timerRef.current = null;
  }, 120);
}

function clearPendingFormattedSelection(
  pendingRef: MutableRefObject<{
    readonly text: string;
    readonly selection: PhoneTextSelection;
  } | null>,
  timerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>,
): void {
  pendingRef.current = null;

  if (timerRef.current !== null) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}
