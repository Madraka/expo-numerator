import type {
  ExpoNumeratorNativeModule,
  NumberSeparators,
  PlatformInfo,
} from "../ExpoNumeratorModule.types";

declare const require: (moduleName: string) => unknown;

let cachedNativeModule: ExpoNumeratorNativeModule | null | undefined;

export function getNativePlatformInfo(): PlatformInfo {
  const nativeModule = getNativeModule();

  return (
    nativeModule?.getPlatformInfo() ?? {
      platform: "unknown",
      moduleName: "ExpoNumeratorModule",
      native: false,
    }
  );
}

export function getNativePreferredLocale(): string | null {
  return getNativeModule()?.getPreferredLocale() ?? null;
}

export function getNativeNumberSeparators(
  locale?: string,
): NumberSeparators | null {
  return getNativeModule()?.getNumberSeparators(locale) ?? null;
}

function getNativeModule(): ExpoNumeratorNativeModule | null {
  if (cachedNativeModule !== undefined) {
    return cachedNativeModule;
  }

  try {
    const module = require("../ExpoNumeratorModule") as {
      default?: ExpoNumeratorNativeModule | null;
    };
    cachedNativeModule = module.default ?? null;
  } catch {
    cachedNativeModule = null;
  }

  return cachedNativeModule;
}
