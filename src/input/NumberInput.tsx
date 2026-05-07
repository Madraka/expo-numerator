import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import type { ComponentType, Ref } from "react";
import type {
  TextInput as TextInputInstance,
  TextInputProps,
} from "react-native";

import type { NumberInputOptions, NumberInputState } from "./numberInputTypes";
import { useNumberInput } from "./useNumberInput";

declare const require: (moduleName: string) => unknown;

type TextInputComponent = ComponentType<
  TextInputProps & {
    ref?: Ref<TextInputInstance>;
  }
>;

export type NumberInputProps = Omit<
  TextInputProps,
  "defaultValue" | "selection" | "value"
> &
  NumberInputOptions & {
    onInputStateChange?: (state: NumberInputState) => void;
    onValueChange?: (
      value: NumberInputState["value"],
      state: NumberInputState,
    ) => void;
    textInputComponent?: TextInputComponent;
  };

let cachedTextInput: TextInputComponent | null = null;

export const NumberInput = forwardRef<TextInputInstance, NumberInputProps>(
  function NumberInput(props, ref) {
    const {
      allowDecimal,
      allowNegative,
      caretBehavior,
      currency,
      defaultValue,
      entryStrategy,
      formatOnBlur,
      formatWhileEditing,
      initialValue,
      locale,
      maximumFractionDigits,
      maxInputLength,
      minimumFractionDigits,
      mode,
      onBlur,
      onChangeText,
      onFocus,
      onInputStateChange,
      onSelectionChange,
      onValueChange,
      parseMode,
      roundingMode,
      signDisplay,
      textInputComponent,
      trailingZeroDisplay,
      unit,
      useGrouping,
      value,
      keyboardType = "decimal-pad",
      ...textInputProps
    } = props;

    const input = useNumberInput({
      allowDecimal,
      allowNegative,
      caretBehavior,
      currency,
      defaultValue,
      entryStrategy,
      formatOnBlur,
      formatWhileEditing,
      initialValue,
      locale,
      maximumFractionDigits,
      maxInputLength,
      minimumFractionDigits,
      mode,
      parseMode,
      roundingMode,
      signDisplay,
      trailingZeroDisplay,
      unit,
      useGrouping,
      value,
    });
    const callbackRef = useRef({
      onInputStateChange,
      onValueChange,
    });
    const publicState = useMemo(
      () => toNumberInputState(input),
      [
        input.committedValue,
        input.error,
        input.isDirty,
        input.isFocused,
        input.isValid,
        input.selection.end,
        input.selection.start,
        input.text,
        input.value,
      ],
    );

    useEffect(() => {
      callbackRef.current = {
        onInputStateChange,
        onValueChange,
      };
    }, [onInputStateChange, onValueChange]);

    useEffect(() => {
      callbackRef.current.onInputStateChange?.(publicState);
      callbackRef.current.onValueChange?.(publicState.value, publicState);
    }, [publicState]);

    const TextInput = textInputComponent ?? getTextInputComponent();

    return React.createElement(TextInput, {
      ...textInputProps,
      ...input.inputProps,
      ref,
      keyboardType,
      onBlur: (event) => {
        input.inputProps.onBlur();
        onBlur?.(event);
      },
      onChangeText: (text) => {
        input.inputProps.onChangeText(text);
        onChangeText?.(text);
      },
      onFocus: (event) => {
        input.inputProps.onFocus();
        onFocus?.(event);
      },
      onSelectionChange: (event) => {
        input.inputProps.onSelectionChange(event);
        onSelectionChange?.(event);
      },
    });
  },
);

function getTextInputComponent(): TextInputComponent {
  if (cachedTextInput === null) {
    const reactNative = require("react-native") as {
      TextInput: TextInputComponent;
    };
    cachedTextInput = reactNative.TextInput;
  }

  return cachedTextInput;
}

function toNumberInputState(input: NumberInputState): NumberInputState {
  return {
    text: input.text,
    value: input.value,
    committedValue: input.committedValue,
    selection: input.selection,
    isValid: input.isValid,
    isDirty: input.isDirty,
    isFocused: input.isFocused,
    error: input.error,
  };
}
