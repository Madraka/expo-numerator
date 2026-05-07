import React, { forwardRef } from "react";
import type { TextInput as TextInputInstance } from "react-native";

import { NumberInput, type NumberInputProps } from "./NumberInput";
import { createPercentInputOptions } from "./percentInputOptions";

export type PercentInputProps = Omit<NumberInputProps, "mode">;

export const PercentInput = forwardRef<TextInputInstance, PercentInputProps>(
  function PercentInput(props, ref) {
    return React.createElement(NumberInput, {
      ...props,
      ...createPercentInputOptions(props),
      ref,
    });
  },
);
