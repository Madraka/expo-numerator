import { NativeModule, registerWebModule } from "expo";

import type {
  NumberSeparators,
  PlatformInfo,
} from "./ExpoNumeratorModule.types";

class ExpoNumeratorModule extends NativeModule {
  getPlatformInfo(): PlatformInfo {
    return {
      platform: "web",
      moduleName: "ExpoNumeratorModule",
      native: false,
    };
  }

  getPreferredLocale(): string | null {
    if (typeof navigator === "undefined") {
      return null;
    }

    return navigator.languages?.[0] ?? navigator.language ?? null;
  }

  getNumberSeparators(locale?: string): NumberSeparators {
    const parts = new Intl.NumberFormat(locale).formatToParts(1234.5);

    return {
      decimal: parts.find((part) => part.type === "decimal")?.value ?? ".",
      grouping: parts.find((part) => part.type === "group")?.value ?? ",",
    };
  }
}

export default registerWebModule(ExpoNumeratorModule, "ExpoNumeratorModule");
