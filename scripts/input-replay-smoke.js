#!/usr/bin/env node

const assert = require("node:assert/strict");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const numerator = require(path.join(repoRoot, "build", "cjs", "index.cjs"));

const selectors = Object.freeze({
  input: "expo-numerator-amount-input",
  parsed: "expo-numerator-amount-parsed",
  state: "expo-numerator-amount-state",
});

const scenarios = [
  {
    name: "type localized tr-TR amount",
    options: { locale: "tr-TR", maximumFractionDigits: 2 },
    steps: [{ type: "nativeTextChange", text: "1234,56" }],
    expected: {
      text: "1234,56",
      value: "1234.56",
      selection: { start: 7, end: 7 },
      isValid: true,
      errorCode: null,
    },
  },
  {
    name: "insert before decimal separator",
    options: { locale: "tr-TR", maximumFractionDigits: 2 },
    initial: { text: "12,34", selection: { start: 2, end: 2 } },
    steps: [{ type: "nativeTextChange", text: "129,34" }],
    expected: {
      text: "129,34",
      value: "129.34",
      selection: { start: 3, end: 3 },
      isValid: true,
      errorCode: null,
    },
  },
  {
    name: "paste grouped localized amount",
    options: { locale: "tr-TR", maximumFractionDigits: 2 },
    steps: [{ type: "nativeTextChange", text: "1.234,56" }],
    expected: {
      text: "1234,56",
      value: "1234.56",
      selection: { start: 7, end: 7 },
      isValid: true,
      errorCode: null,
    },
  },
  {
    name: "replace selected range",
    options: { locale: "en-US" },
    initial: { text: "1234.56", selection: { start: 2, end: 6 } },
    steps: [{ type: "nativeTextChange", text: "1296" }],
    expected: {
      text: "1296",
      value: "1296",
      selection: { start: 3, end: 3 },
      isValid: true,
      errorCode: null,
    },
  },
  {
    name: "blur formats amount",
    options: {
      locale: "en-US",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    },
    steps: [{ type: "nativeTextChange", text: "1234.5" }, { type: "blur" }],
    expected: {
      text: "1,234.50",
      value: "1234.50",
      selection: { start: 8, end: 8 },
      isValid: true,
      errorCode: null,
    },
  },
  {
    name: "money profile preserves zero-minor default",
    profile: {
      type: "money",
      currency: "JPY",
      options: { defaultValue: "1234", locale: "ja-JP" },
    },
    steps: [],
    expected: {
      text: "1234",
      value: "1234",
      selection: { start: 4, end: 4 },
      isValid: true,
      errorCode: null,
    },
  },
  {
    name: "money profile caps three-minor input",
    profile: {
      type: "money",
      currency: "KWD",
      options: { locale: "en-US" },
    },
    steps: [{ type: "nativeTextChange", text: "1.2345" }],
    expected: {
      text: "1.234",
      value: "1.234",
      selection: { start: 5, end: 5 },
      isValid: true,
      errorCode: null,
    },
  },
  {
    name: "percent profile keeps semantic ratio",
    profile: {
      type: "percent",
      options: { defaultValue: "0.125", locale: "tr-TR" },
    },
    steps: [],
    expected: {
      text: "12,5",
      value: "0.125",
      selection: { start: 4, end: 4 },
      isValid: true,
      errorCode: null,
    },
  },
  {
    name: "integer profile strips decimal and sign",
    profile: {
      type: "integer",
      options: { allowNegative: false, locale: "en-US" },
    },
    steps: [{ type: "nativeTextChange", text: "-123.45" }],
    expected: {
      text: "12345",
      value: "12345",
      selection: { start: 5, end: 5 },
      isValid: true,
      errorCode: null,
    },
  },
  {
    name: "unit profile emits canonical unit value",
    profile: {
      type: "unit",
      unit: "m²",
      options: { defaultValue: "1500", locale: "tr-TR" },
    },
    steps: [],
    expected: {
      text: "1500,00",
      value: "1500.00",
      selection: { start: 7, end: 7 },
      isValid: true,
      errorCode: null,
    },
  },
  {
    name: "phone profile keeps partial international draft valid",
    profile: {
      type: "phone",
      options: { defaultRegion: "TR" },
    },
    steps: [{ type: "phoneTextChange", text: "+90" }],
    expected: {
      text: "+90",
      value: null,
      selection: { start: 3, end: 3 },
      isValid: true,
      errorCode: null,
    },
  },
  {
    name: "phone profile emits mobile e164 value",
    profile: {
      type: "phone",
      options: { defaultRegion: "TR" },
    },
    steps: [{ type: "phoneTextChange", text: "05012345678" }],
    expected: {
      text: "0501 234 56 78",
      value: "+905012345678",
      selection: { start: 14, end: 14 },
      isValid: true,
      errorCode: null,
    },
  },
  {
    name: "phone max profile applies NANP as-you-type punctuation",
    profile: {
      type: "phone",
      options: { defaultRegion: "US", metadataProfile: "max" },
    },
    steps: [{ type: "phoneTextChange", text: "2015550123" }],
    expected: {
      text: "(201) 555-0123",
      value: "+12015550123",
      selection: { start: 14, end: 14 },
      isValid: true,
      errorCode: null,
    },
  },
];

function main() {
  const results = scenarios.map(replayScenario);

  for (const result of results) {
    assert.deepEqual(result.actual, result.expected, result.name);
  }

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ selectors, scenarios: results }, null, 2));
    return;
  }

  console.log(`Input replay passed (${results.length} scenarios).`);
}

function replayScenario(scenario) {
  const options = getScenarioOptions(scenario);
  let state = scenario.initial
    ? numerator.applyNumberInputText(
        createScenarioInputState(scenario, options),
        scenario.initial.text,
        scenario.initial.selection,
        options,
      )
    : createScenarioInputState(scenario, options);

  for (const step of scenario.steps) {
    if (step.type === "nativeTextChange") {
      state = numerator.applyNumberInputNativeTextChange(
        state,
        step.text,
        options,
      );
    } else if (step.type === "phoneTextChange") {
      state = numerator.applyPhoneInputNativeTextChange(
        state,
        step.text,
        options,
      );
    } else if (step.type === "edit") {
      state = numerator.applyNumberInputEdit(state, step.edit, options);
    } else if (step.type === "blur") {
      state = numerator.formatNumberInputOnBlur(state, options);
    } else {
      throw new Error(`Unknown replay step: ${step.type}`);
    }
  }

  return {
    name: scenario.name,
    selectors,
    options,
    profile: scenario.profile,
    steps: scenario.steps,
    expected: scenario.expected,
    actual: serializeState(state),
  };
}

function createScenarioInputState(scenario, options) {
  if (scenario.profile?.type === "phone") {
    return numerator.createPhoneInputState(options);
  }

  return numerator.createNumberInputState(options);
}

function getScenarioOptions(scenario) {
  if (!scenario.profile) {
    return scenario.options ?? {};
  }

  if (scenario.profile.type === "money") {
    return numerator.createMoneyInputOptions(
      scenario.profile.currency,
      scenario.profile.options,
    );
  }

  if (scenario.profile.type === "percent") {
    return numerator.createPercentInputOptions(scenario.profile.options);
  }

  if (scenario.profile.type === "integer") {
    return numerator.createIntegerInputOptions(scenario.profile.options);
  }

  if (scenario.profile.type === "unit") {
    return numerator.createUnitInputOptions(
      scenario.profile.unit,
      scenario.profile.options,
    );
  }

  if (scenario.profile.type === "phone") {
    return scenario.profile.options ?? {};
  }

  throw new Error(`Unknown profile type: ${scenario.profile.type}`);
}

function serializeState(state) {
  return {
    text: state.text,
    value: getNumericValueText(state.value),
    selection: state.selection,
    isValid: state.isValid,
    errorCode: state.error?.code ?? null,
  };
}

function getNumericValueText(value) {
  if (!value) {
    return null;
  }

  if (value.kind === "money") {
    return value.amount;
  }

  if (value.kind === "phone") {
    return value.e164;
  }

  return value.value;
}

main();
