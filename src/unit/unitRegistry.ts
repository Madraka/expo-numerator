import type {
  UnitDimension,
  UnitLabels,
  UnitMeta,
  UnitRegistration,
} from "./unitMeta";
import { NumeratorError } from "../core/errors/NumeratorError";

const units = new Map<string, UnitMeta>();
const aliases = new Map<string, string>();

export const initialUnitRegistry: readonly UnitRegistration[] = Object.freeze([
  unitRegistration("meter", "length", "m", "meter", "meters", "1", ["metre"]),
  unitRegistration(
    "kilometer",
    "length",
    "km",
    "kilometer",
    "kilometers",
    "1000",
    ["kilometre"],
  ),
  unitRegistration(
    "centimeter",
    "length",
    "cm",
    "centimeter",
    "centimeters",
    "0.01",
    ["centimetre"],
  ),
  unitRegistration(
    "millimeter",
    "length",
    "mm",
    "millimeter",
    "millimeters",
    "0.001",
    ["millimetre"],
  ),
  unitRegistration(
    "micrometer",
    "length",
    "µm",
    "micrometer",
    "micrometers",
    "0.000001",
    ["um", "micrometre"],
  ),
  unitRegistration(
    "nanometer",
    "length",
    "nm",
    "nanometer",
    "nanometers",
    "0.000000001",
    ["nanometre"],
  ),
  unitRegistration(
    "decimeter",
    "length",
    "dm",
    "decimeter",
    "decimeters",
    "0.1",
    ["decimetre"],
  ),
  unitRegistration("mile", "length", "mi", "mile", "miles", "1609.344"),
  unitRegistration(
    "nautical-mile",
    "length",
    "nmi",
    "nautical mile",
    "nautical miles",
    "1852",
    ["nmile"],
  ),
  unitRegistration("foot", "length", "ft", "foot", "feet", "0.3048", ["feet"]),
  unitRegistration("inch", "length", "in", "inch", "inches", "0.0254"),
  unitRegistration("yard", "length", "yd", "yard", "yards", "0.9144"),
  unitRegistration(
    "square-meter",
    "area",
    "m²",
    "square meter",
    "square meters",
    "1",
    ["m2", "sqm", "sq m", "metrekare"],
  ),
  unitRegistration(
    "square-kilometer",
    "area",
    "km²",
    "square kilometer",
    "square kilometers",
    "1000000",
    ["km2", "sq km"],
  ),
  unitRegistration("hectare", "area", "ha", "hectare", "hectares", "10000"),
  unitRegistration("acre", "area", "ac", "acre", "acres", "4046.8564224"),
  unitRegistration(
    "square-centimeter",
    "area",
    "cm²",
    "square centimeter",
    "square centimeters",
    "0.0001",
    ["cm2", "sq cm"],
  ),
  unitRegistration(
    "square-millimeter",
    "area",
    "mm²",
    "square millimeter",
    "square millimeters",
    "0.000001",
    ["mm2", "sq mm"],
  ),
  unitRegistration(
    "square-foot",
    "area",
    "ft²",
    "square foot",
    "square feet",
    "0.09290304",
    ["ft2", "sq ft"],
  ),
  unitRegistration(
    "square-inch",
    "area",
    "in²",
    "square inch",
    "square inches",
    "0.00064516",
    ["in2", "sq in"],
  ),
  unitRegistration(
    "square-yard",
    "area",
    "yd²",
    "square yard",
    "square yards",
    "0.83612736",
    ["yd2", "sq yd"],
  ),
  unitRegistration(
    "square-mile",
    "area",
    "mi²",
    "square mile",
    "square miles",
    "2589988.110336",
    ["mi2", "sq mi"],
  ),
  unitRegistration("liter", "volume", "L", "liter", "liters", "1", [
    "litre",
    "l",
  ]),
  unitRegistration(
    "milliliter",
    "volume",
    "mL",
    "milliliter",
    "milliliters",
    "0.001",
    ["millilitre", "ml"],
  ),
  unitRegistration(
    "cubic-meter",
    "volume",
    "m³",
    "cubic meter",
    "cubic meters",
    "1000",
    ["m3", "cbm"],
  ),
  unitRegistration(
    "cubic-centimeter",
    "volume",
    "cm³",
    "cubic centimeter",
    "cubic centimeters",
    "0.001",
    ["cm3", "cc"],
  ),
  unitRegistration(
    "cubic-inch",
    "volume",
    "in³",
    "cubic inch",
    "cubic inches",
    "0.016387064",
    ["in3", "cu in"],
  ),
  unitRegistration(
    "cubic-foot",
    "volume",
    "ft³",
    "cubic foot",
    "cubic feet",
    "28.316846592",
    ["ft3", "cu ft"],
  ),
  unitRegistration(
    "gallon",
    "volume",
    "gal",
    "gallon",
    "gallons",
    "3.785411784",
  ),
  unitRegistration("quart", "volume", "qt", "quart", "quarts", "0.946352946"),
  unitRegistration("pint", "volume", "pt", "pint", "pints", "0.473176473"),
  unitRegistration("cup", "volume", "cup", "cup", "cups", "0.2365882365"),
  unitRegistration(
    "fluid-ounce",
    "volume",
    "fl oz",
    "fluid ounce",
    "fluid ounces",
    "0.0295735295625",
  ),
  unitRegistration(
    "tablespoon",
    "volume",
    "tbsp",
    "tablespoon",
    "tablespoons",
    "0.01478676478125",
  ),
  unitRegistration(
    "teaspoon",
    "volume",
    "tsp",
    "teaspoon",
    "teaspoons",
    "0.00492892159375",
  ),
  unitRegistration("gram", "mass", "g", "gram", "grams", "1"),
  unitRegistration(
    "milligram",
    "mass",
    "mg",
    "milligram",
    "milligrams",
    "0.001",
  ),
  unitRegistration("kilogram", "mass", "kg", "kilogram", "kilograms", "1000"),
  unitRegistration("tonne", "mass", "t", "tonne", "tonnes", "1000000", [
    "metric ton",
  ]),
  unitRegistration("pound", "mass", "lb", "pound", "pounds", "453.59237", [
    "lbs",
  ]),
  unitRegistration("ounce", "mass", "oz", "ounce", "ounces", "28.349523125"),
  unitRegistration("stone", "mass", "st", "stone", "stone", "6350.29318"),
  unitRegistration("second", "time", "s", "second", "seconds", "1", ["sec"]),
  unitRegistration("minute", "time", "min", "minute", "minutes", "60"),
  unitRegistration("hour", "time", "h", "hour", "hours", "3600", ["hr"]),
  unitRegistration("day", "time", "d", "day", "days", "86400"),
  unitRegistration("week", "time", "wk", "week", "weeks", "604800"),
  unitRegistration(
    "kelvin",
    "temperature",
    "K",
    "kelvin",
    "kelvins",
    "1",
    ["kelvin"],
    "-273.15",
  ),
  unitRegistration(
    "celsius",
    "temperature",
    "°C",
    "degree Celsius",
    "degrees Celsius",
    "1",
    ["c", "celsius"],
  ),
  unitRegistration(
    "fahrenheit",
    "temperature",
    "°F",
    "degree Fahrenheit",
    "degrees Fahrenheit",
    "5/9",
    ["f", "fahrenheit"],
    "-160/9",
  ),
  unitRegistration(
    "meter-per-second",
    "speed",
    "m/s",
    "meter per second",
    "meters per second",
    "1",
  ),
  unitRegistration(
    "kilometer-per-hour",
    "speed",
    "km/h",
    "kilometer per hour",
    "kilometers per hour",
    "0.27777777777777777778",
    ["kph"],
  ),
  unitRegistration(
    "mile-per-hour",
    "speed",
    "mph",
    "mile per hour",
    "miles per hour",
    "0.44704",
  ),
  unitRegistration(
    "knot",
    "speed",
    "kt",
    "knot",
    "knots",
    "0.51444444444444444444",
  ),
  unitRegistration("bit", "data", "bit", "bit", "bits", "0.125"),
  unitRegistration("byte", "data", "B", "byte", "bytes", "1"),
  unitRegistration("kilobyte", "data", "KB", "kilobyte", "kilobytes", "1000", [
    "kb",
  ]),
  unitRegistration("kibibyte", "data", "KiB", "kibibyte", "kibibytes", "1024", [
    "kib",
  ]),
  unitRegistration(
    "megabyte",
    "data",
    "MB",
    "megabyte",
    "megabytes",
    "1000000",
    ["mb"],
  ),
  unitRegistration(
    "mebibyte",
    "data",
    "MiB",
    "mebibyte",
    "mebibytes",
    "1048576",
    ["mib"],
  ),
  unitRegistration(
    "gigabyte",
    "data",
    "GB",
    "gigabyte",
    "gigabytes",
    "1000000000",
    ["gb"],
  ),
  unitRegistration(
    "gibibyte",
    "data",
    "GiB",
    "gibibyte",
    "gibibytes",
    "1073741824",
    ["gib"],
  ),
  unitRegistration(
    "terabyte",
    "data",
    "TB",
    "terabyte",
    "terabytes",
    "1000000000000",
    ["tb"],
  ),
  unitRegistration("hertz", "frequency", "Hz", "hertz", "hertz", "1", ["hz"]),
  unitRegistration(
    "kilohertz",
    "frequency",
    "kHz",
    "kilohertz",
    "kilohertz",
    "1000",
    ["khz"],
  ),
  unitRegistration(
    "megahertz",
    "frequency",
    "MHz",
    "megahertz",
    "megahertz",
    "1000000",
    ["mhz"],
  ),
  unitRegistration(
    "gigahertz",
    "frequency",
    "GHz",
    "gigahertz",
    "gigahertz",
    "1000000000",
    ["ghz"],
  ),
  unitRegistration("joule", "energy", "J", "joule", "joules", "1"),
  unitRegistration(
    "kilojoule",
    "energy",
    "kJ",
    "kilojoule",
    "kilojoules",
    "1000",
  ),
  unitRegistration("calorie", "energy", "cal", "calorie", "calories", "4.184"),
  unitRegistration(
    "kilocalorie",
    "energy",
    "kcal",
    "kilocalorie",
    "kilocalories",
    "4184",
  ),
  unitRegistration(
    "watt-hour",
    "energy",
    "Wh",
    "watt hour",
    "watt hours",
    "3600",
  ),
  unitRegistration(
    "kilowatt-hour",
    "energy",
    "kWh",
    "kilowatt hour",
    "kilowatt hours",
    "3600000",
  ),
  unitRegistration(
    "british-thermal-unit",
    "energy",
    "BTU",
    "British thermal unit",
    "British thermal units",
    "1055.05585262",
    ["btu"],
  ),
  unitRegistration("watt", "power", "W", "watt", "watts", "1"),
  unitRegistration("kilowatt", "power", "kW", "kilowatt", "kilowatts", "1000"),
  unitRegistration(
    "megawatt",
    "power",
    "MW",
    "megawatt",
    "megawatts",
    "1000000",
  ),
  unitRegistration(
    "horsepower",
    "power",
    "hp",
    "horsepower",
    "horsepower",
    "745.69987158227022",
  ),
  unitRegistration("pascal", "pressure", "Pa", "pascal", "pascals", "1"),
  unitRegistration(
    "kilopascal",
    "pressure",
    "kPa",
    "kilopascal",
    "kilopascals",
    "1000",
  ),
  unitRegistration("bar", "pressure", "bar", "bar", "bar", "100000"),
  unitRegistration(
    "millibar",
    "pressure",
    "mbar",
    "millibar",
    "millibars",
    "100",
  ),
  unitRegistration(
    "psi",
    "pressure",
    "psi",
    "pound per square inch",
    "pounds per square inch",
    "6894.757293168",
  ),
  unitRegistration(
    "atmosphere",
    "pressure",
    "atm",
    "atmosphere",
    "atmospheres",
    "101325",
  ),
  unitRegistration("torr", "pressure", "Torr", "torr", "torr", "101325/760"),
  unitRegistration(
    "millimeter-of-mercury",
    "pressure",
    "mmHg",
    "millimeter of mercury",
    "millimeters of mercury",
    "133.322387415",
    ["mm hg"],
  ),
  unitRegistration("radian", "angle", "rad", "radian", "radians", "1"),
  unitRegistration(
    "degree",
    "angle",
    "°",
    "degree",
    "degrees",
    "0.017453292519943295",
    ["deg"],
  ),
  unitRegistration(
    "turn",
    "angle",
    "turn",
    "turn",
    "turns",
    "6.283185307179586",
  ),
  unitRegistration(
    "gradian",
    "angle",
    "gon",
    "gradian",
    "gradians",
    "0.015707963267948967",
    ["grad"],
  ),
  unitRegistration(
    "meter-per-second-squared",
    "acceleration",
    "m/s²",
    "meter per second squared",
    "meters per second squared",
    "1",
    ["m/s2"],
  ),
  unitRegistration(
    "foot-per-second-squared",
    "acceleration",
    "ft/s²",
    "foot per second squared",
    "feet per second squared",
    "0.3048",
    ["ft/s2"],
  ),
  unitRegistration(
    "g-force",
    "acceleration",
    "g₀",
    "standard gravity",
    "standard gravity",
    "9.80665",
    ["g0"],
  ),
  unitRegistration("newton", "force", "N", "newton", "newtons", "1"),
  unitRegistration(
    "kilonewton",
    "force",
    "kN",
    "kilonewton",
    "kilonewtons",
    "1000",
  ),
  unitRegistration(
    "pound-force",
    "force",
    "lbf",
    "pound-force",
    "pounds-force",
    "4.4482216152605",
  ),
  unitRegistration(
    "newton-meter",
    "torque",
    "N⋅m",
    "newton meter",
    "newton meters",
    "1",
    ["N m"],
  ),
  unitRegistration(
    "pound-foot",
    "torque",
    "lb⋅ft",
    "pound-foot",
    "pound-feet",
    "1.3558179483314004",
    ["lb ft", "ft-lb"],
  ),
  unitRegistration(
    "ampere",
    "electric-current",
    "A",
    "ampere",
    "amperes",
    "1",
    ["amp"],
  ),
  unitRegistration(
    "milliampere",
    "electric-current",
    "mA",
    "milliampere",
    "milliamperes",
    "0.001",
  ),
  unitRegistration("volt", "electric-potential", "V", "volt", "volts", "1"),
  unitRegistration(
    "millivolt",
    "electric-potential",
    "mV",
    "millivolt",
    "millivolts",
    "0.001",
  ),
  unitRegistration(
    "kilovolt",
    "electric-potential",
    "kV",
    "kilovolt",
    "kilovolts",
    "1000",
  ),
  unitRegistration(
    "kilogram-per-cubic-meter",
    "density",
    "kg/m³",
    "kilogram per cubic meter",
    "kilograms per cubic meter",
    "1",
    ["kg/m3"],
  ),
  unitRegistration(
    "gram-per-cubic-centimeter",
    "density",
    "g/cm³",
    "gram per cubic centimeter",
    "grams per cubic centimeter",
    "1000",
    ["g/cm3"],
  ),
  unitRegistration(
    "pound-per-cubic-foot",
    "density",
    "lb/ft³",
    "pound per cubic foot",
    "pounds per cubic foot",
    "16.01846337396014",
    ["lb/ft3", "pcf"],
  ),
]);

for (const registration of initialUnitRegistry) {
  registerUnit(registration);
}

export function registerUnit(registration: UnitRegistration): UnitMeta {
  const code = normalizeUnitLookup(registration.code);
  const dimension = registration.dimension.trim();

  if (code.length === 0 || dimension.length === 0) {
    throw new NumeratorError("INVALID_UNIT", { registration });
  }

  const labels = freezeLabels(registration.labels);
  const symbol = registration.symbol ?? labels.short;
  const meta: UnitMeta = Object.freeze({
    ...registration,
    aliases: Object.freeze([...(registration.aliases ?? [])]),
    code,
    dimension,
    labels,
    localeLabels: freezeLocaleLabels(registration.localeLabels),
    symbol,
  });

  units.set(code, meta);
  registerAlias(code, code);
  registerAlias(symbol, code);
  registerAlias(labels.short, code);
  registerAlias(labels.narrow, code);
  registerAlias(labels.long.one, code);
  registerAlias(labels.long.other, code);

  for (const alias of meta.aliases) {
    registerAlias(alias, code);
  }

  for (const localeLabels of Object.values(meta.localeLabels ?? {})) {
    registerAlias(localeLabels.short, code);
    registerAlias(localeLabels.narrow, code);
    registerAlias(localeLabels.long.one, code);
    registerAlias(localeLabels.long.other, code);
  }

  return meta;
}

export function getUnitMeta(unitCode: string): UnitMeta {
  const code = normalizeUnitCode(unitCode);

  if (code === null) {
    throw new NumeratorError("INVALID_UNIT", { unit: unitCode });
  }

  return units.get(code)!;
}

export function normalizeUnitCode(unitCode: string): string | null {
  return aliases.get(normalizeUnitLookup(unitCode)) ?? null;
}

export function isUnitCode(unitCode: string): boolean {
  return normalizeUnitCode(unitCode) !== null;
}

export function getRegisteredUnits(): UnitMeta[] {
  return [...units.values()];
}

export function getRegisteredUnitCodes(): string[] {
  return [...units.keys()].sort();
}

export function getUnitsByDimension(
  dimension: UnitDimension | string,
): UnitMeta[] {
  return getRegisteredUnits().filter((unit) => unit.dimension === dimension);
}

export function getUnitLabels(unitCode: string, locale?: string): UnitLabels {
  const meta = getUnitMeta(unitCode);

  if (!locale) {
    return meta.labels;
  }

  return (
    meta.localeLabels?.[locale] ??
    meta.localeLabels?.[locale.split("-")[0] ?? ""] ??
    meta.labels
  );
}

export function getUnitAliases(unitCode: string, locale?: string): string[] {
  const meta = getUnitMeta(unitCode);
  const labels = getUnitLabels(meta.code, locale);
  return [
    meta.code,
    meta.symbol,
    labels.short,
    labels.narrow,
    labels.long.one,
    labels.long.other,
    ...meta.aliases,
  ];
}

function unitRegistration(
  code: string,
  dimension: UnitDimension,
  symbol: string,
  one: string,
  other: string,
  conversionFactorToBase?: string,
  extraAliases: readonly string[] = [],
  conversionOffsetToBase?: string,
): UnitRegistration {
  return {
    aliases: extraAliases,
    conversionFactorToBase,
    conversionOffsetToBase,
    code,
    dimension,
    labels: {
      long: { one, other },
      narrow: symbol,
      short: symbol,
    },
    localeLabels: {
      tr: {
        long: {
          one: getTurkishLongLabel(code, other),
          other: getTurkishLongLabel(code, other),
        },
        narrow: symbol,
        short: symbol,
      },
    },
    symbol,
  };
}

function getTurkishLongLabel(code: string, fallback: string): string {
  const labels: Record<string, string> = {
    ampere: "amper",
    acre: "akre",
    atmosphere: "atmosfer",
    byte: "bayt",
    bit: "bit",
    "british-thermal-unit": "British ısı birimi",
    calorie: "kalori",
    celsius: "santigrat derece",
    centimeter: "santimetre",
    "cubic-centimeter": "santimetreküp",
    "cubic-foot": "fit küp",
    "cubic-inch": "inç küp",
    "cubic-meter": "metreküp",
    cup: "bardak",
    day: "gün",
    decimeter: "desimetre",
    degree: "derece",
    fahrenheit: "fahrenhayt derece",
    "fluid-ounce": "sıvı ons",
    foot: "fit",
    "foot-per-second-squared": "fit/saniye kare",
    "g-force": "standart yerçekimi",
    gallon: "galon",
    gigabyte: "gigabayt",
    gibibyte: "gibibayt",
    gigahertz: "gigahertz",
    gram: "gram",
    "gram-per-cubic-centimeter": "gram/santimetreküp",
    gradian: "gradyan",
    hectare: "hektar",
    hour: "saat",
    hertz: "hertz",
    horsepower: "beygir gücü",
    inch: "inç",
    joule: "joule",
    kibibyte: "kibibayt",
    kilocalorie: "kilokalori",
    kilogram: "kilogram",
    "kilogram-per-cubic-meter": "kilogram/metreküp",
    kilobyte: "kilobayt",
    kilohertz: "kilohertz",
    kilojoule: "kilojoule",
    kilonewton: "kilonewton",
    kilometer: "kilometre",
    "kilometer-per-hour": "kilometre/saat",
    kilopascal: "kilopaskal",
    kilovolt: "kilovolt",
    kilowatt: "kilowatt",
    "kilowatt-hour": "kilowatt saat",
    knot: "deniz mili/saat",
    mebibyte: "mebibayt",
    megahertz: "megahertz",
    megabyte: "megabayt",
    megawatt: "megawatt",
    meter: "metre",
    "meter-per-second": "metre/saniye",
    "meter-per-second-squared": "metre/saniye kare",
    micrometer: "mikrometre",
    mile: "mil",
    "mile-per-hour": "mil/saat",
    milliampere: "miliamper",
    millibar: "milibar",
    milliliter: "mililitre",
    millimeter: "milimetre",
    "millimeter-of-mercury": "milimetre cıva",
    milligram: "miligram",
    millivolt: "milivolt",
    minute: "dakika",
    nanometer: "nanometre",
    "nautical-mile": "deniz mili",
    newton: "newton",
    "newton-meter": "newton metre",
    ounce: "ons",
    pascal: "paskal",
    pint: "pint",
    pound: "libre",
    "pound-foot": "pound-foot",
    "pound-force": "pound-kuvvet",
    "pound-per-cubic-foot": "libre/fit küp",
    psi: "inç kare başına libre",
    quart: "kuart",
    radian: "radyan",
    second: "saniye",
    "square-centimeter": "santimetrekare",
    "square-inch": "inç kare",
    "square-kilometer": "kilometrekare",
    "square-mile": "mil kare",
    "square-millimeter": "milimetrekare",
    "square-meter": "metrekare",
    "square-foot": "fit kare",
    "square-yard": "yarda kare",
    tonne: "ton",
    tablespoon: "yemek kaşığı",
    teaspoon: "çay kaşığı",
    terabyte: "terabayt",
    torr: "torr",
    turn: "tur",
    volt: "volt",
    watt: "watt",
    "watt-hour": "watt saat",
    week: "hafta",
    yard: "yarda",
  };

  return labels[code] ?? fallback;
}

function registerAlias(alias: string, code: string): void {
  const normalized = normalizeUnitLookup(alias);

  if (normalized.length > 0) {
    aliases.set(normalized, code);
  }
}

function normalizeUnitLookup(value: string): string {
  return value.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
}

function freezeLabels(labels: UnitLabels): UnitLabels {
  return Object.freeze({
    long: Object.freeze({ ...labels.long }),
    narrow: labels.narrow,
    short: labels.short,
  });
}

function freezeLocaleLabels(
  labels: UnitRegistration["localeLabels"],
): UnitRegistration["localeLabels"] {
  if (!labels) {
    return undefined;
  }

  return Object.freeze(
    Object.fromEntries(
      Object.entries(labels).map(([locale, localeLabels]) => [
        locale,
        freezeLabels(localeLabels),
      ]),
    ),
  );
}
