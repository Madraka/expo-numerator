# expo-numerator-phone

## Audience

Maintainers changing E.164 phone values, country calling-code metadata, phone
formatting, mobile-first validation, React Native phone input, country picker
behavior, or phone example screens.

## When To Use

Use this skill for `src/phone`, generated phone metadata, phone parse/format
APIs, `PhoneInput`, `PhoneCountryPicker`, phone replay fixtures, and `/phone`
showcase work.

## Architecture Rules

- Store and emit canonical phone numbers as E.164 strings.
- Use RFC3966 only for `tel:` link output, not as the internal value shape.
- Keep phone formatting region-based; locale may affect country names and
  search labels but not numbering-plan grouping.
- Default form validation should be mobile-first while preserving tolerant
  partial input states during editing.
- Do not claim reachability or ownership from metadata validation. Verification
  by SMS or voice remains an application concern.
- Keep generated metadata checked in and script-verified. Refresh global source
  with `node scripts/generate-phone-metadata.js --refresh-source`, then run
  `npm run generate:phone-metadata`.
- Runtime phone APIs must not require a direct third-party formatter dependency.

## Verification

```sh
npm run phone:metadata
npm run input:replay
npm run typecheck
npm test -- --runInBand
```
