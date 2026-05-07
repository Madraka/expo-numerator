import React, { forwardRef } from "react";
import type { TextInput as TextInputInstance } from "react-native";

import { NumberInput, type NumberInputProps } from "./NumberInput";
import { createUnitInputOptions } from "./unitInputOptions";

export type UnitInputProps = Omit<NumberInputProps, "mode" | "unit"> & {
  unit: string;
};

export const UnitInput = forwardRef<TextInputInstance, UnitInputProps>(
  function UnitInput(props, ref) {
    const { unit, ...inputProps } = props;

    return React.createElement(NumberInput, {
      ...inputProps,
      ...createUnitInputOptions(unit, inputProps),
      ref,
    });
  },
);
