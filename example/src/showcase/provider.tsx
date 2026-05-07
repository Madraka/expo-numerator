import {
  createExpoNumerator,
  NumeratorProvider,
  type ExpoNumerator,
} from "expo-numerator";
import { createContext, useContext, useMemo, useState } from "react";
import type React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export type ShowcaseContextValue = {
  readonly locale: string;
  readonly numerator: ExpoNumerator;
  readonly setLocale: (locale: string) => void;
};

const ShowcaseContext = createContext<ShowcaseContextValue | null>(null);

export function ShowcaseProvider(props: { children: React.ReactNode }) {
  const [locale, setLocale] = useState("en-US");
  const numerator = useMemo(() => createExpoNumerator({ locale }), [locale]);
  const value = useMemo(
    () => ({
      locale,
      numerator,
      setLocale,
    }),
    [locale, numerator],
  );

  return (
    <SafeAreaProvider>
      <ShowcaseContext.Provider value={value}>
        <NumeratorProvider value={numerator}>{props.children}</NumeratorProvider>
      </ShowcaseContext.Provider>
    </SafeAreaProvider>
  );
}

export function useShowcase() {
  const value = useContext(ShowcaseContext);

  if (!value) {
    throw new Error("useShowcase must be used inside ShowcaseProvider.");
  }

  return value;
}
