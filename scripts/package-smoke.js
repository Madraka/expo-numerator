#!/usr/bin/env node

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");

function main() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "expo-numerator-smoke-"));

  try {
    const tarball = pack(tempRoot);
    const appRoot = path.join(tempRoot, "app");
    fs.mkdirSync(appRoot);
    execFileSync("npm", ["init", "-y"], { cwd: appRoot, stdio: "ignore" });
    execFileSync(
      "npm",
      [
        "install",
        "--silent",
        "--no-audit",
        "--no-fund",
        "--legacy-peer-deps",
        "--omit=optional",
        tarball,
      ],
      {
        cwd: appRoot,
        stdio: "inherit",
      },
    );
    linkPeer(appRoot, "react");

    smokeEsm(appRoot);
    smokeCjs(appRoot);
    smokeSubpaths(appRoot);
    smokeBlockedInternals(appRoot);
    smokePackageMetadata(appRoot);
    smokePackageContents(appRoot);
    console.log("Package smoke passed.");
  } finally {
    fs.rmSync(tempRoot, { force: true, recursive: true });
  }
}

function linkPeer(appRoot, packageName) {
  const source = path.join(repoRoot, "node_modules", packageName);
  const target = path.join(appRoot, "node_modules", packageName);

  if (!fs.existsSync(source) || fs.existsSync(target)) {
    return;
  }

  fs.symlinkSync(source, target, "dir");
}

function pack(tempRoot) {
  const output = execFileSync("npm", ["pack", "--silent"], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
  const tarball = path.join(repoRoot, output.split(/\r?\n/).pop());
  const target = path.join(tempRoot, path.basename(tarball));

  fs.renameSync(tarball, target);
  return target;
}

function smokeEsm(appRoot) {
  execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      "import { IntegerInput, MoneyInput, PercentInput, PhoneInput, PhoneOtpInput, UnitInput, addDecimal, allocateMinorUnits, allocateMoney, commitNumberInputState, convertUnit, convertUnitForLocale, convertUnitToBestFit, createIntegerInputOptions, createMoneyInputOptions, createNumberInputState, createNumerator, createPercentInputOptions, createPhoneVerificationCheckRequest, createPhoneVerificationResendRequest, divideDecimal, formatNumber, formatNumberToParts, formatPhone, formatUnit, formatUnitBestFit, formatUnitForLocale, getPhoneMetadataInfo, getUnitSystemForLocale, money, multiplyDecimal, parseNumber, parsePhone, parseUnit, safeParseNumber, subtractDecimal, unit } from 'expo-numerator'; const n = createNumerator({ locale: 'tr-TR' }); if (n.money.format('1234.56', 'TRY') !== '₺1.234,56') throw new Error('esm facade money failed'); if (n.input.money('TRY').locale !== 'tr-TR') throw new Error('esm facade input failed'); if (n.phone.parse('05012345678').e164 !== '+905012345678') throw new Error('esm facade phone failed'); if (getPhoneMetadataInfo().countryCount < 240 || n.phone.metadata().countryCount < 240 || getPhoneMetadataInfo('max').sizeHintBytes <= getPhoneMetadataInfo('mobile').sizeHintBytes) throw new Error('esm phone metadata failed'); if (typeof MoneyInput !== 'object' || typeof PercentInput !== 'object' || typeof IntegerInput !== 'object' || typeof UnitInput !== 'object' || typeof PhoneInput !== 'object' || typeof PhoneOtpInput !== 'object') throw new Error('esm ready input components failed'); if (typeof createPhoneVerificationCheckRequest !== 'function' || typeof createPhoneVerificationResendRequest !== 'function') throw new Error('esm phone verification contracts failed'); if (parsePhone('+905012345678').region !== 'TR') throw new Error('esm phone parse failed'); if (formatPhone('+905012345678', { format: 'rfc3966' }) !== 'tel:+905012345678') throw new Error('esm phone format failed'); if (addDecimal('1.20', '2.3').value !== '3.50') throw new Error('esm add failed'); if (subtractDecimal('1.20', '2.30').value !== '-1.10') throw new Error('esm subtract failed'); if (multiplyDecimal('12.30', '3.0').value !== '36.900') throw new Error('esm multiply failed'); if (divideDecimal('2', '3', { scale: 2 }).value !== '0.67') throw new Error('esm divide failed'); if (allocateMinorUnits(10n, [1, 1, 1]).join('|') !== '4|3|3') throw new Error('esm allocation failed'); if (allocateMoney(money('0.10', 'USD'), [1, 1, 1]).map((share) => share.amount).join('|') !== '0.04|0.03|0.03') throw new Error('esm money allocation failed'); if (formatNumber('1234.56', { locale: 'tr-TR' }) !== '1.234,56') throw new Error('esm format failed'); if (formatNumber('12345', { notation: 'engineering' }) !== '12.345E3') throw new Error('esm engineering failed'); if (formatNumber('1234', { notation: 'compact' }) !== '1.2K') throw new Error('esm compact failed'); if (createMoneyInputOptions('JPY').allowDecimal !== false) throw new Error('esm money input profile failed'); if (createPercentInputOptions().mode !== 'percent') throw new Error('esm percent input profile failed'); if (createIntegerInputOptions().allowDecimal !== false) throw new Error('esm integer input profile failed'); if (formatUnit(unit('1', 'km')) !== '1 km') throw new Error('esm unit failed'); if (formatUnitForLocale(unit('1', 'bar'), { locale: 'en-US', scale: 4 }) !== '14.5038 psi') throw new Error('esm locale unit format failed'); if (formatUnitBestFit(unit('1500', 'meter'), { scale: 1 }) !== '1.5 km') throw new Error('esm best-fit format failed'); if (convertUnitToBestFit(unit('1536', 'byte'), { scale: 2 }).unit !== 'kilobyte') throw new Error('esm best-fit conversion failed'); if (convertUnit(unit('1', 'km'), 'meter', { scale: 0 }).value !== '1000') throw new Error('esm unit conversion failed'); if (convertUnit(unit('1', 'gallon'), 'cup', { scale: 2 }).value !== '16.00') throw new Error('esm volume conversion failed'); if (convertUnit(unit('90', 'degree'), 'radian', { scale: 6 }).value !== '1.570796') throw new Error('esm angle conversion failed'); if (getUnitSystemForLocale('en-US') !== 'us') throw new Error('esm unit system failed'); if (convertUnitForLocale(unit('1', 'bar'), { locale: 'en-US', scale: 4 }).unit !== 'psi') throw new Error('esm locale unit conversion failed'); if (formatNumberToParts('1.2').length !== 3) throw new Error('esm parts failed'); if (parseNumber('1.234,56', { locale: 'tr-TR' }).value !== '1234.56') throw new Error('esm parse failed'); if (parseUnit('1 kt').unit !== 'knot') throw new Error('esm knot alias failed'); if (parseUnit('1 kN').unit !== 'kilonewton') throw new Error('esm kilonewton alias failed'); if (parseUnit('1 km').unit !== 'kilometer') throw new Error('esm unit parse failed'); if (!safeParseNumber('1.234,56', { locale: 'tr-TR' }).ok) throw new Error('esm safe parse failed'); if (commitNumberInputState(createNumberInputState({ defaultValue: '1' })).isDirty) throw new Error('esm input commit failed');",
    ],
    { cwd: appRoot, stdio: "inherit" },
  );
}

function smokeCjs(appRoot) {
  execFileSync(
    process.execPath,
    [
      "--eval",
      "const { IntegerInput, MoneyInput, PercentInput, PhoneInput, PhoneOtpInput, UnitInput, allocateMinorUnits, allocateMoney, canConvertUnit, createIntegerInputOptions, createMoneyInputOptions, createNumberInputState, createNumerator, createPercentInputOptions, createPhoneInputState, createPhoneVerificationCheckRequest, createPhoneVerificationResendRequest, createUnitInputOptions, formatMoney, formatNumber, formatPhone, fromMinorUnits, getCurrencyMeta, getPhoneCountries, getPhoneMetadataInfo, getPreferredUnitForDimension, getRegisteredCurrencyCodes, getRegisteredUnitCodes, money, parsePhone, resetNumberInputState, safeParseMoney, safeParsePhone, safeParseUnit, toMinorUnits } = require('expo-numerator'); const n = createNumerator({ locale: 'tr-TR' }); if (n.money.format('1234.56', 'TRY') !== '₺1.234,56') throw new Error('cjs facade money failed'); if (n.input.money('TRY').locale !== 'tr-TR') throw new Error('cjs facade input failed'); if (n.phone.parse('05012345678').e164 !== '+905012345678') throw new Error('cjs facade phone failed'); if (getPhoneMetadataInfo().countryCount < 240 || n.phone.metadata().countryCount < 240) throw new Error('cjs phone metadata failed'); if (typeof MoneyInput !== 'object' || typeof PercentInput !== 'object' || typeof IntegerInput !== 'object' || typeof UnitInput !== 'object' || typeof PhoneInput !== 'object' || typeof PhoneOtpInput !== 'object') throw new Error('cjs ready input components failed'); if (typeof createPhoneVerificationCheckRequest !== 'function' || typeof createPhoneVerificationResendRequest !== 'function') throw new Error('cjs phone verification contracts failed'); if (parsePhone('+905012345678').region !== 'TR') throw new Error('cjs phone parse failed'); if (formatPhone('+905012345678', { format: 'e164' }) !== '+905012345678') throw new Error('cjs phone format failed'); if (!safeParsePhone('05012345678', { defaultRegion: 'TR' }).ok) throw new Error('cjs safe phone failed'); if (createPhoneInputState({ defaultRegion: 'TR' }).isValid !== true) throw new Error('cjs phone input state failed'); if (getPhoneCountries({ preferredRegions: ['TR'] })[0].region !== 'TR') throw new Error('cjs phone countries failed'); if (formatMoney(money('1', 'USD')) !== '$1.00') throw new Error('cjs failed'); if (toMinorUnits('1.23', 'USD') !== 123n) throw new Error('cjs to minor failed'); if (fromMinorUnits(123n, 'USD').amount !== '1.23') throw new Error('cjs from minor failed'); if (allocateMinorUnits(10n, [1, 1, 1]).join('|') !== '4|3|3') throw new Error('cjs allocation failed'); if (allocateMoney(money('0.10', 'USD'), [1, 1, 1]).map((share) => share.amount).join('|') !== '0.04|0.03|0.03') throw new Error('cjs money allocation failed'); if (getRegisteredCurrencyCodes().length < 150) throw new Error('cjs currency registry failed'); if (getCurrencyMeta('OMR').minorUnit !== 3) throw new Error('cjs three-minor currency failed'); if (money('1.2345', 'UYW').minor !== 12345n) throw new Error('cjs four-minor currency failed'); if (createMoneyInputOptions('KWD').maximumFractionDigits !== 3) throw new Error('cjs money input profile failed'); if (createPercentInputOptions().mode !== 'percent') throw new Error('cjs percent input profile failed'); if (createIntegerInputOptions().allowDecimal !== false) throw new Error('cjs integer input profile failed'); if (formatNumber('12345', { notation: 'scientific' }) !== '1.2345E4') throw new Error('cjs scientific failed'); if (formatNumber('1200000', { locale: 'tr-TR', notation: 'compact' }) !== '1,2 Mn') throw new Error('cjs compact failed'); if (!getRegisteredUnitCodes().includes('kilowatt-hour')) throw new Error('cjs unit registry failed'); if (!getRegisteredUnitCodes().includes('newton-meter')) throw new Error('cjs expanded unit registry failed'); if (!canConvertUnit('kilowatt-hour', 'joule')) throw new Error('cjs unit conversion failed'); if (!canConvertUnit('newton-meter', 'pound-foot')) throw new Error('cjs torque conversion failed'); if (getPreferredUnitForDimension('pressure', { locale: 'en-US' }) !== 'psi') throw new Error('cjs unit preference failed'); if (createUnitInputOptions('m²').unit !== 'square-meter') throw new Error('cjs unit input options failed'); if (!safeParseUnit('1 m²').ok) throw new Error('cjs safe unit parse failed'); if (resetNumberInputState(createNumberInputState({ defaultValue: '1' })).text !== '1') throw new Error('cjs input reset failed'); if (!safeParseMoney('$1.00', { currency: 'USD' }).ok) throw new Error('cjs safe parse failed');",
    ],
    { cwd: appRoot, stdio: "inherit" },
  );
}

function smokeBlockedInternals(appRoot) {
  execFileSync(
    process.execPath,
    [
      "--eval",
      "for (const specifier of ['expo-numerator/money/currencyRegistry', 'expo-numerator/src/index.ts']) { let blocked = false; try { require(specifier); } catch (error) { blocked = error && error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED'; } if (!blocked) throw new Error(`unexported package path resolved: ${specifier}`); }",
    ],
    { cwd: appRoot, stdio: "inherit" },
  );
}

function smokeSubpaths(appRoot) {
  execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      "import { decimal, addDecimal } from 'expo-numerator/core'; import { money, toMinorUnits } from 'expo-numerator/money'; import { roundDecimal } from 'expo-numerator/rounding'; import { resolveLocale } from 'expo-numerator/locale'; import { formatMoney } from 'expo-numerator/format'; import { parseMoney } from 'expo-numerator/parse'; import { convertUnit, getUnitSystemForLocale } from 'expo-numerator/unit'; import { parsePhone } from 'expo-numerator/phone'; import { MoneyInput, createMoneyInputOptions } from 'expo-numerator/input'; import { createExpoNumerator } from 'expo-numerator/expo'; if (decimal('1').value !== '1') throw new Error('esm core subpath failed'); if (addDecimal('1', '2').value !== '3') throw new Error('esm core arithmetic subpath failed'); if (money('1', 'USD').currency !== 'USD') throw new Error('esm money subpath failed'); if (toMinorUnits('1.23', 'USD') !== 123n) throw new Error('esm money minor subpath failed'); if (roundDecimal('1.25', { scale: 1 }).value !== '1.3') throw new Error('esm rounding subpath failed'); if (resolveLocale({ locale: 'tr' }) !== 'tr-TR') throw new Error('esm locale subpath failed'); if (formatMoney(money('1', 'USD')) !== '$1.00') throw new Error('esm format subpath failed'); if (parseMoney('$1.00', { currency: 'USD' }).amount !== '1.00') throw new Error('esm parse subpath failed'); if (convertUnit({ kind: 'unit', value: '1', unit: 'kilometer', dimension: 'length' }, 'meter', { scale: 0 }).value !== '1000') throw new Error('esm unit subpath failed'); if (getUnitSystemForLocale('en-US') !== 'us') throw new Error('esm unit locale subpath failed'); if (parsePhone('+905012345678').e164 !== '+905012345678') throw new Error('esm phone subpath failed'); if (typeof MoneyInput !== 'object' || createMoneyInputOptions('JPY').allowDecimal !== false) throw new Error('esm input subpath failed'); if (createExpoNumerator({ locale: 'tr-TR' }).locale !== 'tr-TR') throw new Error('esm expo subpath failed');",
    ],
    { cwd: appRoot, stdio: "inherit" },
  );
  execFileSync(
    process.execPath,
    [
      "--eval",
      "const { decimal, addDecimal } = require('expo-numerator/core'); const { money, toMinorUnits } = require('expo-numerator/money'); const { roundDecimal } = require('expo-numerator/rounding'); const { resolveLocale } = require('expo-numerator/locale'); const { formatMoney } = require('expo-numerator/format'); const { parseMoney } = require('expo-numerator/parse'); const { convertUnit, getUnitSystemForLocale } = require('expo-numerator/unit'); const { parsePhone } = require('expo-numerator/phone'); const { MoneyInput, createMoneyInputOptions } = require('expo-numerator/input'); const { createExpoNumerator } = require('expo-numerator/expo'); if (decimal('1').value !== '1') throw new Error('cjs core subpath failed'); if (addDecimal('1', '2').value !== '3') throw new Error('cjs core arithmetic subpath failed'); if (money('1', 'USD').currency !== 'USD') throw new Error('cjs money subpath failed'); if (toMinorUnits('1.23', 'USD') !== 123n) throw new Error('cjs money minor subpath failed'); if (roundDecimal('1.25', { scale: 1 }).value !== '1.3') throw new Error('cjs rounding subpath failed'); if (resolveLocale({ locale: 'tr' }) !== 'tr-TR') throw new Error('cjs locale subpath failed'); if (formatMoney(money('1', 'USD')) !== '$1.00') throw new Error('cjs format subpath failed'); if (parseMoney('$1.00', { currency: 'USD' }).amount !== '1.00') throw new Error('cjs parse subpath failed'); if (convertUnit({ kind: 'unit', value: '1', unit: 'kilometer', dimension: 'length' }, 'meter', { scale: 0 }).value !== '1000') throw new Error('cjs unit subpath failed'); if (getUnitSystemForLocale('en-US') !== 'us') throw new Error('cjs unit locale subpath failed'); if (parsePhone('+905012345678').e164 !== '+905012345678') throw new Error('cjs phone subpath failed'); if (typeof MoneyInput !== 'object' || createMoneyInputOptions('JPY').allowDecimal !== false) throw new Error('cjs input subpath failed'); if (createExpoNumerator({ locale: 'tr-TR' }).locale !== 'tr-TR') throw new Error('cjs expo subpath failed');",
    ],
    { cwd: appRoot, stdio: "inherit" },
  );
}

function smokePackageMetadata(appRoot) {
  execFileSync(
    process.execPath,
    [
      "--eval",
      "const pkg = require('expo-numerator/package.json'); if (pkg.name !== 'expo-numerator') throw new Error('package metadata failed'); if (!pkg.homepage || pkg.homepage.startsWith('https://github.com')) throw new Error('homepage must point at package docs, not GitHub'); if (pkg.sideEffects !== false) throw new Error('sideEffects metadata failed');",
    ],
    { cwd: appRoot, stdio: "inherit" },
  );
}

function smokePackageContents(appRoot) {
  execFileSync(
    process.execPath,
    [
      "--eval",
      "const fs = require('node:fs'); const path = require('node:path'); const root = path.dirname(require.resolve('expo-numerator/package.json')); for (const file of ['build/index.d.ts','build/esm/index.mjs','build/cjs/index.cjs','build/money/index.d.ts','build/esm/money/index.mjs','build/cjs/money/index.cjs','build/phone/index.d.ts','build/esm/phone/index.mjs','build/cjs/phone/index.cjs','build/input/index.d.ts','build/esm/input/index.mjs','build/cjs/input/index.cjs','docs/CURRENCY_REGISTRY.md','docs/ERROR_CONTRACT.md','docs/INPUT_ACCEPTANCE.md','docs/ROADMAP.md','README.md','CHANGELOG.md','LICENSE']) { if (!fs.existsSync(path.join(root, file))) throw new Error(`missing packed file: ${file}`); } if (fs.existsSync(path.join(root, 'src/__tests__'))) throw new Error('tests must not be packed'); if (fs.existsSync(path.join(root, 'docs/private'))) throw new Error('private docs must not be packed'); if (fs.existsSync(path.join(root, 'docs/PHASE_PLAN.md'))) throw new Error('private phase plan must not be packed');",
    ],
    { cwd: appRoot, stdio: "inherit" },
  );
}

main();
