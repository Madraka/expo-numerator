import {
  applyNumberInputEdit,
  applyNumberInputNativeTextChange,
  applyNumberInputText,
  commitNumberInputState,
  createIntegerInputOptions,
  createMoneyInputOptions,
  createNumberInputState,
  createPercentInputOptions,
  focusNumberInputState,
  formatNumberInputOnBlur,
  resetNumberInputState,
  sanitizeNumberInputText,
  setNumberInputSelection,
  toggleNumberInputSign,
} from "../../index";
import type { NumericValue } from "../../index";

describe("number input state engine", () => {
  it("creates initial text and value without grouping for editable state", () => {
    const state = createNumberInputState({
      initialValue: "1234.5",
      locale: "en-US",
      minimumFractionDigits: 2,
    });

    expect(state.text).toBe("1234.50");
    expectDecimalValue(state.value, "1234.50");
    expect(state.committedValue).toEqual(state.value);
    expect(state.isDirty).toBe(false);
    expect(state.selection).toEqual({ start: 7, end: 7 });
  });

  it("keeps paste input parseable and caret-stable", () => {
    const state = createNumberInputState({ locale: "tr-TR" });
    const next = applyNumberInputEdit(
      state,
      { replacementText: "1.234,56" },
      { locale: "tr-TR" },
    );

    expect(next.text).toBe("1234,56");
    expectDecimalValue(next.value, "1234.56");
    expect(next.selection).toEqual({ start: 7, end: 7 });
  });

  it("infers native text insertions without forcing the caret to the end", () => {
    const state = applyNumberInputText(createNumberInputState(), "12.34", {
      start: 2,
      end: 2,
    });
    const next = applyNumberInputNativeTextChange(state, "129.34");

    expect(next.text).toBe("129.34");
    expectDecimalValue(next.value, "129.34");
    expect(next.selection).toEqual({ start: 3, end: 3 });
  });

  it("infers native text range replacements and deletions", () => {
    const state = applyNumberInputText(createNumberInputState(), "1234.56", {
      start: 2,
      end: 6,
    });
    const replaced = applyNumberInputNativeTextChange(state, "1296");
    const deleted = applyNumberInputNativeTextChange(replaced, "196");

    expect(replaced.text).toBe("1296");
    expectDecimalValue(replaced.value, "1296");
    expect(replaced.selection).toEqual({ start: 3, end: 3 });
    expect(deleted.text).toBe("196");
    expectDecimalValue(deleted.value, "196");
    expect(deleted.selection).toEqual({ start: 1, end: 1 });
  });

  it("deletes selected text and collapses the caret at the edit point", () => {
    const state = applyNumberInputText(createNumberInputState(), "12345", {
      start: 5,
      end: 5,
    });
    const next = applyNumberInputEdit(state, {
      replacementText: "",
      selection: { start: 2, end: 4 },
    });

    expect(next.text).toBe("125");
    expectDecimalValue(next.value, "125");
    expect(next.selection).toEqual({ start: 2, end: 2 });
  });

  it("toggles negative sign without losing text/value state", () => {
    const state = applyNumberInputText(createNumberInputState(), "123", {
      start: 3,
      end: 3,
    });
    const negative = toggleNumberInputSign(state);
    const positive = toggleNumberInputSign(negative);

    expect(negative.text).toBe("-123");
    expectDecimalValue(negative.value, "-123");
    expect(negative.selection).toEqual({ start: 4, end: 4 });
    expect(positive.text).toBe("123");
    expectDecimalValue(positive.value, "123");
    expect(positive.selection).toEqual({ start: 3, end: 3 });
  });

  it("formats on blur using the format engine and moves caret to the end", () => {
    const state = applyNumberInputText(createNumberInputState(), "1234.5");
    const blurred = formatNumberInputOnBlur(state, {
      locale: "en-US",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    expect(blurred.text).toBe("1,234.50");
    expectDecimalValue(blurred.value, "1234.50");
    expect(blurred.selection).toEqual({ start: 8, end: 8 });
  });

  it("can format grouping while editing without waiting for blur", () => {
    const state = applyNumberInputText(
      createNumberInputState(),
      "1234567.8",
      undefined,
      {
        formatWhileEditing: true,
        locale: "en-US",
        maximumFractionDigits: 2,
      },
    );

    expect(state.text).toBe("1,234,567.8");
    expectDecimalValue(state.value, "1234567.8");
    expect(state.selection).toEqual({ start: 11, end: 11 });
  });

  it("keeps caret intent when live grouping inserts separators", () => {
    const state = applyNumberInputText(
      createNumberInputState(),
      "12345",
      { start: 2, end: 2 },
      {
        formatWhileEditing: true,
        locale: "en-US",
      },
    );

    expect(state.text).toBe("12,345");
    expect(state.selection).toEqual({ start: 2, end: 2 });
  });

  it("supports locale-specific live grouping for money input profiles", () => {
    const options = createMoneyInputOptions("TRY", {
      formatWhileEditing: true,
      locale: "tr-TR",
      useGrouping: true,
    });
    const state = applyNumberInputText(
      createNumberInputState(options),
      "1234567,8",
      undefined,
      options,
    );

    expect(state.text).toBe("1.234.567,8");
    expectMoneyValue(state.value, "1234567.8", "TRY");
  });

  it("supports end-locked live grouping money profiles", () => {
    const options = createMoneyInputOptions("TRY", {
      entryMode: "liveGroupedEndLocked",
      locale: "tr-TR",
    });
    const state = applyNumberInputNativeTextChange(
      createNumberInputState(options),
      "2648",
      options,
    );

    expect(options).toEqual(
      expect.objectContaining({
        caretBehavior: "end",
        formatWhileEditing: true,
        useGrouping: true,
      }),
    );
    expect(state.text).toBe("2.648");
    expectMoneyValue(state.value, "2648", "TRY");
  });

  it("supports minor-unit money entry for cent-first input", () => {
    const options = createMoneyInputOptions("TRY", {
      entryMode: "minorUnits",
      locale: "tr-TR",
    });
    const state = applyNumberInputNativeTextChange(
      createNumberInputState(options),
      "2648",
      options,
    );

    expect(options).toEqual(
      expect.objectContaining({
        allowDecimal: false,
        caretBehavior: "end",
        entryStrategy: "minorUnits",
      }),
    );
    expect(state.text).toBe("26,48");
    expectMoneyValue(state.value, "26.48", "TRY");
    expect(state.selection).toEqual({ start: 5, end: 5 });
  });

  it("supports integer-major money entry with blur-time fraction display", () => {
    const options = createMoneyInputOptions("TRY", {
      entryMode: "integerMajor",
      locale: "tr-TR",
    });
    const state = applyNumberInputNativeTextChange(
      createNumberInputState(options),
      "2648",
      options,
    );
    const blurred = formatNumberInputOnBlur(state, options);

    expect(options).toEqual(
      expect.objectContaining({
        allowDecimal: false,
        caretBehavior: "end",
        entryStrategy: "integerMajor",
      }),
    );
    expect(state.text).toBe("2.648");
    expectMoneyValue(state.value, "2648", "TRY");
    expect(blurred.text).toBe("2.648,00");
  });

  it("continues typing after a live grouping separator is inserted", () => {
    const options = createMoneyInputOptions("TRY", {
      formatWhileEditing: true,
      locale: "tr-TR",
      useGrouping: true,
    });
    const grouped = applyNumberInputNativeTextChange(
      createNumberInputState(options),
      "1234",
      options,
    );
    const continued = applyNumberInputNativeTextChange(
      grouped,
      "1.2345",
      options,
    );

    expect(grouped.text).toBe("1.234");
    expectMoneyValue(grouped.value, "1234", "TRY");
    expect(continued.text).toBe("12.345");
    expectMoneyValue(continued.value, "12345", "TRY");
    expect(continued.selection).toEqual({ start: 6, end: 6 });
  });

  it("repairs stale native end-caret insertions after live grouping", () => {
    const options = createMoneyInputOptions("TRY", {
      formatWhileEditing: true,
      locale: "tr-TR",
      useGrouping: true,
    });
    const grouped = applyNumberInputNativeTextChange(
      createNumberInputState(options),
      "1234",
      options,
    );
    const continued = applyNumberInputNativeTextChange(
      grouped,
      "1.2354",
      options,
    );

    expect(grouped.text).toBe("1.234");
    expect(continued.text).toBe("12.345");
    expectMoneyValue(continued.value, "12345", "TRY");
    expect(continued.selection).toEqual({ start: 6, end: 6 });
  });

  it("keeps canonical money values after multiple live grouping separators", () => {
    const options = createMoneyInputOptions("TRY", {
      formatWhileEditing: true,
      locale: "tr-TR",
      useGrouping: true,
    });
    const state = applyNumberInputNativeTextChange(
      createNumberInputState(options),
      "1234567",
      options,
    );

    expect(state.text).toBe("1.234.567");
    expectMoneyValue(state.value, "1234567", "TRY");
  });

  it("keeps decimal entry available in live grouping mode", () => {
    const options = createMoneyInputOptions("TRY", {
      formatWhileEditing: true,
      locale: "tr-TR",
      useGrouping: true,
    });
    const state = applyNumberInputText(
      createNumberInputState(options),
      "1234.56",
      undefined,
      options,
    );

    expect(state.text).toBe("1.234,56");
    expectMoneyValue(state.value, "1234.56", "TRY");
  });

  it("keeps partial input valid without producing a decimal value", () => {
    const state = applyNumberInputText(createNumberInputState(), "-");

    expect(state.isValid).toBe(true);
    expect(state.value).toBeNull();
    expect(state.error).toBeNull();
  });

  it("clamps explicit selection updates to the current text", () => {
    const state = applyNumberInputText(createNumberInputState(), "123");
    const selected = setNumberInputSelection(state, { start: -5, end: 30 });

    expect(selected.selection).toEqual({ start: 0, end: 3 });
  });

  it("normalizes digits, strips disallowed text, and constrains fraction length", () => {
    expect(
      sanitizeNumberInputText("ab١٢٣,٤٥٦cd", {
        locale: "tr-TR",
        maximumFractionDigits: 2,
      }),
    ).toBe("123,45");
  });

  it("can enforce integer-only and unsigned input", () => {
    const state = applyNumberInputText(
      createNumberInputState(),
      "-123.45",
      undefined,
      {
        allowDecimal: false,
        allowNegative: false,
      },
    );

    expect(state.text).toBe("12345");
    expectDecimalValue(state.value, "12345");
  });

  it("tracks focus, dirty, commit, and reset lifecycle", () => {
    const initial = createNumberInputState({ defaultValue: "12.30" });
    const focused = focusNumberInputState(initial);
    const edited = applyNumberInputText(focused, "45.60");
    const committed = commitNumberInputState(edited);
    const reset = resetNumberInputState(
      applyNumberInputText(committed, "99.99"),
    );

    expect(focused.isFocused).toBe(true);
    expect(edited.isDirty).toBe(true);
    expectDecimalValue(edited.committedValue, "12.30");
    expect(committed.isDirty).toBe(false);
    expectDecimalValue(committed.committedValue, "45.60");
    expect(reset.text).toBe("45.60");
    expect(reset.isDirty).toBe(false);
  });

  it("creates mode-aware money, percent, and unit values", () => {
    const moneyState = applyNumberInputText(
      createNumberInputState({ currency: "TRY", mode: "money" }),
      "1234,5",
      undefined,
      { currency: "TRY", locale: "tr-TR", mode: "money" },
    );
    const percentState = applyNumberInputText(
      createNumberInputState({ mode: "percent" }),
      "12.5",
      undefined,
      { mode: "percent" },
    );
    const unitState = applyNumberInputText(
      createNumberInputState({ mode: "unit", unit: "kilometer" }),
      "8.75",
      undefined,
      { mode: "unit", unit: "kilometer" },
    );

    expect(moneyState.value).toEqual(
      expect.objectContaining({
        amount: "1234.5",
        currency: "TRY",
        kind: "money",
      }),
    );
    expect(percentState.value).toEqual({
      kind: "percent",
      value: "0.125",
    });
    expect(unitState.value).toEqual({
      dimension: "length",
      kind: "unit",
      unit: "kilometer",
      value: "8.75",
    });
  });

  it("uses semantic percent values for default controlled text", () => {
    const state = createNumberInputState({
      defaultValue: "0.125",
      mode: "percent",
      maximumFractionDigits: 1,
    });

    expect(state.text).toBe("12.5");
    expect(state.value).toEqual({
      kind: "percent",
      value: "0.125",
    });
  });
});

describe("createMoneyInputOptions", () => {
  it("creates registry-backed money input profiles", () => {
    expect(createMoneyInputOptions("try", { locale: "tr-TR" })).toEqual(
      expect.objectContaining({
        allowDecimal: true,
        currency: "TRY",
        formatOnBlur: true,
        locale: "tr-TR",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        mode: "money",
      }),
    );
  });

  it("constrains zero-minor currency input unless explicitly overridden", () => {
    const options = createMoneyInputOptions("JPY");

    expect(options).toEqual(
      expect.objectContaining({
        allowDecimal: false,
        currency: "JPY",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }),
    );
    expect(sanitizeNumberInputText("1234.56", options)).toBe("123456");
    expect(
      createNumberInputState({ ...options, defaultValue: "1234" }).value,
    ).toEqual(
      expect.objectContaining({
        amount: "1234",
        currency: "JPY",
        kind: "money",
        minor: 1234n,
      }),
    );
  });

  it("supports three- and four-minor currency profiles", () => {
    expect(createMoneyInputOptions("KWD")).toEqual(
      expect.objectContaining({
        currency: "KWD",
        maximumFractionDigits: 3,
        minimumFractionDigits: 3,
      }),
    );
    expect(createMoneyInputOptions("UYW")).toEqual(
      expect.objectContaining({
        currency: "UYW",
        maximumFractionDigits: 4,
        minimumFractionDigits: 4,
      }),
    );
  });
});

describe("input option profiles", () => {
  it("creates reusable percent input profiles", () => {
    const options = createPercentInputOptions({
      defaultValue: "0.125",
      locale: "tr-TR",
    });
    const state = createNumberInputState(options);

    expect(options).toEqual(
      expect.objectContaining({
        defaultValue: "0.125",
        formatOnBlur: true,
        locale: "tr-TR",
        mode: "percent",
      }),
    );
    expect(state.text).toBe("12,5");
    expect(state.value).toEqual({
      kind: "percent",
      value: "0.125",
    });
  });

  it("creates reusable integer input profiles", () => {
    const options = createIntegerInputOptions({
      allowNegative: false,
      maxInputLength: 6,
    });

    expect(options).toEqual(
      expect.objectContaining({
        allowDecimal: false,
        allowNegative: false,
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
        mode: "decimal",
      }),
    );
    expect(sanitizeNumberInputText("-123.45", options)).toBe("12345");
  });
});

function expectDecimalValue(
  value: NumericValue | null,
  expected: string,
): void {
  expect(value).toEqual(
    expect.objectContaining({
      kind: "decimal",
      value: expected,
    }),
  );
}

function expectMoneyValue(
  value: NumericValue | null,
  amount: string,
  currency: string,
): void {
  expect(value).toEqual(
    expect.objectContaining({
      amount,
      currency,
      kind: "money",
    }),
  );
}
