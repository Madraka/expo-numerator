import type { NumberInputOptions } from "./numberInputTypes";
import { getCurrencyMeta } from "../money/currencyRegistry";

export type MoneyInputEntryMode =
  | "plain"
  | "liveGroupedEndLocked"
  | "minorUnits"
  | "integerMajor";

export type MoneyInputOptions = Omit<
  NumberInputOptions,
  "currency" | "entryStrategy" | "mode"
> & {
  entryMode?: MoneyInputEntryMode;
};

export function createMoneyInputOptions(
  currencyCode: string,
  options: MoneyInputOptions = {},
): NumberInputOptions {
  const meta = getCurrencyMeta(currencyCode);
  const { entryMode = "plain", ...inputOptions } = options;
  const strategyOptions = getMoneyEntryModeOptions(entryMode);

  return {
    ...inputOptions,
    ...strategyOptions,
    allowDecimal:
      inputOptions.allowDecimal ??
      (entryMode === "minorUnits" || entryMode === "integerMajor"
        ? false
        : meta.minorUnit > 0),
    currency: meta.code,
    formatOnBlur: inputOptions.formatOnBlur ?? true,
    maximumFractionDigits: inputOptions.maximumFractionDigits ?? meta.minorUnit,
    minimumFractionDigits: inputOptions.minimumFractionDigits ?? meta.minorUnit,
    mode: "money",
  };
}

function getMoneyEntryModeOptions(
  entryMode: MoneyInputEntryMode,
): NumberInputOptions {
  if (entryMode === "liveGroupedEndLocked") {
    return {
      caretBehavior: "end",
      formatWhileEditing: true,
      useGrouping: true,
    };
  }

  if (entryMode === "minorUnits") {
    return {
      caretBehavior: "end",
      entryStrategy: "minorUnits",
      useGrouping: true,
    };
  }

  if (entryMode === "integerMajor") {
    return {
      caretBehavior: "end",
      entryStrategy: "integerMajor",
      useGrouping: true,
    };
  }

  return {};
}
