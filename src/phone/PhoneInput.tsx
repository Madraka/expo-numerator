import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import type { ComponentType, Ref } from "react";
import type {
  TextInput as TextInputInstance,
  TextInputProps,
} from "react-native";

import type { PhoneInputOptions, PhoneInputState } from "./phoneTypes";
import { usePhoneInput } from "./usePhoneInput";

declare const require: (moduleName: string) => unknown;

type TextInputComponent = ComponentType<
  TextInputProps & {
    ref?: Ref<TextInputInstance>;
  }
>;

export type PhoneInputProps = Omit<
  TextInputProps,
  "defaultValue" | "selection" | "value"
> &
  PhoneInputOptions & {
    readonly onInputStateChange?: (state: PhoneInputState) => void;
    readonly onValueChange?: (
      value: PhoneInputState["value"],
      state: PhoneInputState,
    ) => void;
    readonly textInputComponent?: TextInputComponent;
  };

let cachedTextInput: TextInputComponent | null = null;

export const PhoneInput = forwardRef<TextInputInstance, PhoneInputProps>(
  function PhoneInput(props, ref) {
    const {
      country,
      defaultCountry,
      defaultRegion,
      defaultValue,
      formatWhileEditing,
      includeNonGeographic,
      initialValue,
      maxInputLength,
      onBlur,
      onChangeText,
      onFocus,
      onInputStateChange,
      onSelectionChange,
      onValueChange,
      textInputComponent,
      validationMode,
      value,
      keyboardType = "phone-pad",
      autoComplete = "tel",
      textContentType,
      ...textInputProps
    } = props;
    const input = usePhoneInput({
      country,
      defaultCountry,
      defaultRegion,
      defaultValue,
      formatWhileEditing,
      includeNonGeographic,
      initialValue,
      maxInputLength,
      validationMode,
      value,
    });
    const callbackRef = useRef({
      onInputStateChange,
      onValueChange,
    });
    const publicState = useMemo(
      () => toPhoneInputState(input),
      [
        input.committedValue,
        input.country,
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
      autoComplete,
      keyboardType,
      textContentType: textContentType ?? "telephoneNumber",
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

function toPhoneInputState(input: PhoneInputState): PhoneInputState {
  return {
    text: input.text,
    value: input.value,
    committedValue: input.committedValue,
    country: input.country,
    selection: input.selection,
    isValid: input.isValid,
    isDirty: input.isDirty,
    isFocused: input.isFocused,
    error: input.error,
  };
}
