import React, { useMemo } from "react";
import type { ComponentType } from "react";
import type {
  FlatListProps,
  ListRenderItemInfo,
  PressableProps,
  TextProps,
  ViewProps,
} from "react-native";

import { getPhoneCountries } from "./phoneRegistry";
import type {
  PhoneCountryListOptions,
  PhoneCountryMeta,
  PhoneRegionCode,
} from "./phoneTypes";

declare const require: (moduleName: string) => unknown;

type FlatListComponent = ComponentType<FlatListProps<PhoneCountryMeta>>;
type PressableComponent = ComponentType<PressableProps>;
type TextComponent = ComponentType<TextProps>;
type ViewComponent = ComponentType<ViewProps>;

export type PhoneCountryPickerProps = PhoneCountryListOptions & {
  readonly query?: string;
  readonly selectedRegion?: PhoneRegionCode | null;
  readonly showEmojiFlag?: boolean;
  readonly virtualized?: boolean;
  readonly onCountryChange?: (country: PhoneCountryMeta) => void;
  readonly renderCountry?: (info: {
    readonly country: PhoneCountryMeta;
    readonly selected: boolean;
  }) => React.ReactElement | null;
  readonly flatListComponent?: FlatListComponent;
  readonly pressableComponent?: PressableComponent;
  readonly textComponent?: TextComponent;
  readonly viewComponent?: ViewComponent;
  readonly testID?: string;
};

let cachedReactNative: {
  FlatList: FlatListComponent;
  Pressable: PressableComponent;
  Text: TextComponent;
  View: ViewComponent;
} | null = null;

export function PhoneCountryPicker(props: PhoneCountryPickerProps) {
  const countries = useMemo(
    () => filterCountries(getPhoneCountries(props), props.query),
    [
      props.includeNonGeographic,
      props.locale,
      props.preferredRegions,
      props.query,
      props.regions,
    ],
  );
  const rn = getReactNativeComponents();

  if (props.virtualized === false) {
    const View = props.viewComponent ?? rn.View;

    return React.createElement(
      View,
      { testID: props.testID ?? "expo-numerator-phone-country-picker" },
      countries.map((country) =>
        React.cloneElement(
          renderCountryRow(country, props) ?? React.createElement(View),
          {
            key: `${country.region}-${country.countryCallingCode}`,
          },
        ),
      ),
    );
  }

  const FlatList = props.flatListComponent ?? rn.FlatList;

  return React.createElement(FlatList, {
    data: countries,
    keyExtractor: (item) => `${item.region}-${item.countryCallingCode}`,
    keyboardShouldPersistTaps: "handled",
    renderItem: (info: ListRenderItemInfo<PhoneCountryMeta>) =>
      renderCountryRow(info.item, props),
    testID: props.testID ?? "expo-numerator-phone-country-picker",
  });
}

function renderCountryRow(
  country: PhoneCountryMeta,
  props: PhoneCountryPickerProps,
): React.ReactElement | null {
  const selected = props.selectedRegion === country.region;

  if (props.renderCountry) {
    return props.renderCountry({ country, selected });
  }

  const rn = getReactNativeComponents();
  const Pressable = props.pressableComponent ?? rn.Pressable;
  const Text = props.textComponent ?? rn.Text;
  const View = props.viewComponent ?? rn.View;
  const flag =
    props.showEmojiFlag === true ? `${getEmojiFlag(country.region)} ` : "";

  return React.createElement(
    Pressable,
    {
      accessibilityRole: "button",
      accessibilityState: { selected },
      onPress: () => props.onCountryChange?.(country),
      testID: `expo-numerator-phone-country-${country.region}`,
    },
    React.createElement(
      View,
      null,
      React.createElement(
        Text,
        null,
        `${flag}${country.localizedName} +${country.countryCallingCode}`,
      ),
    ),
  );
}

function filterCountries(
  countries: readonly PhoneCountryMeta[],
  query?: string,
): PhoneCountryMeta[] {
  const normalizedQuery = query?.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return [...countries];
  }

  return countries.filter((country) => {
    const haystack = [
      country.region,
      country.name,
      country.localizedName,
      `+${country.countryCallingCode}`,
    ]
      .join(" ")
      .toLocaleLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

function getReactNativeComponents() {
  if (cachedReactNative === null) {
    cachedReactNative = require("react-native") as {
      FlatList: FlatListComponent;
      Pressable: PressableComponent;
      Text: TextComponent;
      View: ViewComponent;
    };
  }

  return cachedReactNative;
}

function getEmojiFlag(region: PhoneRegionCode): string {
  if (!/^[A-Z]{2}$/.test(region)) {
    return "";
  }

  return Array.from(region)
    .map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65)
    .map((codePoint) => String.fromCodePoint(codePoint))
    .join("");
}
