#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const sourcePath = path.join(__dirname, "phone-metadata-source.json");
const generatedPath = path.join(
  repoRoot,
  "src",
  "phone",
  "generatedPhoneMetadata.ts",
);
const REQUIRED_REGIONS = [
  "AD",
  "AF",
  "BR",
  "CA",
  "DE",
  "FR",
  "GB",
  "IN",
  "JP",
  "TR",
  "US",
];
const REQUIRED_NON_GEOGRAPHIC_CODES = [
  "800",
  "808",
  "870",
  "878",
  "881",
  "882",
  "883",
  "888",
  "979",
];

function main() {
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const generated = fs.readFileSync(generatedPath, "utf8");
  const countries = Array.isArray(source.countries) ? source.countries : [];
  const failures = [
    ...checkSourceInfo(source),
    ...checkCoverage(countries),
    ...checkCountryShape(countries),
    ...checkGeneratedInfo(generated, countries),
  ];

  if (failures.length > 0) {
    console.error(`Phone metadata check failed:\n${failures.join("\n")}`);
    process.exit(1);
  }

  console.log(
    `Phone metadata check passed (${countries.length} territories, ${getCallingCodeCount(countries)} calling codes).`,
  );
}

function checkSourceInfo(source) {
  const failures = [];

  if (source.source?.authorityUrl !== "https://www.itu.int/rec/T-REC-E.164/en") {
    failures.push("source authorityUrl must reference ITU E.164");
  }

  if (
    source.source?.metadataUrl !==
    "https://raw.githubusercontent.com/google/libphonenumber/master/resources/PhoneNumberMetadata.xml"
  ) {
    failures.push("source metadataUrl must reference libphonenumber PhoneNumberMetadata.xml");
  }

  if (!/^\d{4}-\d{2}-\d{2}T/.test(source.generatedAt ?? "")) {
    failures.push("source generatedAt must be an ISO timestamp");
  }

  return failures;
}

function checkCoverage(countries) {
  const failures = [];
  const regions = new Set(countries.map((country) => country.region));
  const nonGeographicCodes = new Set(
    countries
      .filter((country) => country.nonGeographic)
      .map((country) => country.countryCallingCode),
  );

  if (countries.length < 240) {
    failures.push(`expected at least 240 phone territories, received ${countries.length}`);
  }

  if (countries.filter((country) => !country.nonGeographic).length < 230) {
    failures.push("expected at least 230 geographic phone territories");
  }

  for (const region of REQUIRED_REGIONS) {
    if (!regions.has(region)) {
      failures.push(`missing required phone region: ${region}`);
    }
  }

  for (const code of REQUIRED_NON_GEOGRAPHIC_CODES) {
    if (!nonGeographicCodes.has(code)) {
      failures.push(`missing required non-geographic calling code: ${code}`);
    }
  }

  return failures;
}

function checkCountryShape(countries) {
  const failures = [];

  for (const country of countries) {
    if (!/^(?:[A-Z]{2}|001)$/.test(country.region)) {
      failures.push(`invalid region code: ${country.region}`);
    }

    if (!/^\d{1,3}$/.test(country.countryCallingCode)) {
      failures.push(`invalid calling code for ${country.region}: ${country.countryCallingCode}`);
    }

    if (
      typeof country.exampleNational !== "string" ||
      !/^\d+$/.test(country.exampleNational)
    ) {
      failures.push(`invalid exampleNational for ${country.region}`);
    }

    if (
      country.countryCallingCode.length + country.exampleNational.length >
      15
    ) {
      failures.push(`example exceeds E.164 length for ${country.region}`);
    }

    if (
      !Array.isArray(country.possibleLengths) ||
      country.possibleLengths.length === 0
    ) {
      failures.push(`missing possibleLengths for ${country.region}`);
    }

    if (
      !country.possibleLengths.every(
        (length) =>
          Number.isInteger(length) &&
          length > 0 &&
          country.countryCallingCode.length + length <= 15,
      )
    ) {
      failures.push(`invalid possibleLengths for ${country.region}`);
    }

    if (typeof country.validPattern !== "string" || country.validPattern.length === 0) {
      failures.push(`missing validPattern for ${country.region}`);
    } else {
      try {
        new RegExp(`^(?:${country.validPattern})$`);
      } catch {
        failures.push(`invalid validPattern regex for ${country.region}`);
      }
    }

    if (country.mobilePattern !== undefined) {
      try {
        new RegExp(`^(?:${country.mobilePattern})$`);
      } catch {
        failures.push(`invalid mobilePattern regex for ${country.region}`);
      }
    }

    for (const [type, pattern] of Object.entries(country.typePatterns ?? {})) {
      try {
        new RegExp(`^(?:${pattern})$`);
      } catch {
        failures.push(`invalid ${type} type regex for ${country.region}`);
      }
    }

    for (const format of country.availableFormats ?? []) {
      if (typeof format.pattern !== "string" || format.pattern.length === 0) {
        failures.push(`invalid availableFormat pattern for ${country.region}`);
        continue;
      }

      try {
        new RegExp(`^(?:${format.pattern})$`);
      } catch {
        failures.push(`invalid availableFormat regex for ${country.region}`);
      }

      for (const leadingDigits of format.leadingDigits ?? []) {
        try {
          new RegExp(`^(?:${leadingDigits})`);
        } catch {
          failures.push(`invalid availableFormat leadingDigits for ${country.region}`);
        }
      }

      if (!/\$\d/.test(format.format)) {
        failures.push(`availableFormat missing capture replacement for ${country.region}`);
      }
    }
  }

  return failures;
}

function checkGeneratedInfo(generated, countries) {
  const failures = [];

  for (const expected of [
    "generatedPhoneMetadataInfo",
    "generatedPhoneMetadataProfiles",
    'profile: "lite"',
    'profile: "mobile"',
    'profile: "max"',
    `countryCount: ${countries.length}`,
    "Source authority: ITU-T E.164 numbering plan",
    "PhoneNumberMetadata.xml",
  ]) {
    if (!generated.includes(expected)) {
      failures.push(`generated phone metadata missing marker: ${expected}`);
    }
  }

  const profileSizes = Object.fromEntries(
    [...generated.matchAll(/profile: "(lite|mobile|max)"[\s\S]*?sizeHintBytes: (\d+)/g)].map(
      (match) => [match[1], Number(match[2])],
    ),
  );

  for (const profile of ["lite", "mobile", "max"]) {
    if (!Number.isInteger(profileSizes[profile]) || profileSizes[profile] <= 0) {
      failures.push(`generated metadata missing positive ${profile} sizeHintBytes`);
    }
  }

  if (
    profileSizes.lite !== undefined &&
    profileSizes.mobile !== undefined &&
    profileSizes.max !== undefined &&
    !(profileSizes.lite < profileSizes.mobile && profileSizes.mobile < profileSizes.max)
  ) {
    failures.push("expected metadata profile sizes to increase from lite to mobile to max");
  }

  return failures;
}

function getCallingCodeCount(countries) {
  return new Set(countries.map((country) => country.countryCallingCode)).size;
}

main();
