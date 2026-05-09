import { parsePhone } from "./parsePhone";
import { getGeneratedPhoneCountryMeta } from "./phoneRegistry";
import type {
  GeneratedPhoneCountryMeta,
  PhoneFormatOptions,
  PhoneValue,
} from "./phoneTypes";

export function formatPhone(
  value: string | PhoneValue,
  options: PhoneFormatOptions = {},
): string {
  const phoneValue =
    typeof value === "string"
      ? parsePhone(value, {
          defaultRegion: options.region,
          includeNonGeographic: true,
          metadataProfile: options.metadataProfile,
          validationMode: "possible",
        })
      : value;
  const format = options.format ?? "international";

  if (format === "e164") {
    return phoneValue.e164;
  }

  if (format === "rfc3966") {
    return `tel:${phoneValue.e164}`;
  }

  const meta = getGeneratedPhoneCountryMeta(
    options.region ??
      phoneValue.region ??
      phoneValue.possibleRegions[0] ??
      "US",
  );
  const national = formatNationalNumber(phoneValue.nationalNumber, meta);

  if (format === "national") {
    return national;
  }

  return `+${phoneValue.countryCallingCode} ${formatNationalSignificantNumber(
    phoneValue.nationalNumber,
    meta,
    "international",
  )}`;
}

export function formatNationalNumber(
  nationalNumber: string,
  meta: GeneratedPhoneCountryMeta,
): string {
  const grouped = formatNationalSignificantNumber(
    nationalNumber,
    meta,
    "national",
  );

  if (
    meta.availableFormats?.some((format) =>
      matchesAvailableFormat(nationalNumber, format),
    )
  ) {
    return grouped;
  }

  if (meta.nationalPrefixMode === "nanp" && nationalNumber.length === 10) {
    return `(${nationalNumber.slice(0, 3)}) ${nationalNumber.slice(
      3,
      6,
    )}-${nationalNumber.slice(6)}`;
  }

  if (meta.nationalPrefixMode === "leading-zero") {
    return `0${grouped}`;
  }

  if (meta.nationalPrefixMode === "leading-eight") {
    return `8 ${grouped}`;
  }

  return grouped;
}

export function formatNationalSignificantNumber(
  nationalNumber: string,
  meta: GeneratedPhoneCountryMeta,
  mode: "national" | "international" = "national",
): string {
  const availableFormat = meta.availableFormats?.find((format) =>
    matchesAvailableFormat(nationalNumber, format),
  );

  if (availableFormat !== undefined) {
    return applyAvailableFormat(nationalNumber, availableFormat, meta, mode);
  }

  return formatGroupedDigits(nationalNumber, meta.nationalGroups);
}

function matchesAvailableFormat(
  nationalNumber: string,
  availableFormat: NonNullable<
    GeneratedPhoneCountryMeta["availableFormats"]
  >[number],
): boolean {
  if (
    availableFormat.leadingDigits?.length &&
    !availableFormat.leadingDigits.some((pattern) =>
      new RegExp(`^(?:${pattern})`).test(nationalNumber),
    )
  ) {
    return false;
  }

  return new RegExp(`^(?:${availableFormat.pattern})$`).test(nationalNumber);
}

function applyAvailableFormat(
  nationalNumber: string,
  availableFormat: NonNullable<
    GeneratedPhoneCountryMeta["availableFormats"]
  >[number],
  meta: GeneratedPhoneCountryMeta,
  mode: "national" | "international",
): string {
  const pattern = new RegExp(`^(?:${availableFormat.pattern})$`);
  const match = pattern.exec(nationalNumber);
  const replacement =
    mode === "international" &&
    availableFormat.internationalFormat !== undefined &&
    availableFormat.internationalFormat !== "NA"
      ? availableFormat.internationalFormat
      : availableFormat.format;
  const formatted = nationalNumber.replace(pattern, replacement);

  if (
    mode === "international" ||
    match === null ||
    availableFormat.nationalPrefixFormattingRule === undefined
  ) {
    return formatted;
  }

  const firstGroup = match[1];
  const nationalPrefix = meta.nationalPrefix ?? "";
  const formattedFirstGroup = availableFormat.nationalPrefixFormattingRule
    .replace(/\$NP/g, nationalPrefix)
    .replace(/\$FG/g, firstGroup);

  return formatted.replace(firstGroup, formattedFirstGroup);
}

export function formatGroupedDigits(
  digits: string,
  groups: readonly number[],
): string {
  if (digits.length === 0) {
    return "";
  }

  const parts: string[] = [];
  let offset = 0;

  for (const groupLength of groups) {
    if (offset >= digits.length) {
      break;
    }

    parts.push(digits.slice(offset, offset + groupLength));
    offset += groupLength;
  }

  if (offset < digits.length) {
    parts.push(digits.slice(offset));
  }

  return parts.filter((part) => part.length > 0).join(" ");
}
