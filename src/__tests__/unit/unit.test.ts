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
  getUnitAliases,
  getPreferredUnitForDimension,
  getPreferredUnitForValue,
  getRegisteredUnitCodes,
  getRegisteredUnits,
  getUnitMeta,
  getUnitSystemForLocale,
  getUnitsByDimension,
  isUnitCode,
  parseUnit,
  safeParseUnit,
  safeUnit,
  sanitizeNumberInputText,
  unit,
} from "../../index";

describe("unit registry and measurement domain", () => {
  it("normalizes unit aliases into canonical unit values", () => {
    expect(unit("12.5", "km")).toEqual({
      dimension: "length",
      kind: "unit",
      unit: "kilometer",
      value: "12.5",
    });

    expect(unit("1500", "m²")).toMatchObject({
      dimension: "area",
      unit: "square-meter",
    });
  });

  it("exposes dimension and registry helpers", () => {
    expect(isUnitCode("sqm")).toBe(true);
    expect(getUnitMeta("kilometer").dimension).toBe("length");
    expect(getUnitsByDimension("area").map((meta) => meta.code)).toContain(
      "square-meter",
    );
    expect(getRegisteredUnitCodes()).toContain("kilogram");
    expect(getRegisteredUnitCodes()).toContain("kilowatt-hour");
    expect(getRegisteredUnitCodes()).toContain("psi");
    expect(getRegisteredUnitCodes()).toContain("degree");
    expect(getRegisteredUnitCodes()).toContain("newton-meter");
    expect(getRegisteredUnitCodes()).toContain("kilogram-per-cubic-meter");
  });

  it("keeps registry aliases canonical and collision-free", () => {
    const aliasOwners = new Map<string, string>();

    for (const meta of getRegisteredUnits()) {
      expect(getUnitMeta(meta.code).code).toBe(meta.code);
      expect(isUnitCode(meta.code)).toBe(true);
      expect(unit("1", meta.code).unit).toBe(meta.code);

      for (const alias of getUnitAliases(meta.code)) {
        const normalizedAlias = alias
          .normalize("NFKC")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ");

        if (normalizedAlias.length === 0) {
          continue;
        }

        const existingOwner = aliasOwners.get(normalizedAlias);

        expect(existingOwner === undefined || existingOwner === meta.code).toBe(
          true,
        );
        aliasOwners.set(normalizedAlias, meta.code);
      }
    }

    expect(unit("1", "g").unit).toBe("gram");
    expect(unit("1", "g0").unit).toBe("g-force");
    expect(unit("1", "nm").unit).toBe("nanometer");
    expect(unit("1", "N m").unit).toBe("newton-meter");
  });

  it("formats unit values with short, long, code, and locale labels", () => {
    const distance = unit("12.5", "kilometer");
    const area = unit("1500", "square-meter");

    expect(formatUnit(distance, { locale: "en-US" })).toBe("12.5 km");
    expect(formatUnit(distance, { locale: "en-US", unitDisplay: "long" })).toBe(
      "12.5 kilometers",
    );
    expect(formatUnit(distance, { unitDisplay: "code" })).toBe(
      "12.5 kilometer",
    );
    expect(formatUnit(area, { locale: "tr-TR", unitDisplay: "long" })).toBe(
      "1.500 metrekare",
    );
  });

  it("parses unit suffixes and validates expected unit or dimension", () => {
    expect(parseUnit("12.5 km").unit).toBe("kilometer");
    expect(parseUnit("1,5 m²", { locale: "tr-TR" })).toEqual({
      dimension: "area",
      kind: "unit",
      unit: "square-meter",
      value: "1.5",
    });
    expect(parseUnit("1500", { unit: "square-meter" }).unit).toBe(
      "square-meter",
    );
    expect(() => parseUnit("12.5 kg", { dimension: "length" })).toThrow(
      "INVALID_UNIT",
    );
  });

  it("converts linear units without JavaScript number conversion", () => {
    expect(
      convertUnit(unit("1.5", "kilometer"), "meter", { scale: 2 }),
    ).toEqual({
      dimension: "length",
      kind: "unit",
      unit: "meter",
      value: "1500.00",
    });
    expect(
      convertUnit(unit("10000", "square-meter"), "hectare", {
        scale: 4,
      }).value,
    ).toBe("1.0000");
    expect(convertUnit(unit("2.5", "hour"), "minute", { scale: 2 }).value).toBe(
      "150.00",
    );
    expect(
      convertUnit(unit("1", "gigabyte"), "megabyte", { scale: 0 }).value,
    ).toBe("1000");
    expect(
      convertUnit(unit("1", "kilowatt-hour"), "joule", { scale: 0 }).value,
    ).toBe("3600000");
    expect(
      convertUnit(unit("1", "bar"), "kilopascal", { scale: 2 }).value,
    ).toBe("100.00");
    expect(
      convertUnit(unit("2", "megahertz"), "hertz", { scale: 0 }).value,
    ).toBe("2000000");
    expect(convertUnit(unit("1", "gallon"), "cup", { scale: 2 }).value).toBe(
      "16.00",
    );
    expect(convertUnit(unit("1", "kibibyte"), "byte", { scale: 0 }).value).toBe(
      "1024",
    );
    expect(
      convertUnit(unit("1", "knot"), "kilometer-per-hour", { scale: 4 }).value,
    ).toBe("1.8520");
    expect(
      convertUnit(unit("90", "degree"), "radian", { scale: 6 }).value,
    ).toBe("1.570796");
    expect(
      convertUnit(unit("1", "g-force"), "meter-per-second-squared", {
        scale: 5,
      }).value,
    ).toBe("9.80665");
    expect(
      convertUnit(unit("1000", "newton"), "kilonewton", { scale: 2 }).value,
    ).toBe("1.00");
    expect(
      convertUnit(unit("10", "newton-meter"), "pound-foot", { scale: 4 }).value,
    ).toBe("7.3756");
    expect(
      convertUnit(
        unit("1", "gram-per-cubic-centimeter"),
        "kilogram-per-cubic-meter",
        { scale: 0 },
      ).value,
    ).toBe("1000");
  });

  it("converts offset temperature units with rational formulas", () => {
    expect(
      convertUnit(unit("0", "celsius"), "fahrenheit", { scale: 2 }).value,
    ).toBe("32.00");
    expect(
      convertUnit(unit("32", "fahrenheit"), "celsius", { scale: 2 }).value,
    ).toBe("0");
    expect(
      convertUnit(unit("273.15", "kelvin"), "celsius", { scale: 2 }).value,
    ).toBe("0");
  });

  it("rejects incompatible conversion requests", () => {
    expect(canConvertUnit("kilometer", "meter")).toBe(true);
    expect(canConvertUnit("kilometer", "kilogram")).toBe(false);
    expect(canConvertUnit("celsius", "fahrenheit")).toBe(true);
    expect(() => convertUnit(unit("1", "kilometer"), "kilogram")).toThrow(
      "INVALID_UNIT",
    );
  });

  it("rejects unit values whose dimension does not match the registry", () => {
    const mismatchedUnit = {
      dimension: "mass",
      kind: "unit",
      unit: "kilometer",
      value: "1",
    } as const;

    expect(() => formatUnit(mismatchedUnit)).toThrow("INVALID_UNIT");
    expect(() => convertUnit(mismatchedUnit, "meter")).toThrow("INVALID_UNIT");
    expect(() =>
      getPreferredUnitForValue(mismatchedUnit, { locale: "en-US" }),
    ).toThrow("INVALID_UNIT");
    expect(() =>
      convertUnitForLocale(mismatchedUnit, { locale: "en-US" }),
    ).toThrow("INVALID_UNIT");
    expect(() => convertUnitToBestFit(mismatchedUnit)).toThrow("INVALID_UNIT");
  });

  it("resolves locale-aware preferred unit systems and target units", () => {
    expect(getUnitSystemForLocale()).toBe("metric");
    expect(getUnitSystemForLocale("tr-TR")).toBe("metric");
    expect(getUnitSystemForLocale("en-US")).toBe("us");
    expect(getUnitSystemForLocale("en_GB")).toBe("uk");
    expect(getPreferredUnitForDimension("pressure", { locale: "en-US" })).toBe(
      "psi",
    );
    expect(getPreferredUnitForDimension("pressure", { locale: "tr-TR" })).toBe(
      "bar",
    );
    expect(
      getPreferredUnitForValue(unit("10", "kilometer"), {
        locale: "en-US",
      }),
    ).toBe("mile");
    expect(getPreferredUnitForDimension("force", { locale: "en-US" })).toBe(
      "pound-force",
    );
    expect(getPreferredUnitForDimension("torque", { locale: "tr-TR" })).toBe(
      "newton-meter",
    );
  });

  it("keeps locale preferences and best-fit candidates dimension-safe", () => {
    const dimensions = new Set(
      getRegisteredUnits().map((registeredUnit) => registeredUnit.dimension),
    );

    for (const dimension of dimensions) {
      for (const unitSystem of ["metric", "uk", "us"] as const) {
        const preferredUnit = getPreferredUnitForDimension(dimension, {
          unitSystem,
        });

        expect(getUnitMeta(preferredUnit).dimension).toBe(dimension);
      }

      for (const unitSystem of ["metric", "uk", "us"] as const) {
        for (const candidate of getUnitBestFitCandidates(dimension, {
          unitSystem,
        })) {
          expect(getUnitMeta(candidate).dimension).toBe(dimension);
          expect(
            canConvertUnit(
              candidate,
              getPreferredUnitForDimension(dimension, {
                unitSystem,
              }),
            ),
          ).toBe(true);
        }
      }
    }
  });

  it("converts unit values into locale preference profiles", () => {
    expect(
      convertUnitForLocale(unit("1", "kilometer"), {
        locale: "en-US",
        scale: 4,
      }),
    ).toEqual({
      dimension: "length",
      kind: "unit",
      unit: "mile",
      value: "0.6214",
    });
    expect(
      convertUnitForLocale(unit("1", "bar"), {
        locale: "en-US",
        scale: 4,
      }),
    ).toEqual({
      dimension: "pressure",
      kind: "unit",
      unit: "psi",
      value: "14.5038",
    });
    const metricDistance = unit("10", "kilometer");
    expect(
      convertUnitForLocale(metricDistance, { locale: "tr-TR", scale: 2 }),
    ).toBe(metricDistance);
  });

  it("formats unit values through locale preference profiles", () => {
    expect(
      formatUnitForLocale(unit("1", "bar"), { locale: "en-US", scale: 4 }),
    ).toBe("14.5038 psi");
    expect(
      formatUnitForLocale(unit("1", "bar"), {
        locale: "tr-TR",
        scale: 2,
        unitDisplay: "long",
      }),
    ).toBe("1 bar");
    expect(
      formatUnitForLocale(unit("10", "kilometer"), {
        locale: "en-US",
        scale: 2,
        unitDisplay: "long",
      }),
    ).toBe("6.21 miles");
  });

  it("selects best-fit units by magnitude and unit system", () => {
    expect(getUnitBestFitCandidates("length")).toContain("kilometer");
    expect(
      convertUnitToBestFit(unit("1500", "meter"), { scale: 2 }),
    ).toMatchObject({
      unit: "kilometer",
      value: "1.50",
    });
    expect(
      convertUnitToBestFit(unit("0.005", "meter"), { scale: 0 }),
    ).toMatchObject({
      unit: "millimeter",
      value: "5",
    });
    expect(
      convertUnitToBestFit(unit("1536", "byte"), { scale: 2 }),
    ).toMatchObject({
      unit: "kilobyte",
      value: "1.54",
    });
    expect(
      convertUnitToBestFit(unit("1609.344", "meter"), {
        scale: 2,
        unitSystem: "us",
      }),
    ).toMatchObject({
      unit: "mile",
      value: "1.00",
    });
    expect(
      convertUnitToBestFit(unit("7200", "second"), { scale: 2 }),
    ).toMatchObject({
      unit: "hour",
      value: "2.00",
    });
    expect(formatUnitBestFit(unit("1500", "meter"), { scale: 1 })).toBe(
      "1.5 km",
    );
    expect(
      convertUnitToBestFit(unit("-1500", "meter"), { scale: 2 }),
    ).toMatchObject({
      unit: "kilometer",
      value: "-1.50",
    });
    const zeroMeters = unit("0", "meter");
    expect(convertUnitToBestFit(zeroMeters)).toBe(zeroMeters);
    expect(() =>
      convertUnitToBestFit(unit("1", "meter"), {
        candidates: ["gram"],
      }),
    ).toThrow("INVALID_UNIT");
  });

  it("returns typed safe failures for unknown units", () => {
    const constructorResult = safeUnit("1", "unknown-unit");
    const parseResult = safeParseUnit("12.5 unknown-unit");

    expect(constructorResult.ok).toBe(false);
    expect(parseResult.ok).toBe(false);

    if (!constructorResult.ok) {
      expect(constructorResult.error.code).toBe("INVALID_UNIT");
    }

    if (!parseResult.ok) {
      expect(parseResult.error.code).toBe("INVALID_UNIT");
    }
  });

  it("creates reusable unit input option profiles", () => {
    expect(createUnitInputOptions("m²", { locale: "tr-TR" })).toEqual(
      expect.objectContaining({
        locale: "tr-TR",
        maximumFractionDigits: 2,
        mode: "unit",
        unit: "square-meter",
      }),
    );
    expect(createUnitInputOptions("kilowatt-hour")).toEqual(
      expect.objectContaining({
        allowDecimal: true,
        maximumFractionDigits: 2,
        mode: "unit",
        trailingZeroDisplay: "stripIfInteger",
        unit: "kilowatt-hour",
      }),
    );

    const byteOptions = createUnitInputOptions("byte");

    expect(byteOptions).toEqual(
      expect.objectContaining({
        allowDecimal: false,
        maximumFractionDigits: 0,
        mode: "unit",
        trailingZeroDisplay: "stripIfInteger",
        unit: "byte",
      }),
    );
    expect(sanitizeNumberInputText("1.5", byteOptions)).toBe("15");
  });
});
