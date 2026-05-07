#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const repoRoot = path.resolve(__dirname, "..");
const cjsEntry = path.join(repoRoot, "build/cjs/index.cjs");
const esmEntry = path.join(repoRoot, "build/esm/index.mjs");
const declarationsEntry = path.join(repoRoot, "build/index.d.ts");

const requiredRuntimeExports = [
  "DEFAULT_LOCALE",
  "DEFAULT_MAX_DECIMAL_INPUT_LENGTH",
  "DEFAULT_ROUNDING_MODE",
  "IntegerInput",
  "MoneyInput",
  "NumberInput",
  "NumeratorError",
  "NumeratorProvider",
  "PercentInput",
  "UnitInput",
  "addDecimal",
  "allocateMinorUnits",
  "allocateMoney",
  "applyNumberInputEdit",
  "applyNumberInputNativeTextChange",
  "applyNumberInputText",
  "canConvertUnit",
  "commitNumberInputState",
  "compareDecimal",
  "convertUnit",
  "convertUnitForLocale",
  "convertUnitToBestFit",
  "createExpoNumerator",
  "createIntegerInputOptions",
  "createMoneyInputOptions",
  "createNumerator",
  "createNumberInputState",
  "createPercentInputOptions",
  "createUnitInputOptions",
  "decimal",
  "digitMaps",
  "divideDecimal",
  "focusNumberInputState",
  "format",
  "formatMoney",
  "formatNumber",
  "formatNumberInputOnBlur",
  "formatNumberToParts",
  "formatPercent",
  "formatUnit",
  "formatUnitBestFit",
  "formatUnitForLocale",
  "fromMinorUnits",
  "getCurrencyMeta",
  "getExpoLocalizationInfo",
  "getLocaleSymbols",
  "getNativeNumberSeparators",
  "getNativePlatformInfo",
  "getNativePreferredLocale",
  "getPreferredUnitForDimension",
  "getPreferredUnitForValue",
  "getRegisteredCurrencies",
  "getRegisteredCurrencyCodes",
  "getRegisteredLocaleCodes",
  "getRegisteredLocaleSymbols",
  "getRegisteredUnitCodes",
  "getRegisteredUnits",
  "getUnitAliases",
  "getUnitBestFitCandidates",
  "getUnitLabels",
  "getUnitMeta",
  "getUnitSystemForLocale",
  "getUnitsByDimension",
  "hasScale",
  "initialLocaleSymbols",
  "isCurrencyCode",
  "isDecimal",
  "isMoney",
  "isNumericValue",
  "isPercent",
  "isUnit",
  "isUnitCode",
  "isWithinRange",
  "money",
  "multiplyDecimal",
  "normalizeDecimal",
  "normalizeDigits",
  "normalizeUnitCode",
  "parse",
  "parseMoney",
  "parseNumber",
  "parsePercent",
  "parseUnit",
  "percent",
  "registerCurrency",
  "registerLocaleSymbols",
  "registerUnit",
  "resetNumberInputState",
  "resolveLocale",
  "roundDecimal",
  "safeDecimal",
  "safeMoney",
  "safeParse",
  "safeParseMoney",
  "safeParseNumber",
  "safeParsePercent",
  "safeParseUnit",
  "safePercent",
  "safeUnit",
  "sanitizeNumberInputText",
  "scaleDecimal",
  "setNumberInputSelection",
  "subtractDecimal",
  "toMinorUnits",
  "toggleNumberInputSign",
  "unit",
  "useNumberInput",
  "useNumerator",
  "validateGrouping",
];

const requiredTypeExports = [
  "BaseFormatOptions",
  "BaseParseOptions",
  "AllocateMoneyOptions",
  "AllocationRatio",
  "CreateExpoNumeratorOptions",
  "CreateNumeratorOptions",
  "CurrencyCode",
  "CurrencyMeta",
  "CurrencyPattern",
  "CurrencyRegistration",
  "DecimalInput",
  "DecimalNormalizationOptions",
  "DecimalValue",
  "DivideDecimalOptions",
  "ExpoLocalizationInfo",
  "ExpoNumerator",
  "FormatOptions",
  "GroupingStrategy",
  "IntegerInputOptions",
  "IntegerInputProps",
  "LocaleSymbols",
  "LocaleSymbolsRegistration",
  "MoneyFormatOptions",
  "MoneyInputEntryMode",
  "MoneyInputOptions",
  "MoneyInputProps",
  "MoneyParseOptions",
  "MoneyValue",
  "MinorUnitScalePolicy",
  "NormalizeDigitsOptions",
  "NumberFormatOptions",
  "NumberFormatPart",
  "NumberFormatPartType",
  "NumberInputCaretBehavior",
  "NumberInputEdit",
  "NumberInputEntryStrategy",
  "NumberInputExternalValue",
  "NumberInputMode",
  "NumberInputOptions",
  "NumberInputProps",
  "NumberInputSelectionEvent",
  "NumberInputState",
  "NumberInputTextInputProps",
  "NumberNotation",
  "NumberParseOptions",
  "NumberingSystem",
  "NumericValue",
  "NumeratorErrorCode",
  "NumeratorFacade",
  "NumeratorFailure",
  "NumeratorProviderProps",
  "NumeratorResult",
  "NumeratorSuccess",
  "ParseMode",
  "PercentFormatOptions",
  "PercentInputOptions",
  "PercentInputProps",
  "PercentParseOptions",
  "PercentPattern",
  "PercentValue",
  "ResolveLocaleOptions",
  "RoundDecimalOptions",
  "RoundingMode",
  "TextSelection",
  "ToMinorUnitsOptions",
  "UnifiedParseOptions",
  "UnitBestFitFormatOptions",
  "UnitBestFitOptions",
  "UnitConversionOptions",
  "UnitDimension",
  "UnitDisplay",
  "UnitFormatOptions",
  "UnitInputOptions",
  "UnitInputProps",
  "UnitLabels",
  "UnitLocaleConversionOptions",
  "UnitLocaleFormatOptions",
  "UnitMeta",
  "UnitParseOptions",
  "UnitPreferenceOptions",
  "UnitRegistration",
  "UnitSystem",
  "UnitValue",
  "UseGrouping",
  "UseNumberInputResult",
  "ValidateGroupingOptions",
];

const requiredSubpathRuntimeExports = {
  core: [
    "DEFAULT_MAX_DECIMAL_INPUT_LENGTH",
    "NumeratorError",
    "addDecimal",
    "compareDecimal",
    "decimal",
    "divideDecimal",
    "hasScale",
    "isDecimal",
    "isMoney",
    "isNumericValue",
    "isPercent",
    "isUnit",
    "isWithinRange",
    "multiplyDecimal",
    "normalizeDecimal",
    "percent",
    "safeDecimal",
    "safeMoney",
    "safePercent",
    "safeUnit",
    "scaleDecimal",
    "subtractDecimal",
    "unit",
  ],
  money: [
    "allocateMinorUnits",
    "allocateMoney",
    "fromMinorUnits",
    "getCurrencyMeta",
    "getRegisteredCurrencies",
    "getRegisteredCurrencyCodes",
    "isCurrencyCode",
    "money",
    "registerCurrency",
    "toMinorUnits",
  ],
  rounding: ["DEFAULT_ROUNDING_MODE", "roundDecimal"],
  locale: [
    "DEFAULT_LOCALE",
    "digitMaps",
    "getLocaleSymbols",
    "getRegisteredLocaleCodes",
    "getRegisteredLocaleSymbols",
    "initialLocaleSymbols",
    "normalizeDigits",
    "registerLocaleSymbols",
    "resolveLocale",
    "validateGrouping",
  ],
  format: [
    "format",
    "formatMoney",
    "formatNumber",
    "formatNumberToParts",
    "formatPercent",
    "formatUnit",
    "formatUnitBestFit",
    "formatUnitForLocale",
  ],
  parse: [
    "parse",
    "parseMoney",
    "parseNumber",
    "parsePercent",
    "parseUnit",
    "safeParse",
    "safeParseMoney",
    "safeParseNumber",
    "safeParsePercent",
    "safeParseUnit",
  ],
  unit: [
    "canConvertUnit",
    "convertUnit",
    "convertUnitForLocale",
    "convertUnitToBestFit",
    "getPreferredUnitForDimension",
    "getPreferredUnitForValue",
    "getRegisteredUnitCodes",
    "getRegisteredUnits",
    "getUnitAliases",
    "getUnitBestFitCandidates",
    "getUnitLabels",
    "getUnitMeta",
    "getUnitSystemForLocale",
    "getUnitsByDimension",
    "isUnitCode",
    "normalizeUnitCode",
    "registerUnit",
  ],
  input: [
    "IntegerInput",
    "MoneyInput",
    "NumberInput",
    "PercentInput",
    "UnitInput",
    "applyNumberInputEdit",
    "applyNumberInputNativeTextChange",
    "applyNumberInputText",
    "commitNumberInputState",
    "createIntegerInputOptions",
    "createMoneyInputOptions",
    "createNumberInputState",
    "createPercentInputOptions",
    "createUnitInputOptions",
    "focusNumberInputState",
    "formatNumberInputOnBlur",
    "resetNumberInputState",
    "sanitizeNumberInputText",
    "setNumberInputSelection",
    "toggleNumberInputSign",
    "useNumberInput",
  ],
  expo: [
    "NumeratorProvider",
    "createExpoNumerator",
    "getExpoLocalizationInfo",
    "getNativeNumberSeparators",
    "getNativePlatformInfo",
    "getNativePreferredLocale",
    "useNumerator",
  ],
};

const requiredSubpathTypeExports = {
  core: [
    "DecimalInput",
    "DecimalNormalizationOptions",
    "DecimalValue",
    "DivideDecimalOptions",
    "MoneyValue",
    "NumericValue",
    "NumeratorErrorCode",
    "NumeratorFailure",
    "NumeratorResult",
    "NumeratorSuccess",
    "PercentValue",
    "UnitValue",
  ],
  money: [
    "AllocateMoneyOptions",
    "AllocationRatio",
    "CurrencyCode",
    "CurrencyMeta",
    "CurrencyRegistration",
    "MinorUnitScalePolicy",
    "ToMinorUnitsOptions",
  ],
  rounding: ["RoundDecimalOptions", "RoundingMode"],
  locale: [
    "CurrencyPattern",
    "GroupingStrategy",
    "LocaleSymbols",
    "LocaleSymbolsRegistration",
    "NormalizeDigitsOptions",
    "NumberingSystem",
    "PercentPattern",
    "ResolveLocaleOptions",
    "ValidateGroupingOptions",
  ],
  format: [
    "BaseFormatOptions",
    "FormatOptions",
    "MoneyFormatOptions",
    "NumberFormatOptions",
    "NumberFormatPart",
    "NumberFormatPartType",
    "NumberNotation",
    "PercentFormatOptions",
    "UnitBestFitFormatOptions",
    "UnitFormatOptions",
    "UnitLocaleFormatOptions",
    "UseGrouping",
  ],
  parse: [
    "BaseParseOptions",
    "MoneyParseOptions",
    "NumberParseOptions",
    "ParseMode",
    "PercentParseOptions",
    "UnifiedParseOptions",
    "UnitParseOptions",
  ],
  unit: [
    "UnitBestFitOptions",
    "UnitConversionOptions",
    "UnitDimension",
    "UnitDisplay",
    "UnitLabels",
    "UnitLocaleConversionOptions",
    "UnitMeta",
    "UnitPreferenceOptions",
    "UnitRegistration",
    "UnitSystem",
  ],
  input: [
    "IntegerInputOptions",
    "IntegerInputProps",
    "MoneyInputOptions",
    "MoneyInputEntryMode",
    "MoneyInputProps",
    "NumberInputCaretBehavior",
    "NumberInputEdit",
    "NumberInputEntryStrategy",
    "NumberInputExternalValue",
    "NumberInputMode",
    "NumberInputOptions",
    "NumberInputProps",
    "NumberInputSelectionEvent",
    "NumberInputState",
    "NumberInputTextInputProps",
    "PercentInputOptions",
    "PercentInputProps",
    "TextSelection",
    "UnitInputOptions",
    "UnitInputProps",
    "UseNumberInputResult",
  ],
  expo: [
    "CreateExpoNumeratorOptions",
    "ExpoLocalizationInfo",
    "ExpoNumerator",
    "NumeratorProviderProps",
  ],
};

const forbiddenExports = [
  "ExpoNumeratorModuleView",
  "ExpoNumeratorModuleViewProps",
];

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  for (const file of [cjsEntry, esmEntry, declarationsEntry]) {
    if (!fs.existsSync(file)) {
      console.error("Build output is missing. Run `npm run build` first.");
      process.exit(1);
    }
  }

  const cjsExports = Object.keys(require(cjsEntry));
  const esmExports = Object.keys(await import(pathToFileURL(esmEntry).href));
  const declarations = fs.readFileSync(declarationsEntry, "utf8");
  const failures = [
    ...checkRuntimeExports("CJS", cjsExports),
    ...checkRuntimeExports("ESM", esmExports),
    ...checkRuntimeParity(cjsExports, esmExports),
    ...checkTypeExports(declarations),
    ...(await checkSubpathExports()),
    ...checkPackageMetadata(),
  ];

  if (failures.length > 0) {
    console.error(`Public API check failed:\n${failures.join("\n")}`);
    process.exit(1);
  }

  console.log("Public API check passed.");
}

function checkRuntimeExports(label, exportsList) {
  const failures = [];
  const exportSet = new Set(exportsList);

  for (const expectedExport of requiredRuntimeExports) {
    if (!exportSet.has(expectedExport)) {
      failures.push(`${label} missing runtime export: ${expectedExport}`);
    }
  }

  for (const forbiddenExport of forbiddenExports) {
    if (exportSet.has(forbiddenExport)) {
      failures.push(`${label} contains forbidden export: ${forbiddenExport}`);
    }
  }

  for (const exportName of exportsList) {
    if (!requiredRuntimeExports.includes(exportName)) {
      failures.push(`${label} contains unmanifested runtime export: ${exportName}`);
    }
  }

  return failures;
}

function checkRuntimeParity(cjsExports, esmExports) {
  const failures = [];
  const cjsExportSet = new Set(cjsExports);
  const esmExportSet = new Set(esmExports);

  for (const exportName of cjsExports) {
    if (!esmExportSet.has(exportName)) {
      failures.push(`ESM missing CJS runtime export: ${exportName}`);
    }
  }

  for (const exportName of esmExports) {
    if (!cjsExportSet.has(exportName)) {
      failures.push(`CJS missing ESM runtime export: ${exportName}`);
    }
  }

  return failures;
}

async function checkSubpathExports() {
  const failures = [];

  for (const [subpath, expectedRuntimeExports] of Object.entries(
    requiredSubpathRuntimeExports,
  )) {
    const cjsFile = path.join(repoRoot, "build/cjs", subpath, "index.cjs");
    const esmFile = path.join(repoRoot, "build/esm", subpath, "index.mjs");
    const declarationsFile = path.join(repoRoot, "build", subpath, "index.d.ts");

    for (const file of [cjsFile, esmFile, declarationsFile]) {
      if (!fs.existsSync(file)) {
        failures.push(`subpath ${subpath} missing build output: ${file}`);
      }
    }

    if (failures.length > 0) {
      continue;
    }

    const cjsExports = Object.keys(require(cjsFile));
    const esmExports = Object.keys(await import(pathToFileURL(esmFile).href));
    const declarations = fs.readFileSync(declarationsFile, "utf8");

    failures.push(
      ...checkExactSubpathRuntimeExports(
        `CJS ${subpath}`,
        cjsExports,
        expectedRuntimeExports,
      ),
      ...checkExactSubpathRuntimeExports(
        `ESM ${subpath}`,
        esmExports,
        expectedRuntimeExports,
      ),
      ...checkRuntimeParity(cjsExports, esmExports),
      ...checkSubpathTypeExports(
        subpath,
        declarations,
        requiredSubpathTypeExports[subpath] ?? [],
      ),
    );
  }

  return failures;
}

function checkExactSubpathRuntimeExports(label, exportsList, expectedExports) {
  const failures = [];
  const expectedSet = new Set(expectedExports);
  const exportSet = new Set(exportsList);

  for (const expectedExport of expectedExports) {
    if (!exportSet.has(expectedExport)) {
      failures.push(`${label} missing runtime export: ${expectedExport}`);
    }
  }

  for (const exportName of exportsList) {
    if (!expectedSet.has(exportName)) {
      failures.push(`${label} contains unmanifested runtime export: ${exportName}`);
    }
  }

  return failures;
}

function checkSubpathTypeExports(subpath, declarations, expectedTypeExports) {
  const failures = [];

  for (const expectedType of expectedTypeExports) {
    if (!hasDeclarationExport(declarations, expectedType)) {
      failures.push(`${subpath} d.ts missing type export: ${expectedType}`);
    }
  }

  for (const forbiddenExport of forbiddenExports) {
    if (hasDeclarationExport(declarations, forbiddenExport)) {
      failures.push(`${subpath} d.ts contains forbidden export: ${forbiddenExport}`);
    }
  }

  return failures;
}

function checkTypeExports(declarations) {
  const failures = [];

  for (const expectedType of requiredTypeExports) {
    if (!hasDeclarationExport(declarations, expectedType)) {
      failures.push(`d.ts missing type export: ${expectedType}`);
    }
  }

  for (const forbiddenExport of forbiddenExports) {
    if (hasDeclarationExport(declarations, forbiddenExport)) {
      failures.push(`d.ts contains forbidden export: ${forbiddenExport}`);
    }
  }

  return failures;
}

function checkPackageMetadata() {
  const packageJson = require(path.join(repoRoot, "package.json"));
  const failures = [];

  if (packageJson.main !== "build/cjs/index.cjs") {
    failures.push("package.json main must point at build/cjs/index.cjs");
  }

  if (packageJson.module !== "build/esm/index.mjs") {
    failures.push("package.json module must point at build/esm/index.mjs");
  }

  if (packageJson.types !== "build/index.d.ts") {
    failures.push("package.json types must point at build/index.d.ts");
  }

  if (packageJson.exports?.["."]?.["react-native"] !== "./src/index.ts") {
    failures.push("react-native export condition must point at ./src/index.ts");
  }

  for (const subpath of Object.keys(requiredSubpathRuntimeExports)) {
    const exportKey = `./${subpath}`;
    const entry = packageJson.exports?.[exportKey];

    if (!entry) {
      failures.push(`package.json missing export map entry: ${exportKey}`);
      continue;
    }

    const expected = {
      types: `./build/${subpath}/index.d.ts`,
      "react-native": `./src/${subpath}/index.ts`,
      import: `./build/esm/${subpath}/index.mjs`,
      require: `./build/cjs/${subpath}/index.cjs`,
      default: `./build/esm/${subpath}/index.mjs`,
    };

    for (const [condition, target] of Object.entries(expected)) {
      if (entry[condition] !== target) {
        failures.push(
          `${exportKey} ${condition} condition must point at ${target}`,
        );
      }
    }
  }

  if (packageJson.sideEffects !== false) {
    failures.push("sideEffects must remain false");
  }

  return failures;
}

function hasDeclarationExport(declarations, exportName) {
  return new RegExp(`\\b${escapeRegExp(exportName)}\\b`).test(declarations);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
