import {
  canConvertUnit,
  convertUnit,
  convertUnitForLocale,
  convertUnitToBestFit,
  createUnitInputOptions,
  formatUnit,
  formatUnitBestFit,
  formatUnitForLocale,
  getUnitBestFitCandidates,
  getPreferredUnitForDimension,
  getRegisteredUnitCodes,
  getUnitSystemForLocale,
  getUnitsByDimension,
  safeParseUnit,
  unit,
} from "expo-numerator";

import {
  DataTable,
  Metric,
  MetricGrid,
  PageScaffold,
  Section,
} from "../components";
import { useShowcase } from "../provider";

const dimensionOrder = [
  "angle",
  "length",
  "area",
  "volume",
  "mass",
  "speed",
  "acceleration",
  "temperature",
  "data",
  "frequency",
  "energy",
  "power",
  "pressure",
  "force",
  "torque",
  "density",
  "electric-current",
  "electric-potential",
] as const;

export function UnitsPage() {
  const { numerator } = useShowcase();
  const distance = unit("12.5", "km");
  const area = unit("1500", "m²");
  const volume = unit("2.75", "liter");
  const weight = unit("82.4", "kg");
  const meters = convertUnit(distance, "meter", { scale: 2 });
  const hectares = convertUnit(area, "hectare", { scale: 4 });
  const megabytes = convertUnit(unit("1", "gigabyte"), "megabyte", {
    scale: 0,
  });
  const joules = convertUnit(unit("1", "kilowatt-hour"), "joule", {
    scale: 0,
  });
  const kilopascals = convertUnit(unit("1", "bar"), "kilopascal", {
    scale: 2,
  });
  const hertz = convertUnit(unit("2", "megahertz"), "hertz", {
    scale: 0,
  });
  const fahrenheit = convertUnit(unit("0", "celsius"), "fahrenheit", {
    scale: 2,
  });
  const radians = convertUnit(unit("90", "degree"), "radian", { scale: 6 });
  const gravity = convertUnit(unit("1", "g-force"), "meter-per-second-squared", {
    scale: 5,
  });
  const cups = convertUnit(unit("1", "gallon"), "cup", { scale: 2 });
  const bytes = convertUnit(unit("1", "kibibyte"), "byte", { scale: 0 });
  const torque = convertUnit(unit("10", "newton-meter"), "pound-foot", {
    scale: 4,
  });
  const density = convertUnit(
    unit("1", "gram-per-cubic-centimeter"),
    "kilogram-per-cubic-meter",
    { scale: 0 },
  );
  const bestDistance = convertUnitToBestFit(unit("1500", "meter"), {
    locale: numerator.locale,
    scale: 2,
  });
  const bestSmallDistance = convertUnitToBestFit(unit("0.005", "meter"), {
    locale: numerator.locale,
    scale: 0,
  });
  const bestData = convertUnitToBestFit(unit("1536", "byte"), {
    scale: 2,
  });
  const bestUsDistance = formatUnitBestFit(unit("1609.344", "meter"), {
    locale: "en-US",
    scale: 2,
  });
  const areaInputOptions = createUnitInputOptions("m²", {
    locale: numerator.locale,
  });
  const energyInputOptions = createUnitInputOptions("kilowatt-hour", {
    locale: numerator.locale,
  });
  const currentUnitSystem = getUnitSystemForLocale(numerator.locale);
  const localeDistance = convertUnitForLocale(unit("10", "kilometer"), {
    locale: numerator.locale,
    scale: 4,
  });
  const usPressure = convertUnitForLocale(unit("1", "bar"), {
    locale: "en-US",
    scale: 4,
  });
  const usDistanceText = formatUnitForLocale(unit("10", "kilometer"), {
    locale: "en-US",
    scale: 2,
    unitDisplay: "long",
  });
  const parsedAreaText = `${numerator.formatNumber("1.5")} m²`;
  const parsedArea = numerator.safeParseUnit(parsedAreaText);
  const parsedExpectedArea = numerator.safeParseUnit("1500", {
    unit: "square-meter",
  });
  const invalid = safeParseUnit("12.5 unknown-unit");

  return (
    <PageScaffold
      pageId="units"
      title="Units"
      caption="Canonical measurement registry, aliases, localized display, area symbols, and unit parser contracts."
    >
      <Section title="Registry coverage">
        <MetricGrid>
          <Metric label="unit codes" value={String(getRegisteredUnitCodes().length)} />
          <Metric label="length" value={String(getUnitsByDimension("length").length)} />
          <Metric label="area" value={String(getUnitsByDimension("area").length)} />
          <Metric label="volume" value={String(getUnitsByDimension("volume").length)} />
        </MetricGrid>
      </Section>

      <Section title="Format profiles">
        <DataTable
          rows={[
            ["short distance", formatUnit(distance, { locale: numerator.locale })],
            [
              "long distance",
              formatUnit(distance, {
                locale: numerator.locale,
                unitDisplay: "long",
              }),
            ],
            ["area", formatUnit(area, { locale: numerator.locale })],
            [
              "area long",
              formatUnit(area, {
                locale: numerator.locale,
                unitDisplay: "long",
              }),
            ],
            ["volume", formatUnit(volume, { locale: numerator.locale })],
            ["mass", formatUnit(weight, { locale: numerator.locale })],
          ]}
        />
      </Section>

      <Section title="Parse and alias contracts">
        <DataTable
          rows={[
            ['unit("12.5", "km")', `${distance.value} ${distance.unit}`],
            ['unit("1500", "m²")', `${area.value} ${area.unit}`],
            [
              `safeParseUnit("${parsedAreaText}")`,
              parsedArea.ok
                ? `${parsedArea.value.value} ${parsedArea.value.unit}`
                : parsedArea.error.code,
            ],
            [
              'safeParseUnit("1500", unit square-meter)',
              parsedExpectedArea.ok
                ? parsedExpectedArea.value.unit
                : parsedExpectedArea.error.code,
            ],
            [
              "unknown unit",
              invalid.ok ? "ok" : invalid.error.code,
            ],
          ]}
        />
      </Section>

      <Section title="Conversion engine">
        <DataTable
          rows={[
            ["12.5 km to m", formatUnit(meters, { locale: numerator.locale })],
            [
              "1500 m² to ha",
              formatUnit(hectares, {
                locale: numerator.locale,
                unitDisplay: "long",
              }),
            ],
            ["1 GB to MB", formatUnit(megabytes, { locale: numerator.locale })],
            ["1 kWh to J", formatUnit(joules, { locale: numerator.locale })],
            [
              "1 bar to kPa",
              formatUnit(kilopascals, { locale: numerator.locale }),
            ],
            ["2 MHz to Hz", formatUnit(hertz, { locale: numerator.locale })],
            [
              "0 °C to °F",
              formatUnit(fahrenheit, { locale: numerator.locale }),
            ],
            ["90° to rad", formatUnit(radians, { locale: numerator.locale })],
            ["1 g to m/s²", formatUnit(gravity, { locale: numerator.locale })],
            ["1 gal to cup", formatUnit(cups, { locale: numerator.locale })],
            ["1 KiB to B", formatUnit(bytes, { locale: numerator.locale })],
            [
              "10 N⋅m to lb⋅ft",
              formatUnit(torque, { locale: numerator.locale }),
            ],
            [
              "1 g/cm³ to kg/m³",
              formatUnit(density, { locale: numerator.locale }),
            ],
            [
              "km to kg",
              canConvertUnit("kilometer", "kilogram") ? "convertible" : "blocked",
            ],
            [
              "temperature",
              canConvertUnit("celsius", "fahrenheit")
                ? "offset-aware"
                : "blocked",
            ],
          ]}
        />
      </Section>

      <Section title="Locale unit preferences">
        <DataTable
          rows={[
            ["current locale", numerator.locale],
            ["current unit system", currentUnitSystem],
            [
              "preferred length",
              getPreferredUnitForDimension("length", {
                locale: numerator.locale,
              }),
            ],
            [
              "preferred pressure",
              getPreferredUnitForDimension("pressure", {
                locale: numerator.locale,
              }),
            ],
            [
              "preferred force",
              getPreferredUnitForDimension("force", {
                locale: numerator.locale,
              }),
            ],
            [
              "preferred torque",
              getPreferredUnitForDimension("torque", {
                locale: numerator.locale,
              }),
            ],
            [
              "10 km for current locale",
              formatUnit(localeDistance, { locale: numerator.locale }),
            ],
            ["en-US pressure", formatUnit(usPressure, { locale: "en-US" })],
            ["en-US formatted distance", usDistanceText],
          ]}
        />
      </Section>

      <Section title="Best-fit scaling">
        <DataTable
          rows={[
            [
              "length candidates",
              getUnitBestFitCandidates("length", {
                locale: numerator.locale,
              }).join(", "),
            ],
            [
              "1500 m",
              formatUnit(bestDistance, { locale: numerator.locale }),
            ],
            [
              "0.005 m",
              formatUnit(bestSmallDistance, { locale: numerator.locale }),
            ],
            ["1536 B", formatUnit(bestData, { locale: numerator.locale })],
            ["1609.344 m en-US", bestUsDistance],
          ]}
        />
      </Section>

      <Section title="Input profiles">
        <DataTable
          rows={[
            ["area profile unit", areaInputOptions.unit ?? "none"],
            [
              "area profile fraction",
              String(areaInputOptions.maximumFractionDigits),
            ],
            ["energy profile unit", energyInputOptions.unit ?? "none"],
            [
              "energy profile fraction",
              String(energyInputOptions.maximumFractionDigits),
            ],
          ]}
        />
      </Section>

      <Section title="Dimensions">
        <DataTable
          rows={dimensionOrder.map((dimension) => [
            dimension,
            getUnitsByDimension(dimension)
              .map((meta) => meta.code)
              .join(", "),
          ])}
        />
      </Section>
    </PageScaffold>
  );
}
