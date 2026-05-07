import {
  addDecimal,
  compareDecimal,
  decimal,
  formatNumber,
  multiplyDecimal,
  normalizeDecimal,
  parseNumber,
  roundDecimal,
  subtractDecimal,
} from "../../index";

describe("deterministic property checks", () => {
  it("normalizes decimal strings idempotently", () => {
    for (const sample of generateDecimalSamples(250)) {
      const once = normalizeDecimal(sample);
      const twice = normalizeDecimal(once);

      expect(twice.value).toBe(once.value);
      expect(twice.sign).toBe(once.sign);
    }
  });

  it("rounds to a value with the requested max scale", () => {
    for (const sample of generateDecimalSamples(250)) {
      const rounded = roundDecimal(sample, {
        scale: 4,
        roundingMode: "halfExpand",
      });
      const fraction = rounded.value.split(".")[1] ?? "";

      expect(fraction.length).toBeLessThanOrEqual(4);
      expect(() => decimal(rounded)).not.toThrow();
    }
  });

  it("roundtrips formatted locale numbers through strict parser", () => {
    const locales = ["en-US", "tr-TR", "en-IN"] as const;

    for (const locale of locales) {
      for (const sample of generateDecimalSamples(120)) {
        const formatted = formatNumber(sample, {
          locale,
          maximumFractionDigits: 5,
          roundingMode: "halfExpand",
        });
        const parsed = parseNumber(formatted, { locale });
        const expected = roundDecimal(sample, {
          scale: 5,
          roundingMode: "halfExpand",
        });

        expect(compareDecimal(parsed, expected)).toBe(0);
      }
    }
  });

  it("keeps addition and subtraction inverse relationships", () => {
    const samples = generateDecimalSamples(120);

    for (let index = 0; index < samples.length - 1; index += 1) {
      const left = samples[index];
      const right = samples[index + 1];
      const sum = addDecimal(left, right);
      const restored = subtractDecimal(sum, right);

      expect(compareDecimal(restored, left)).toBe(0);
    }
  });

  it("keeps multiplication identity and zero laws", () => {
    for (const sample of generateDecimalSamples(160)) {
      expect(compareDecimal(multiplyDecimal(sample, "1"), sample)).toBe(0);
      expect(compareDecimal(multiplyDecimal(sample, "0"), "0")).toBe(0);
    }
  });
});

function generateDecimalSamples(count: number): string[] {
  const random = createRandom(0x5eed);
  const samples = ["0", "-0", "000001", "-000001.2300"];

  for (let index = 0; index < count; index += 1) {
    const sign = random() > 0.75 ? "-" : "";
    const integerLength = 1 + Math.floor(random() * 24);
    const fractionLength = Math.floor(random() * 12);
    const integer = generateDigits(random, integerLength);
    const fraction =
      fractionLength === 0 ? "" : `.${generateDigits(random, fractionLength)}`;

    samples.push(`${sign}${integer}${fraction}`);
  }

  return samples;
}

function generateDigits(random: () => number, length: number): string {
  let digits = "";

  for (let index = 0; index < length; index += 1) {
    const digit = Math.floor(random() * 10);
    digits += String(digit);
  }

  return digits;
}

function createRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
