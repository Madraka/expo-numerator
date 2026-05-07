export type ShowcaseRoute =
  | "/"
  | "/values"
  | "/currency"
  | "/units"
  | "/locale"
  | "/rounding"
  | "/format"
  | "/parse"
  | "/errors"
  | "/input"
  | "/expo"
  | "/package"
  | "/hardening";

export type ShowcasePage = {
  readonly href: ShowcaseRoute;
  readonly id: string;
  readonly title: string;
  readonly caption: string;
};

export const showcasePages: ShowcasePage[] = [
  {
    href: "/",
    id: "overview",
    title: "Overview",
    caption: "Surface map",
  },
  {
    href: "/values",
    id: "values",
    title: "Values",
    caption: "Decimal, money, percent, unit",
  },
  {
    href: "/currency",
    id: "currency",
    title: "Currency",
    caption: "ISO money registry",
  },
  {
    href: "/units",
    id: "units",
    title: "Units",
    caption: "Measurement registry",
  },
  {
    href: "/locale",
    id: "locale",
    title: "Locale",
    caption: "Symbols, digits, grouping",
  },
  {
    href: "/rounding",
    id: "rounding",
    title: "Rounding",
    caption: "String engine modes",
  },
  {
    href: "/format",
    id: "format",
    title: "Format",
    caption: "Locale, compact, parts",
  },
  {
    href: "/parse",
    id: "parse",
    title: "Parse",
    caption: "Strict, loose, safe",
  },
  {
    href: "/errors",
    id: "errors",
    title: "Errors",
    caption: "Typed failures",
  },
  {
    href: "/input",
    id: "input",
    title: "Input Lab",
    caption: "Caret and lifecycle",
  },
  {
    href: "/expo",
    id: "expo",
    title: "Expo",
    caption: "Provider and native fallback",
  },
  {
    href: "/package",
    id: "package",
    title: "Package",
    caption: "Exports and smoke gates",
  },
  {
    href: "/hardening",
    id: "hardening",
    title: "Hardening",
    caption: "Release gates",
  },
];

export const localeOptions = [
  "en-US",
  "tr-TR",
  "de-DE",
  "fr-FR",
  "en-IN",
  "ja-JP",
] as const;
