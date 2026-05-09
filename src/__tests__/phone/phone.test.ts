import {
  applyPhoneInputNativeTextChange,
  applyPhoneInputText,
  commitPhoneInputState,
  createPhoneInputState,
  formatPhone,
  getCountryCallingCode,
  getPhoneCountries,
  getPhoneCountryMeta,
  getPhoneExampleNumber,
  getPhoneMetadataInfo,
  isMobileEligiblePhoneNumber,
  isPossiblePhoneNumber,
  isValidPhoneNumber,
  parsePhone,
  phone,
  safeParsePhone,
} from "../../index";

describe("phone domain", () => {
  it("parses and formats E.164, national, international, and RFC3966 output", () => {
    const value = parsePhone("+905012345678");

    expect(value.e164).toBe("+905012345678");
    expect(value.region).toBe("TR");
    expect(value.type).toBe("MOBILE");
    expect(formatPhone(value, { format: "e164" })).toBe("+905012345678");
    expect(formatPhone(value, { format: "rfc3966" })).toBe("tel:+905012345678");
    expect(formatPhone(value, { format: "international" })).toBe(
      "+90 501 234 56 78",
    );
    expect(formatPhone(value, { format: "national" })).toBe("0501 234 56 78");
  });

  it("handles shared NANP calling codes without hiding ambiguity", () => {
    const value = parsePhone("+12015550123", {
      defaultRegion: "US",
      validationMode: "mobile",
    });

    expect(value.countryCallingCode).toBe("1");
    expect(value.possibleRegions).toEqual(expect.arrayContaining(["CA", "US"]));
    expect(value.type).toBe("FIXED_LINE_OR_MOBILE");
    expect(formatPhone(value, { format: "national", region: "US" })).toBe(
      "(201) 555-0123",
    );
  });

  it("parses representative mobile numbers across regions", () => {
    const cases = [
      ["TR", "05012345678", "+905012345678"],
      ["US", "2015550123", "+12015550123"],
      ["GB", "07400123456", "+447400123456"],
      ["DE", "015123456789", "+4915123456789"],
      ["FR", "0612345678", "+33612345678"],
      ["IN", "8123456789", "+918123456789"],
      ["JP", "09012345678", "+819012345678"],
    ] as const;

    for (const [region, input, expected] of cases) {
      expect(parsePhone(input, { defaultRegion: region }).e164).toBe(expected);
    }
  });

  it("returns typed safe failures for unsupported regions and invalid numbers", () => {
    expect(safeParsePhone("123", { defaultRegion: "ZZ" }).ok).toBe(false);
    expect(
      safeParsePhone("+905012345678999999", {
        validationMode: "possible",
      }).ok,
    ).toBe(false);
    expect(
      safeParsePhone("2123456789", {
        defaultRegion: "TR",
        validationMode: "mobile",
      }).ok,
    ).toBe(false);
    expect(
      safeParsePhone("2123456789", {
        defaultRegion: "TR",
        validationMode: "strict",
      }).ok,
    ).toBe(true);
  });

  it("normalizes non-Latin digits in pasted phone input", () => {
    expect(parsePhone("+٩٠٥٠١٢٣٤٥٦٧٨").e164).toBe("+905012345678");
  });

  it("exposes country metadata and examples", () => {
    expect(getPhoneMetadataInfo().authorityUrl).toBe(
      "https://www.itu.int/rec/T-REC-E.164/en",
    );
    expect(getPhoneMetadataInfo().countryCount).toBeGreaterThan(240);
    expect(getPhoneMetadataInfo("lite").profile).toBe("lite");
    expect(getPhoneMetadataInfo("mobile").sizeHintBytes).toBeGreaterThan(
      getPhoneMetadataInfo("lite").sizeHintBytes,
    );
    expect(getPhoneMetadataInfo("max").sizeHintBytes).toBeGreaterThan(
      getPhoneMetadataInfo("mobile").sizeHintBytes,
    );
    expect(getCountryCallingCode("TR")).toBe("90");
    expect(getCountryCallingCode("AF")).toBe("93");
    expect(getPhoneCountryMeta("US").countryCallingCode).toBe("1");
    expect(getPhoneExampleNumber("GB")).toBe("+447400123456");
    expect(getPhoneExampleNumber("TR", { type: "fixedLine" })).toBe(
      "+902123456789",
    );
    expect(getPhoneExampleNumber("US", { type: "tollFree" })).toBe(
      "+18002345678",
    );
    expect(getPhoneCountries().length).toBeGreaterThan(200);
    expect(getPhoneCountries({ preferredRegions: ["TR"] })[0].region).toBe(
      "TR",
    );
  });

  it("uses global calling-code metadata beyond the initial enhanced set", () => {
    const afghanistan = parsePhone("+93701234567");
    const andorra = parsePhone("+376312345");

    expect(afghanistan.region).toBe("AF");
    expect(afghanistan.isMobileEligible).toBe(true);
    expect(formatPhone(andorra, { format: "e164" })).toBe("+376312345");
  });

  it("offers possible, strict, and mobile eligibility helpers", () => {
    expect(isPossiblePhoneNumber("02123456789", { defaultRegion: "TR" })).toBe(
      true,
    );
    expect(isValidPhoneNumber("02123456789", { defaultRegion: "TR" })).toBe(
      true,
    );
    expect(
      isMobileEligiblePhoneNumber("02123456789", { defaultRegion: "TR" }),
    ).toBe(false);
    expect(phone("+905012345678").isMobileEligible).toBe(true);
  });

  it("keeps phone input partial drafts tolerant and commits completed values", () => {
    const options = { defaultRegion: "TR" };
    const partial = applyPhoneInputNativeTextChange(
      createPhoneInputState(options),
      "+90",
      options,
    );
    const complete = applyPhoneInputNativeTextChange(
      partial,
      "05012345678",
      options,
    );

    expect(partial.isValid).toBe(true);
    expect(partial.value).toBeNull();
    expect(complete.value?.e164).toBe("+905012345678");
    expect(commitPhoneInputState(complete).isDirty).toBe(false);
  });

  it("keeps caret stable when live phone formatting inserts spaces", () => {
    const options = { defaultRegion: "TR" };
    const state = createPhoneInputState(options);
    const fourthSignificantDigit = applyPhoneInputText(
      state,
      "05012",
      { start: 5, end: 5 },
      options,
    );
    const groupedPrefix = applyPhoneInputText(
      fourthSignificantDigit,
      "0501234",
      { start: 7, end: 7 },
      options,
    );

    expect(fourthSignificantDigit.text).toBe("501 2");
    expect(fourthSignificantDigit.selection).toEqual({ start: 5, end: 5 });
    expect(groupedPrefix.text).toBe("501 234");
    expect(groupedPrefix.selection).toEqual({ start: 7, end: 7 });
  });

  it("keeps digit-index caret stable across regional as-you-type patterns", () => {
    const cases = [
      ["TR", "05012345678"],
      ["US", "2015550123"],
      ["GB", "07400123456"],
      ["DE", "015123456789"],
      ["FR", "0612345678"],
      ["IN", "8123456789"],
      ["JP", "09012345678"],
    ] as const;

    for (const [region, input] of cases) {
      let state = createPhoneInputState({ defaultRegion: region });

      for (const digit of input) {
        const raw =
          state.text.slice(0, state.selection.start) +
          digit +
          state.text.slice(state.selection.end);
        state = applyPhoneInputText(
          state,
          raw,
          { start: state.selection.start + 1, end: state.selection.start + 1 },
          { defaultRegion: region },
        );
      }

      expect(countDigitsBeforeCaret(state.text, state.selection.start)).toBe(
        countDigitsBeforeCaret(state.text, state.text.length),
      );
      expect(state.selection.start).toBe(state.text.length);
    }
  });

  it("handles backspace, mid-string insert, paste, and selection replace without caret drift", () => {
    const options = { defaultRegion: "TR" };
    const pasted = applyPhoneInputText(
      createPhoneInputState(options),
      "05012345678",
      { start: 11, end: 11 },
      options,
    );
    const middleInsert = applyPhoneInputText(
      pasted,
      "501 923 45 67 8",
      { start: 5, end: 5 },
      options,
    );
    const backspace = applyPhoneInputText(
      middleInsert,
      "501 234 56 78",
      { start: 4, end: 4 },
      options,
    );
    const replaced = applyPhoneInputText(
      backspace,
      "555 234 56 78",
      { start: 3, end: 3 },
      options,
    );

    expect(pasted.text).toBe("0501 234 56 78");
    expect(pasted.selection.start).toBe(pasted.text.length);
    expect(middleInsert.selection.start).toBeGreaterThanOrEqual(5);
    expect(backspace.selection.start).toBeGreaterThanOrEqual(4);
    expect(replaced.text).toBe("0555 234 56 78");
    expect(replaced.selection).toEqual({ start: 4, end: 4 });
  });
});

function countDigitsBeforeCaret(text: string, caret: number): number {
  return Array.from(text.slice(0, caret)).filter((character) =>
    /\d/.test(character),
  ).length;
}
