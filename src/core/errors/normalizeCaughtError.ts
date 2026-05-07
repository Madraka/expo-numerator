import { NumeratorError } from "./NumeratorError";

export function normalizeCaughtError(
  error: unknown,
  reason: string,
): NumeratorError {
  if (error instanceof NumeratorError) {
    return error;
  }

  return new NumeratorError("PARSE_FAILED", {
    reason,
    error,
  });
}
