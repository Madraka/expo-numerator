import type { NumeratorError } from "../core/errors/NumeratorError";

export type PhoneRegionCode = string;

export type PhoneNumberType =
  | "MOBILE"
  | "FIXED_LINE"
  | "FIXED_LINE_OR_MOBILE"
  | "TOLL_FREE"
  | "PREMIUM_RATE"
  | "SHARED_COST"
  | "VOIP"
  | "PAGER"
  | "UAN"
  | "VOICEMAIL"
  | "PERSONAL_NUMBER"
  | "UNKNOWN";

export type PhoneFormat = "e164" | "international" | "national" | "rfc3966";

export type PhoneValidationMode = "possible" | "mobile" | "strict";

export type PhoneMetadataProfile = "lite" | "mobile" | "max";

export type PhoneExampleType = "mobile" | "fixedLine" | "tollFree";

export type PhoneDefaultRegion = {
  readonly defaultRegion?: PhoneRegionCode;
};

export type PhoneParseOptions = PhoneDefaultRegion & {
  readonly validationMode?: PhoneValidationMode;
  readonly metadataProfile?: PhoneMetadataProfile;
  readonly includeNonGeographic?: boolean;
};

export type PhoneFormatOptions = {
  readonly format?: PhoneFormat;
  readonly region?: PhoneRegionCode;
  readonly metadataProfile?: PhoneMetadataProfile;
};

export type PhoneCountryListOptions = {
  readonly includeNonGeographic?: boolean;
  readonly locale?: string;
  readonly preferredRegions?: readonly PhoneRegionCode[];
  readonly regions?: readonly PhoneRegionCode[];
};

export type PhoneInputOptions = PhoneParseOptions & {
  readonly country?: PhoneRegionCode;
  readonly defaultCountry?: PhoneRegionCode;
  readonly formatWhileEditing?: boolean;
  readonly maxInputLength?: number;
  readonly value?: string | PhoneValue | null;
  readonly defaultValue?: string | PhoneValue | null;
  readonly initialValue?: string | PhoneValue | null;
};

export type PhoneInputState = {
  readonly text: string;
  readonly value: PhoneValue | null;
  readonly committedValue: PhoneValue | null;
  readonly country: PhoneRegionCode | null;
  readonly selection: PhoneTextSelection;
  readonly isValid: boolean;
  readonly isDirty: boolean;
  readonly isFocused: boolean;
  readonly error: NumeratorError | null;
};

export type PhoneTextSelection = {
  readonly start: number;
  readonly end: number;
};

export type PhoneInputSelectionEvent = {
  readonly nativeEvent: {
    readonly selection: PhoneTextSelection;
  };
};

export type PhoneInputTextInputProps = {
  readonly value: string;
  readonly selection: PhoneTextSelection;
  readonly onChangeText: (text: string) => void;
  readonly onSelectionChange: (event: PhoneInputSelectionEvent) => void;
  readonly onFocus: () => void;
  readonly onBlur: () => void;
};

export type UsePhoneInputResult = PhoneInputState & {
  readonly inputProps: PhoneInputTextInputProps;
  readonly setText: (text: string, selection?: PhoneTextSelection) => void;
  readonly setCountry: (country: PhoneRegionCode) => void;
  readonly setSelection: (selection: PhoneTextSelection) => void;
  readonly focus: () => void;
  readonly blur: () => void;
  readonly commit: () => void;
  readonly reset: (value?: string | PhoneValue | null) => void;
};

export type PhoneValue = {
  readonly kind: "phone";
  readonly e164: string;
  readonly countryCallingCode: string;
  readonly nationalNumber: string;
  readonly region?: PhoneRegionCode;
  readonly possibleRegions: readonly PhoneRegionCode[];
  readonly type?: PhoneNumberType;
  readonly isPossible: boolean;
  readonly isValid: boolean;
  readonly isMobileEligible: boolean;
};

export type PhoneCountryMeta = {
  readonly region: PhoneRegionCode;
  readonly name: string;
  readonly localizedName: string;
  readonly countryCallingCode: string;
  readonly possibleLengths: readonly number[];
  readonly exampleNational: string;
  readonly exampleMobile?: string;
  readonly exampleFixedLine?: string;
  readonly exampleTollFree?: string;
  readonly nonGeographic: boolean;
};

export type PhoneMetadataInfo = {
  readonly profile: PhoneMetadataProfile;
  readonly authority: string;
  readonly authorityUrl: string;
  readonly metadataProject: string;
  readonly metadataUrl: string;
  readonly generatedAt: string;
  readonly countryCount: number;
  readonly geographicCountryCount: number;
  readonly nonGeographicCountryCount: number;
  readonly sizeHintBytes: number;
};

export type PhoneMetadataProfileInfo = Record<
  PhoneMetadataProfile,
  PhoneMetadataInfo
>;

export type GeneratedPhoneTypePatterns = Partial<
  Record<PhoneNumberType, string>
>;

export type GeneratedPhoneTypeExamples = Partial<
  Record<PhoneNumberType, string>
>;

export type GeneratedPhoneFormatPattern = {
  readonly pattern: string;
  readonly format: string;
  readonly internationalFormat?: string;
  readonly leadingDigits?: readonly string[];
  readonly nationalPrefixFormattingRule?: string;
};

export type GeneratedPhoneCountryMeta = {
  readonly region: PhoneRegionCode;
  readonly name: string;
  readonly countryCallingCode: string;
  readonly leadingDigits?: string;
  readonly nationalPrefix?: string;
  readonly possibleLengths: readonly number[];
  readonly exampleNational: string;
  readonly mobileExample?: string;
  readonly typeExamples?: GeneratedPhoneTypeExamples;
  readonly typePatterns?: GeneratedPhoneTypePatterns;
  readonly mobilePattern?: string;
  readonly validPattern: string;
  readonly availableFormats?: readonly GeneratedPhoneFormatPattern[];
  readonly nationalGroups: readonly number[];
  readonly nationalPrefixMode:
    | "none"
    | "leading-zero"
    | "leading-eight"
    | "nanp";
  readonly nonGeographic: boolean;
  readonly mainCountryForCode?: boolean;
};
