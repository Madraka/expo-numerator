import React, { forwardRef } from "react";
import type { TextInput as TextInputInstance } from "react-native";

import { NumberInput, type NumberInputProps } from "./NumberInput";
import { createIntegerInputOptions } from "./integerInputOptions";

export type IntegerInputProps = Omit<
  NumberInputProps,
  "allowDecimal" | "maximumFractionDigits" | "minimumFractionDigits" | "mode"
>;

export const IntegerInput = forwardRef<TextInputInstance, IntegerInputProps>(
  function IntegerInput(props, ref) {
    return React.createElement(NumberInput, {
      ...props,
      ...createIntegerInputOptions(props),
      ref,
    });
  },
);
