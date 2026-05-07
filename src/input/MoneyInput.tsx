import React, { forwardRef } from "react";
import type { TextInput as TextInputInstance } from "react-native";

import { NumberInput, type NumberInputProps } from "./NumberInput";
import {
  createMoneyInputOptions,
  type MoneyInputEntryMode,
} from "./moneyInputOptions";

export type MoneyInputProps = Omit<
  NumberInputProps,
  "currency" | "entryStrategy" | "mode"
> & {
  currency: string;
  entryMode?: MoneyInputEntryMode;
};

export const MoneyInput = forwardRef<TextInputInstance, MoneyInputProps>(
  function MoneyInput(props, ref) {
    const { currency, entryMode, ...inputProps } = props;

    return React.createElement(NumberInput, {
      ...inputProps,
      ...createMoneyInputOptions(currency, { ...inputProps, entryMode }),
      ref,
    });
  },
);
