import {
  generatedPhoneCallingCodeIndex,
  generatedPhoneCountries,
  generatedPhoneMetadataInfo,
  generatedPhoneMetadataProfiles,
} from "./generatedPhoneMetadata";
import type {
  GeneratedPhoneCountryMeta,
  PhoneExampleType,
  PhoneCountryListOptions,
  PhoneCountryMeta,
  PhoneMetadataInfo,
  PhoneMetadataProfile,
  PhoneRegionCode,
} from "./phoneTypes";
import { NumeratorError } from "../core/errors/NumeratorError";

export function getPhoneCountryMeta(
  region: PhoneRegionCode,
  options: { readonly locale?: string } = {},
): PhoneCountryMeta {
  const meta = getGeneratedPhoneCountryMeta(region);

  return toPublicCountryMeta(meta, options.locale);
}

export function getPhoneMetadataInfo(
  profile: PhoneMetadataProfile = "lite",
): PhoneMetadataInfo {
  return generatedPhoneMetadataProfiles[profile] ?? generatedPhoneMetadataInfo;
}

export function getPhoneCountries(
  options: PhoneCountryListOptions = {},
): PhoneCountryMeta[] {
  const allowedRegions =
    options.regions === undefined
      ? null
      : new Set(options.regions.map(normalizePhoneRegionCode));
  const preferredRegions =
    options.preferredRegions?.map(normalizePhoneRegionCode) ?? [];
  const preferredIndex = new Map(
    preferredRegions.map((region, index) => [region, index]),
  );

  return Object.values(generatedPhoneCountries)
    .filter(
      (meta) => options.includeNonGeographic === true || !meta.nonGeographic,
    )
    .filter(
      (meta) => allowedRegions === null || allowedRegions.has(meta.region),
    )
    .map((meta) => toPublicCountryMeta(meta, options.locale))
    .sort((left, right) => {
      const leftPreferred = preferredIndex.get(left.region);
      const rightPreferred = preferredIndex.get(right.region);

      if (leftPreferred !== undefined || rightPreferred !== undefined) {
        return (leftPreferred ?? 9999) - (rightPreferred ?? 9999);
      }

      return left.localizedName.localeCompare(right.localizedName);
    });
}

export function getCountryCallingCode(region: PhoneRegionCode): string {
  return getGeneratedPhoneCountryMeta(region).countryCallingCode;
}

export function getPhoneExampleNumber(
  region: PhoneRegionCode,
  options: { readonly type?: PhoneExampleType } = {},
): string {
  const meta = getGeneratedPhoneCountryMeta(region);
  const example = getPhoneExampleNationalNumber(meta, options.type);

  return `+${meta.countryCallingCode}${example}`;
}

export function getGeneratedPhoneCountryMeta(
  region: PhoneRegionCode,
): GeneratedPhoneCountryMeta {
  const normalized = normalizePhoneRegionCode(region);
  const exact = generatedPhoneCountries[normalized];

  if (exact !== undefined) {
    return exact;
  }

  const nonGeographic = Object.values(generatedPhoneCountries).find(
    (meta) => meta.region === normalized,
  );

  if (nonGeographic !== undefined) {
    return nonGeographic;
  }

  throw new NumeratorError("UNSUPPORTED_PHONE_REGION", { region });
}

export function getGeneratedPhoneCountriesByCallingCode(
  countryCallingCode: string,
): GeneratedPhoneCountryMeta[] {
  const regions = generatedPhoneCallingCodeIndex[countryCallingCode] ?? [];

  return regions
    .map((region) =>
      Object.values(generatedPhoneCountries).find(
        (meta) =>
          meta.region === region &&
          meta.countryCallingCode === countryCallingCode,
      ),
    )
    .filter((meta): meta is GeneratedPhoneCountryMeta => meta !== undefined);
}

export function getSupportedCallingCodes(): string[] {
  return Object.keys(generatedPhoneCallingCodeIndex).sort(
    (left, right) => right.length - left.length || left.localeCompare(right),
  );
}

export function normalizePhoneRegionCode(region: PhoneRegionCode): string {
  const normalized = region.trim().toUpperCase();

  if (!/^(?:[A-Z]{2}|001)$/.test(normalized)) {
    throw new NumeratorError("INVALID_PHONE_REGION", { region });
  }

  return normalized;
}

function toPublicCountryMeta(
  meta: GeneratedPhoneCountryMeta,
  locale?: string,
): PhoneCountryMeta {
  return {
    region: meta.region,
    name: meta.name,
    localizedName: getLocalizedRegionName(meta, locale),
    countryCallingCode: meta.countryCallingCode,
    possibleLengths: meta.possibleLengths,
    exampleNational: meta.exampleNational,
    exampleMobile: meta.mobileExample,
    exampleFixedLine: meta.typeExamples?.FIXED_LINE,
    exampleTollFree: meta.typeExamples?.TOLL_FREE,
    nonGeographic: meta.nonGeographic,
  };
}

function getPhoneExampleNationalNumber(
  meta: GeneratedPhoneCountryMeta,
  type?: PhoneExampleType,
): string {
  if (type === "fixedLine") {
    return meta.typeExamples?.FIXED_LINE ?? meta.exampleNational;
  }

  if (type === "tollFree") {
    return meta.typeExamples?.TOLL_FREE ?? meta.exampleNational;
  }

  return (
    meta.mobileExample ?? meta.typeExamples?.MOBILE ?? meta.exampleNational
  );
}

function getLocalizedRegionName(
  meta: GeneratedPhoneCountryMeta,
  locale?: string,
): string {
  if (meta.nonGeographic || meta.region === "001") {
    return meta.name;
  }

  try {
    const displayNames = new Intl.DisplayNames([locale ?? "en"], {
      type: "region",
    });

    return displayNames.of(meta.region) ?? meta.name;
  } catch {
    return meta.name;
  }
}
