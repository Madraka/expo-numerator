import { parsePhone, safeParsePhone } from "./parsePhone";
import type { PhoneParseOptions, PhoneValue } from "./phoneTypes";

export function phone(
  input: string | PhoneValue,
  options: PhoneParseOptions = {},
): PhoneValue {
  return parsePhone(input, options);
}

export { safeParsePhone as safePhone };
