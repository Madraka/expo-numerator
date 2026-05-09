# Error Contract

`expo-numerator` exposes paired throwing and safe APIs for public value creation
and parsing.

## Throwing APIs

These APIs return a value on success and throw `NumeratorError` on validation or
parse failure:

- `decimal`, `money`, `percent`, `unit`, `phone`
- `addDecimal`, `subtractDecimal`, `multiplyDecimal`, `divideDecimal`
- `toMinorUnits`, `fromMinorUnits`
- `allocateMinorUnits`, `allocateMoney`
- `parseNumber`, `parseMoney`, `parsePercent`, `parseUnit`, `parsePhone`,
  `parse`

Use them when invalid input is exceptional or when a caller already has a
try/catch boundary.

## Safe APIs

These APIs never throw for expected validation or parse failures. They return a
frozen `NumeratorResult<T>`:

- `safeDecimal`, `safeMoney`, `safePercent`, `safeUnit`, `safePhone`
- `safeParseNumber`, `safeParseMoney`, `safeParsePercent`, `safeParseUnit`,
  `safeParsePhone`, `safeParse`

```ts
const result = safeParseNumber('12,34,567.89', { locale: 'en-US' });

if (result.ok) {
  result.value.value;
} else {
  result.error.code; // "INVALID_GROUPING"
}
```

## Error Codes

Every expected failure is represented by `NumeratorError` with a stable `code`.
The current public code set covers decimal validation, locale, currency and
unit and phone validation, grouping validation, percent misuse, parse failure,
unsupported notation or numbering systems, phone metadata gaps, missing Intl
features, rounding failure, arithmetic failure, range failure, and
native-module unavailability.

Safe APIs preserve original `NumeratorError` instances. Unexpected non-error
throws are normalized to `PARSE_FAILED` with diagnostic details, so public
callers still receive a typed result shape.

## Precision Rule

Neither throwing nor safe APIs silently coerce unsafe JavaScript floats.
Decimals should be passed as strings. JavaScript numbers are accepted only when
they are safe integers.
