export { NumeratorError } from "./errors/NumeratorError";
export type { NumeratorErrorCode } from "./errors/errorCodes";
export {
  addDecimal,
  divideDecimal,
  multiplyDecimal,
  subtractDecimal,
} from "./decimal/decimalArithmetic";
export type { DivideDecimalOptions } from "./decimal/decimalArithmetic";
export { DEFAULT_MAX_DECIMAL_INPUT_LENGTH } from "./decimal/decimalConstants";
export { compareDecimal } from "./decimal/compareDecimal";
export { normalizeDecimal } from "./decimal/normalizeDecimal";
export type { DecimalNormalizationOptions } from "./decimal/normalizeDecimal";
export { scaleDecimal } from "./decimal/scaleDecimal";
export { decimal } from "./value/decimal";
export { percent } from "./value/percent";
export {
  safeDecimal,
  safeMoney,
  safePercent,
  safeUnit,
} from "./value/safeConstructors";
export type {
  NumeratorFailure,
  NumeratorResult,
  NumeratorSuccess,
} from "./value/safeConstructors";
export type {
  DecimalInput,
  DecimalValue,
  MoneyValue,
  NumericValue,
  PercentValue,
  UnitValue,
} from "./value/types";
export { unit } from "./value/unit";
export {
  hasScale,
  isDecimal,
  isMoney,
  isNumericValue,
  isPercent,
  isUnit,
  isWithinRange,
} from "./validation/numericGuards";
