#!/usr/bin/env node

const fs = require("node:fs");
const https = require("node:https");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const outputPath = path.join(
  repoRoot,
  "src",
  "phone",
  "generatedPhoneMetadata.ts",
);
const sourcePath = path.join(__dirname, "phone-metadata-source.json");
const LIBPHONENUMBER_METADATA_URL =
  "https://raw.githubusercontent.com/google/libphonenumber/master/resources/PhoneNumberMetadata.xml";
const ITU_E164_REFERENCE_URL = "https://www.itu.int/rec/T-REC-E.164/en";
const FALLBACK_POSSIBLE_LENGTHS = Object.freeze([
  4, 5, 6, 7, 8, 9, 10, 11, 12,
]);
const DISPLAY_GROUP_OVERRIDES = Object.freeze({
  BR: [2, 5, 4],
  DE: [3, 4, 4],
  FR: [1, 2, 2, 2, 2],
  GB: [4, 3, 3],
  IN: [5, 5],
  JP: [2, 4, 4],
  TR: [3, 3, 2, 2],
});
const PHONE_TYPE_BLOCKS = Object.freeze({
  fixedLine: "FIXED_LINE",
  mobile: "MOBILE",
  tollFree: "TOLL_FREE",
  premiumRate: "PREMIUM_RATE",
  sharedCost: "SHARED_COST",
  voip: "VOIP",
  pager: "PAGER",
  personalNumber: "PERSONAL_NUMBER",
  uan: "UAN",
  voicemail: "VOICEMAIL",
});

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  if (process.argv.includes("--refresh-source")) {
    const xml = await fetchText(LIBPHONENUMBER_METADATA_URL);
    const source = createSourceSnapshot(xml);
    fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);
  }

  const check = process.argv.includes("--check");
  const source = readSourceSnapshot();
  const output = renderMetadata(source.countries, source);

  if (check) {
    const current = fs.existsSync(outputPath)
      ? fs.readFileSync(outputPath, "utf8")
      : "";

    if (current !== output) {
      console.error(
        "Generated phone metadata is stale. Run `npm run generate:phone-metadata`.",
      );
      process.exit(1);
    }

    return;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}

function readSourceSnapshot() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(
      "Missing phone metadata source. Run `node scripts/generate-phone-metadata.js --refresh-source`.",
    );
  }

  return JSON.parse(fs.readFileSync(sourcePath, "utf8"));
}

function createSourceSnapshot(xml) {
  const countries = fillSharedCallingCodeFormats(
    extractTerritories(xml).map(toSourceCountry),
  );

  return {
    generatedAt: new Date().toISOString(),
    source: {
      authority: "ITU-T E.164 numbering plan",
      authorityUrl: ITU_E164_REFERENCE_URL,
      metadataUrl: LIBPHONENUMBER_METADATA_URL,
      metadataProject: "Google libphonenumber PhoneNumberMetadata.xml",
    },
    countries,
  };
}

function fillSharedCallingCodeFormats(countries) {
  const nanpFormats =
    countries.find((country) => country.region === "US")?.availableFormats ??
    [];

  return countries.map((country) => {
    if (
      country.countryCallingCode === "1" &&
      country.availableFormats.length === 0 &&
      nanpFormats.length > 0
    ) {
      return {
        ...country,
        availableFormats: nanpFormats,
      };
    }

    return country;
  });
}

function extractTerritories(xml) {
  const territories = [];
  const territoryPattern = /<territory\s+([^>]+)>([\s\S]*?)<\/territory>/g;
  let match;

  while ((match = territoryPattern.exec(xml)) !== null) {
    const attrs = parseAttributes(match[1]);

    if (!attrs.id || !attrs.countryCode) {
      continue;
    }

    const body = match[2];
    const general = extractPhoneBlock(body, "generalDesc");
    const typedBlocks = Object.fromEntries(
      Object.keys(PHONE_TYPE_BLOCKS).map((tagName) => [
        tagName,
        extractPhoneBlock(body, tagName),
      ]),
    );
    const mobile = typedBlocks.mobile;

    territories.push({
      region: attrs.id,
      countryCallingCode: attrs.countryCode,
      leadingDigits: attrs.leadingDigits,
      mainCountryForCode: attrs.mainCountryForCode === "true",
      nationalPrefix: attrs.nationalPrefix,
      general,
      mobile,
      typedBlocks,
      availableFormats: extractAvailableFormats(body),
    });
  }

  return territories;
}

function extractAvailableFormats(territoryBody) {
  const formatsBlock = /<availableFormats>([\s\S]*?)<\/availableFormats>/.exec(
    territoryBody,
  );

  if (!formatsBlock) {
    return [];
  }

  const formats = [];
  const pattern = /<numberFormat\s+([^>]+)>([\s\S]*?)<\/numberFormat>/g;
  let match;

  while ((match = pattern.exec(formatsBlock[1])) !== null) {
    const attrs = parseAttributes(match[1]);
    const body = match[2];
    const formatMatch = /<format>([\s\S]*?)<\/format>/.exec(body);
    const internationalFormatMatch = /<intlFormat>([\s\S]*?)<\/intlFormat>/.exec(
      body,
    );
    const leadingDigits = [...body.matchAll(/<leadingDigits>([\s\S]*?)<\/leadingDigits>/g)]
      .map((leadingMatch) => normalizePatternText(leadingMatch[1]))
      .filter(Boolean);

    if (!attrs.pattern || !formatMatch) {
      continue;
    }

    formats.push({
      pattern: normalizePatternText(attrs.pattern),
      format: normalizeFormatText(formatMatch[1]),
      internationalFormat: internationalFormatMatch
        ? normalizeFormatText(internationalFormatMatch[1])
        : undefined,
      leadingDigits: leadingDigits.length > 0 ? leadingDigits : undefined,
      nationalPrefixFormattingRule: attrs.nationalPrefixFormattingRule,
    });
  }

  return formats;
}

function parseAttributes(source) {
  const attrs = {};
  const pattern = /([A-Za-z0-9]+)="([^"]*)"/g;
  let match;

  while ((match = pattern.exec(source)) !== null) {
    attrs[match[1]] = decodeXmlEntities(match[2]);
  }

  return attrs;
}

function extractPhoneBlock(territoryBody, tagName) {
  const match = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`).exec(
    territoryBody,
  );

  if (!match) {
    return null;
  }

  const body = match[1];
  const possibleLengthsMatch = /<possibleLengths\s+([^/>]+)\/>/.exec(body);
  const exampleMatch = /<exampleNumber>([\s\S]*?)<\/exampleNumber>/.exec(body);
  const patternMatch = /<nationalNumberPattern>([\s\S]*?)<\/nationalNumberPattern>/.exec(
    body,
  );

  return {
    possibleLengths: parsePossibleLengths(
      possibleLengthsMatch ? parseAttributes(possibleLengthsMatch[1]).national : "",
    ),
    example: exampleMatch ? normalizePatternText(exampleMatch[1]) : undefined,
    pattern: patternMatch
      ? normalizePatternText(patternMatch[1])
      : undefined,
  };
}

function toSourceCountry(territory) {
  const typedBlockList = Object.values(territory.typedBlocks);
  const possibleLengths =
    territory.general?.possibleLengths.length > 0
      ? getE164PossibleLengths(
          territory.general.possibleLengths,
          territory.countryCallingCode,
        )
      : getUnionPossibleLengths(typedBlockList).length > 0
        ? getE164PossibleLengths(
            getUnionPossibleLengths(typedBlockList),
            territory.countryCallingCode,
          )
      : FALLBACK_POSSIBLE_LENGTHS.filter(
          (length) => length + territory.countryCallingCode.length <= 15,
        );
  const exampleNational =
    territory.mobile?.example ??
    territory.general?.example ??
    "1".repeat(Math.min(possibleLengths[0] ?? 8, 12));
  const mobilePattern = territory.mobile?.pattern;
  const typeExamples = getTypeExamples(territory.typedBlocks);
  const typePatterns = getTypePatterns(territory.typedBlocks);
  const validPattern =
    territory.general?.pattern ??
    `\\d{${possibleLengths.length === 1 ? possibleLengths[0] : `${Math.min(...possibleLengths)},${Math.max(...possibleLengths)}`}}`;

  return {
    region: territory.region,
    name: getEnglishRegionName(territory.region),
    countryCallingCode: territory.countryCallingCode,
    leadingDigits: territory.leadingDigits,
    nationalPrefix: territory.nationalPrefix,
    possibleLengths,
    exampleNational,
    mobileExample: territory.mobile?.example,
    typeExamples,
    typePatterns,
    mobilePattern,
    validPattern,
    availableFormats: territory.availableFormats,
    nationalGroups:
      DISPLAY_GROUP_OVERRIDES[territory.region] ??
      inferNationalGroups(exampleNational),
    nationalPrefixMode: inferNationalPrefixMode(territory),
    nonGeographic: territory.region === "001",
    mainCountryForCode: territory.mainCountryForCode,
  };
}

function getTypeExamples(typedBlocks) {
  return omitEmptyObject(
    Object.fromEntries(
      Object.entries(PHONE_TYPE_BLOCKS).map(([tagName, phoneType]) => [
        phoneType,
        typedBlocks[tagName]?.example,
      ]),
    ),
  );
}

function getTypePatterns(typedBlocks) {
  return omitEmptyObject(
    Object.fromEntries(
      Object.entries(PHONE_TYPE_BLOCKS).map(([tagName, phoneType]) => [
        phoneType,
        typedBlocks[tagName]?.pattern,
      ]),
    ),
  );
}

function omitEmptyObject(value) {
  const clean = Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined),
  );

  return Object.keys(clean).length > 0 ? clean : undefined;
}

function getE164PossibleLengths(lengths, countryCallingCode) {
  return lengths.filter((length) => length + countryCallingCode.length <= 15);
}

function getUnionPossibleLengths(blocks) {
  return [
    ...new Set(
      blocks
        .filter(Boolean)
        .flatMap((block) => block.possibleLengths),
    ),
  ].sort((left, right) => left - right);
}

function parsePossibleLengths(value) {
  if (!value || value === "NA") {
    return [];
  }

  const lengths = new Set();

  for (const token of value.split(",")) {
    const range = /^\[(\d+)-(\d+)\]$/.exec(token.trim());

    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);

      for (let length = start; length <= end; length += 1) {
        lengths.add(length);
      }
    } else if (/^\d+$/.test(token.trim())) {
      lengths.add(Number(token.trim()));
    }
  }

  return [...lengths].sort((left, right) => left - right);
}

function normalizePatternText(value) {
  return decodeXmlEntities(value)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function normalizeFormatText(value) {
  return decodeXmlEntities(value)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function inferNationalGroups(exampleNational) {
  const length = exampleNational.length;

  if (length <= 4) {
    return [length];
  }

  if (length <= 8) {
    return [Math.ceil(length / 2), Math.floor(length / 2)];
  }

  if (length === 9) {
    return [2, 3, 4];
  }

  if (length === 10) {
    return [3, 3, 4];
  }

  if (length === 11) {
    return [3, 4, 4];
  }

  return [3, 3, 3, length - 9].filter((part) => part > 0);
}

function inferNationalPrefixMode(territory) {
  if (territory.countryCallingCode === "1") {
    return "nanp";
  }

  if (territory.countryCallingCode === "7" && territory.nationalPrefix === "8") {
    return "leading-eight";
  }

  if (territory.nationalPrefix === "0") {
    return "leading-zero";
  }

  return "none";
}

function renderMetadata(countries, source) {
  const sorted = [...countries].sort((left, right) =>
    left.region === right.region
      ? left.countryCallingCode.localeCompare(right.countryCallingCode)
      : left.region.localeCompare(right.region),
  );
  const callingCodeIndex = sorted.reduce((index, country) => {
    index[country.countryCallingCode] ??= [];

    if (!index[country.countryCallingCode].includes(country.region)) {
      index[country.countryCallingCode].push(country.region);
    }

    return index;
  }, {});

  const countryEntries = sorted
    .map(
      (countryMeta) =>
        `  ${JSON.stringify(getCountryKey(countryMeta))}: Object.freeze(${renderObject(countryMeta)})`,
    )
    .join(",\n");
  const codeEntries = Object.entries(callingCodeIndex)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(
      ([code, regions]) =>
        `  ${JSON.stringify(code)}: Object.freeze(${JSON.stringify(regions)})`,
    )
    .join(",\n");
  const metadataProfiles = createMetadataProfiles(sorted, source, countryEntries);

  return `/* eslint-disable */\n// Generated by scripts/generate-phone-metadata.js. Do not edit by hand.\n// Source authority: ${source.source.authority} (${source.source.authorityUrl}).\n// Source metadata: ${source.source.metadataProject} (${source.source.metadataUrl}).\n\nimport type { GeneratedPhoneCountryMeta, PhoneMetadataInfo, PhoneMetadataProfileInfo } from "./phoneTypes";\n\nexport const generatedPhoneMetadataProfiles: PhoneMetadataProfileInfo = Object.freeze(${renderProfileInfoObject(metadataProfiles)});\n\nexport const generatedPhoneMetadataInfo: PhoneMetadataInfo = generatedPhoneMetadataProfiles.lite;\n\nexport const generatedPhoneCountries: Record<string, GeneratedPhoneCountryMeta> = Object.freeze({\n${countryEntries},\n});\n\nexport const generatedPhoneCallingCodeIndex: Record<string, readonly string[]> = Object.freeze({\n${codeEntries},\n});\n`;
}

function createMetadataProfiles(sorted, source, renderedCountries) {
  const base = {
    authority: source.source.authority,
    authorityUrl: source.source.authorityUrl,
    metadataProject: source.source.metadataProject,
    metadataUrl: source.source.metadataUrl,
    generatedAt: source.generatedAt,
    countryCount: sorted.length,
    geographicCountryCount: sorted.filter((country) => !country.nonGeographic)
      .length,
    nonGeographicCountryCount: sorted.filter((country) => country.nonGeographic)
      .length,
  };
  const liteSize = estimateProfileSize(
    sorted.map((country) => ({
      region: country.region,
      countryCallingCode: country.countryCallingCode,
      possibleLengths: country.possibleLengths,
      exampleNational: country.exampleNational,
      nationalGroups: country.nationalGroups,
    })),
  );
  const mobileSize = estimateProfileSize(
    sorted.map((country) => ({
      region: country.region,
      countryCallingCode: country.countryCallingCode,
      possibleLengths: country.possibleLengths,
      mobilePattern: country.mobilePattern,
      validPattern: country.validPattern,
    })),
  );
  const maxSize = Buffer.byteLength(renderedCountries, "utf8");

  return {
    lite: { profile: "lite", ...base, sizeHintBytes: liteSize },
    mobile: { profile: "mobile", ...base, sizeHintBytes: mobileSize },
    max: { profile: "max", ...base, sizeHintBytes: maxSize },
  };
}

function estimateProfileSize(value) {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

function renderProfileInfoObject(profiles) {
  return `{ lite: Object.freeze(${renderObject(profiles.lite)}), mobile: Object.freeze(${renderObject(profiles.mobile)}), max: Object.freeze(${renderObject(profiles.max)}) }`;
}

function getCountryKey(countryMeta) {
  if (countryMeta.region === "001") {
    return `001-${countryMeta.countryCallingCode}`;
  }

  return countryMeta.region;
}

function renderObject(value) {
  const fields = Object.entries(value)
    .filter(([, fieldValue]) => fieldValue !== undefined)
    .map(([key, fieldValue]) => `${key}: ${JSON.stringify(fieldValue)}`)
    .join(", ");

  return `{ ${fields} }`;
}

function getEnglishRegionName(region) {
  if (region === "001") {
    return "Non-geographic";
  }

  try {
    return (
      new Intl.DisplayNames(["en"], { type: "region" }).of(region) ?? region
    );
  } catch {
    return region;
  }
}

function decodeXmlEntities(value) {
  return value
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch ${url}: ${response.statusCode}`));
          response.resume();
          return;
        }

        response.setEncoding("utf8");
        let body = "";
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => resolve(body));
      })
      .on("error", reject);
  });
}
