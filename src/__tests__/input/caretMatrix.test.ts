import {
  applyNumberInputEdit,
  applyNumberInputNativeTextChange,
  applyNumberInputText,
  createNumberInputState,
  sanitizeNumberInputText,
  setNumberInputSelection,
} from "../../index";
import type { NumericValue } from "../../index";

describe("number input caret acceptance matrix", () => {
  it("inserts digits before the decimal separator and preserves caret intent", () => {
    const state = applyNumberInputText(createNumberInputState(), "12.34", {
      start: 2,
      end: 2,
    });
    const next = applyNumberInputEdit(state, { replacementText: "9" });

    expect(next.text).toBe("129.34");
    expectDecimalValue(next.value, "129.34");
    expect(next.selection).toEqual({ start: 3, end: 3 });
  });

  it("replaces a selected range across integer and fraction text", () => {
    const state = setNumberInputSelection(
      applyNumberInputText(createNumberInputState(), "1234.56"),
      {
        start: 2,
        end: 6,
      },
    );
    const next = applyNumberInputEdit(state, { replacementText: "9" });

    expect(next.text).toBe("1296");
    expectDecimalValue(next.value, "1296");
    expect(next.selection).toEqual({ start: 3, end: 3 });
  });

  it("maps pasted decimal separators to the active locale", () => {
    const state = applyNumberInputText(
      createNumberInputState({ locale: "tr-TR" }),
      "12.",
      undefined,
      { locale: "tr-TR" },
    );

    expect(state.text).toBe("12,");
    expectDecimalValue(state.value, "12");
    expect(state.selection).toEqual({ start: 3, end: 3 });
  });

  it("normalizes minus pasted after digits into a leading sign", () => {
    const state = applyNumberInputText(createNumberInputState(), "123-");

    expect(state.text).toBe("-123");
    expectDecimalValue(state.value, "-123");
    expect(state.selection).toEqual({ start: 4, end: 4 });
  });

  it("honors max input length during sanitize", () => {
    expect(
      sanitizeNumberInputText("123456789", {
        maxInputLength: 4,
      }),
    ).toBe("1234");
  });

  it("keeps deletion at the beginning from producing negative selection indexes", () => {
    const state = setNumberInputSelection(
      applyNumberInputText(createNumberInputState(), "123"),
      {
        start: 0,
        end: 1,
      },
    );
    const next = applyNumberInputEdit(state, { replacementText: "" });

    expect(next.text).toBe("23");
    expect(next.selection).toEqual({ start: 0, end: 0 });
  });

  it("replays native TextInput text changes with inferred edit positions", () => {
    const state = applyNumberInputText(
      createNumberInputState({ locale: "tr-TR" }),
      "12,34",
      { start: 2, end: 2 },
      { locale: "tr-TR" },
    );
    const inserted = applyNumberInputNativeTextChange(state, "129,34", {
      locale: "tr-TR",
    });
    const pasted = applyNumberInputNativeTextChange(inserted, "129,3456", {
      locale: "tr-TR",
      maximumFractionDigits: 2,
    });

    expect(inserted.text).toBe("129,34");
    expect(inserted.selection).toEqual({ start: 3, end: 3 });
    expect(pasted.text).toBe("129,34");
    expect(pasted.selection).toEqual({ start: 6, end: 6 });
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
