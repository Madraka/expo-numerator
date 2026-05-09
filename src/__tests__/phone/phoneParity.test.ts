import {
  formatPhone,
  getPhoneExampleNumber,
  parsePhone,
  safeParsePhone,
} from "../../index";
import type { PhoneNumberType, PhoneRegionCode } from "../../phone";

declare const require: (moduleName: string) => any;

const google = require("google-libphonenumber");
const libPhoneNumberMax = require("libphonenumber-js/max");
const googlePhoneUtil = google.PhoneNumberUtil.getInstance();
const googleFormat = google.PhoneNumberFormat;
const googleType = google.PhoneNumberType;

const GOOGLE_TYPE_TO_PHONE_TYPE = new Map<number, PhoneNumberType>([
  [googleType.FIXED_LINE, "FIXED_LINE"],
  [googleType.MOBILE, "MOBILE"],
  [googleType.FIXED_LINE_OR_MOBILE, "FIXED_LINE_OR_MOBILE"],
  [googleType.TOLL_FREE, "TOLL_FREE"],
  [googleType.PREMIUM_RATE, "PREMIUM_RATE"],
  [googleType.SHARED_COST, "SHARED_COST"],
  [googleType.VOIP, "VOIP"],
  [googleType.PERSONAL_NUMBER, "PERSONAL_NUMBER"],
  [googleType.PAGER, "PAGER"],
  [googleType.UAN, "UAN"],
  [googleType.VOICEMAIL, "VOICEMAIL"],
  [googleType.UNKNOWN, "UNKNOWN"],
]);

const PARITY_REGIONS: readonly PhoneRegionCode[] = [
  "TR",
  "US",
  "CA",
  "GB",
  "DE",
  "FR",
  "IN",
  "JP",
  "BR",
  "AU",
  "MX",
  "ZA",
  "CN",
  "KR",
  "AE",
  "AF",
  "AD",
];

describe("phone libphonenumber parity", () => {
  it.each(PARITY_REGIONS)(
    "matches Google mobile example parse/format/type for %s",
    (region) => {
      const e164 = getPhoneExampleNumber(region, { type: "mobile" });
      const ours = parsePhone(e164, {
        includeNonGeographic: true,
        metadataProfile: "max",
        validationMode: "strict",
      });
      const oracle = googlePhoneUtil.parse(e164);
      const expectedType = GOOGLE_TYPE_TO_PHONE_TYPE.get(
        googlePhoneUtil.getNumberType(oracle),
      );

      expect(ours.e164).toBe(googlePhoneUtil.format(oracle, googleFormat.E164));
      expect(ours.isPossible).toBe(googlePhoneUtil.isPossibleNumber(oracle));
      expect(ours.isValid).toBe(googlePhoneUtil.isValidNumber(oracle));
      expect(ours.type).toBe(expectedType);
      expect(formatPhone(ours, { format: "international", region })).toBe(
        googlePhoneUtil.format(oracle, googleFormat.INTERNATIONAL),
      );
      expect(formatPhone(ours, { format: "national", region })).toBe(
        googlePhoneUtil.format(oracle, googleFormat.NATIONAL),
      );
    },
  );

  it("keeps shared calling-code candidates aligned with Google validity", () => {
    const cases = [
      ["+12015550123", "US"],
      ["+14165550123", "CA"],
      ["+77012345678", "KZ"],
      ["+74951234567", "RU"],
      ["+590690001234", "GP"],
    ] as const;

    for (const [e164, region] of cases) {
      const ours = parsePhone(e164, {
        defaultRegion: region,
        includeNonGeographic: true,
        metadataProfile: "max",
        validationMode: "strict",
      });
      const oracle = googlePhoneUtil.parse(e164, region);

      expect(ours.e164).toBe(googlePhoneUtil.format(oracle, googleFormat.E164));
      expect(ours.isValid).toBe(googlePhoneUtil.isValidNumber(oracle));
      expect(ours.possibleRegions).toContain(region);
    }
  });

  it("supports required non-geographic global service codes", () => {
    const cases = [
      "+80012345678",
      "+80812345678",
      "+870301234567",
      "+878101234567890",
      "+881612345678",
      "+8823421234",
      "+883510012345",
      "+88812345678901",
      "+979123456789",
    ];

    for (const e164 of cases) {
      const ours = safeParsePhone(e164, {
        includeNonGeographic: true,
        metadataProfile: "max",
        validationMode: "strict",
      });
      const oracle = googlePhoneUtil.parse(e164);

      expect(ours.ok).toBe(true);
      expect(ours.ok ? ours.value.isValid : false).toBe(
        googlePhoneUtil.isValidNumber(oracle),
      );
    }
  });

  it("matches libphonenumber-js max smoke behavior for selected examples", () => {
    for (const region of ["TR", "GB", "DE", "FR", "JP"] as const) {
      const e164 = getPhoneExampleNumber(region, { type: "mobile" });
      const ours = parsePhone(e164, {
        metadataProfile: "max",
        validationMode: "strict",
      });
      const secondary = libPhoneNumberMax.parsePhoneNumberFromString(e164);

      expect(secondary?.number).toBe(ours.e164);
      expect(secondary?.isValid()).toBe(ours.isValid);
      expect(secondary?.formatInternational()).toContain(
        ours.countryCallingCode,
      );
    }
  });
});
