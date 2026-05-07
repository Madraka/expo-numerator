import React, { createContext, useContext, useMemo } from "react";
import type { PropsWithChildren } from "react";

import {
  createExpoNumerator,
  type CreateExpoNumeratorOptions,
  type ExpoNumerator,
} from "./createExpoNumerator";

export type NumeratorProviderProps = PropsWithChildren<{
  value?: ExpoNumerator;
  options?: CreateExpoNumeratorOptions;
}>;

const defaultNumerator = createExpoNumerator({ useDeviceLocale: false });
const NumeratorContext = createContext<ExpoNumerator>(defaultNumerator);

export function NumeratorProvider(
  props: NumeratorProviderProps,
): React.ReactElement {
  const numerator = useMemo(
    () => props.value ?? createExpoNumerator(props.options),
    [props.options, props.value],
  );

  return React.createElement(
    NumeratorContext.Provider,
    { value: numerator },
    props.children,
  );
}

export function useNumerator(): ExpoNumerator {
  return useContext(NumeratorContext);
}
