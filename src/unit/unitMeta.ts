export type UnitDimension =
  | "acceleration"
  | "angle"
  | "area"
  | "data"
  | "density"
  | "electric-current"
  | "electric-potential"
  | "energy"
  | "force"
  | "frequency"
  | "length"
  | "mass"
  | "power"
  | "pressure"
  | "speed"
  | "temperature"
  | "time"
  | "torque"
  | "volume";

export type UnitDisplay = "code" | "long" | "narrow" | "short";

export type UnitLabels = {
  readonly long: {
    readonly one: string;
    readonly other: string;
  };
  readonly narrow: string;
  readonly short: string;
};

export type UnitRegistration = {
  readonly code: string;
  readonly conversionFactorToBase?: string;
  readonly conversionOffsetToBase?: string;
  readonly dimension: UnitDimension | string;
  readonly labels: UnitLabels;
  readonly aliases?: readonly string[];
  readonly localeLabels?: Readonly<Record<string, UnitLabels>>;
  readonly symbol?: string;
};

export type UnitMeta = UnitRegistration & {
  readonly aliases: readonly string[];
  readonly symbol: string;
};
