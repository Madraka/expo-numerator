import type { NumeratorErrorCode } from "./errorCodes";

export class NumeratorError extends Error {
  readonly code: NumeratorErrorCode;
  readonly details?: unknown;

  constructor(code: NumeratorErrorCode, details?: unknown, message?: string) {
    super(message ?? code);
    this.name = "NumeratorError";
    this.code = code;
    this.details = details;
  }
}
