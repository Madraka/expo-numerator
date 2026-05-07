# expo-numerator-expo-example

## Audience

Maintainers changing the Expo SDK 55 example app, Expo Router showcase pages, or
manual test-center flows.

## When To Use

Use this skill for the example app, Expo SDK 55 compatibility, Expo Router
routes, safe area layout, showcase pages, manual test labs, and app-facing UX.

## Architecture Rules

- Keep the example app on the Expo SDK 55 compatibility line and let
  `example:expo-check` stay strict.
- Use Expo Router page files for showcase areas. Keep route-level demos small
  enough that behavior is easy to test.
- Use safe-area-aware scaffolds and avoid passing style arrays directly to
  Expo Router `Link` children.
- The showcase is both a product vitrine and a manual test center. Public
  features should be visible as clear, focused pages.
- Keep controls real and interactive. Avoid placeholder demos that do not
  exercise the package API.
- Add stable `testID` selectors for important showcase scenarios.

## Verification

```sh
npm run example:typecheck
npm run example:doctor
npm run example:expo-check
npm run showcase:contract
```
