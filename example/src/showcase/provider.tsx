import {
  createExpoNumerator,
  NumeratorProvider,
  type ExpoNumerator,
  type PhoneRegionCode,
} from "expo-numerator";
import { createContext, useContext, useMemo, useState } from "react";
import type React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export type ShowcaseContextValue = {
  readonly locale: string;
  readonly numerator: ExpoNumerator;
  readonly phoneRegion: PhoneRegionCode | null;
  readonly setLocale: (locale: string) => void;
  readonly setPhoneRegion: (region: PhoneRegionCode | null) => void;
};

const ShowcaseContext = createContext<ShowcaseContextValue | null>(null);

export function ShowcaseProvider(props: { children: React.ReactNode }) {
  const [locale, setLocale] = useState("en-US");
  const [phoneRegion, setPhoneRegion] = useState<PhoneRegionCode | null>(null);
  const numerator = useMemo(() => createExpoNumerator({ locale }), [locale]);
  const value = useMemo(
    () => ({
      locale,
      numerator,
      phoneRegion,
      setLocale,
      setPhoneRegion,
    }),
    [locale, numerator, phoneRegion],
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
