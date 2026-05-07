# Currency Registry

The built-in registry is a dependency-free ISO 4217 seed for money values,
formatting, parsing, and input profiles.

## Source Policy

- The seed follows the ISO 4217 list shape: alphabetic code, numeric code,
  currency name, and minor unit.
- The current seed was checked against the SIX ISO 4217 list-one XML published
  for `2026-01-01`.
- Entries without a numeric minor-unit value, such as precious metal or testing
  codes with `N.A.` minor units, stay out of the built-in money seed.
- Common symbols are ergonomic display metadata only. The canonical identity is
  always the alphabetic currency code and numeric code.

## Runtime Contract

- `money(value, currency)` normalizes the currency code and reads the registered
  minor unit.
- `minor` is emitted only when the decimal amount fits the currency minor unit
  exactly. The library does not round money during construction.
- `registerCurrency` remains available for app-owned ledger units, crypto assets,
  or provider-specific policy overrides.
- Exchange rates, tender timelines, settlement exceptions, and payment-provider
  rounding rules are intentionally not core registry concerns.

## Release Gate

`npm run currency:registry` builds the package and checks the publishable CJS
entrypoint for:

- 150+ registered currency entries.
- Unique alphabetic and numeric codes.
- ISO minor units in the built-in 0 to 4 range.
- Required zero-, three-, and four-minor-unit currencies.
- Runtime money minor-unit behavior.
- Parser symbol mismatch protection for ambiguous money input.
