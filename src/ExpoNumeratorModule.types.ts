export type PlatformName = "ios" | "android" | "web" | "unknown";

export type PlatformInfo = {
  platform: PlatformName;
  moduleName: "ExpoNumeratorModule";
  native: boolean;
};

export type NumberSeparators = {
  decimal: string;
  grouping: string;
};

export type ExpoNumeratorNativeModule = {
  getPlatformInfo(): PlatformInfo;
  getPreferredLocale(): string | null;
  getNumberSeparators(locale?: string): NumberSeparators;
};
