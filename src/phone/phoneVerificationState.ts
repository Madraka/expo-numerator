import { normalizePhoneText, parsePhone, safeParsePhone } from "./parsePhone";
import type { PhoneValue } from "./phoneTypes";
import type {
  PhoneVerificationChannel,
  PhoneVerificationCheckRequest,
  PhoneVerificationCheckResponse,
  PhoneVerificationClientContext,
  PhoneVerificationError,
  PhoneVerificationPolicy,
  PhoneVerificationPurpose,
  PhoneVerificationRateLimitScope,
  PhoneVerificationRequestOptions,
  PhoneVerificationResendRequest,
  PhoneVerificationResendResponse,
  PhoneVerificationStartRequest,
  PhoneVerificationStartResponse,
  PhoneVerificationState,
  PhoneVerificationStateOptions,
} from "./verificationTypes";
import { NumeratorError } from "../core/errors/NumeratorError";

const DEFAULT_CODE_LENGTH = 6;
const DEFAULT_EXPIRES_IN_MS = 10 * 60 * 1000;
const DEFAULT_RESEND_DELAY_MS = 30 * 1000;
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_MAX_SENDS = 3;
const MIN_CODE_LENGTH = 6;
const MIN_SHORT_CODE_LENGTH = 4;
const MAX_CODE_LENGTH = 10;
const MIN_EXPIRES_IN_MS = 30 * 1000;
const MAX_EXPIRES_IN_MS = 10 * 60 * 1000;
const MIN_RESEND_DELAY_MS = 5 * 1000;
const MAX_RESEND_DELAY_MS = 10 * 60 * 1000;
const MIN_COUNTER = 1;
const MAX_ATTEMPTS = 100;
const MAX_SENDS = 20;
const DEFAULT_CHANNEL: PhoneVerificationChannel = "sms";
const DEFAULT_PURPOSE: PhoneVerificationPurpose = "signIn";
const DEFAULT_ALLOWED_CHANNELS: readonly PhoneVerificationChannel[] = [
  "sms",
  "whatsapp",
  "voice",
];

export function createPhoneVerificationState(
  options: PhoneVerificationStateOptions = {},
): PhoneVerificationState {
  const policy = getPhoneVerificationPolicy(options.policy);
  const channel = normalizeVerificationChannel(
    options.channel ?? policy.defaultChannel,
    policy,
  );
  const codeLength = policy.codeLength;
  const parsedPhone =
    options.phone === undefined || options.phone === null
      ? null
      : safeParsePhone(options.phone, {
          defaultRegion: options.defaultRegion,
          includeNonGeographic: policy.allowNonGeographic,
          metadataProfile: options.metadataProfile,
          validationMode: options.validationMode ?? "mobile",
        });

  if (parsedPhone !== null && !parsedPhone.ok) {
    return freezeVerificationState({
      status: "failed",
      phone: null,
      channel,
      purpose: options.purpose ?? DEFAULT_PURPOSE,
      sessionId: null,
      code: "",
      codeLength,
      maskedDestination: null,
      startedAt: null,
      expiresAt: null,
      resendAvailableAt: null,
      attemptsRemaining: policy.maxAttempts,
      sendsRemaining: policy.maxSends,
      error: {
        code: "INVALID_DESTINATION",
        details: parsedPhone.error,
      },
    });
  }

  return freezeVerificationState({
    status: parsedPhone === null ? "idle" : "ready",
    phone: parsedPhone?.value ?? null,
    channel,
    purpose: options.purpose ?? DEFAULT_PURPOSE,
    sessionId: null,
    code: "",
    codeLength,
    maskedDestination:
      parsedPhone !== null ? maskPhoneForVerification(parsedPhone.value) : null,
    startedAt: null,
    expiresAt: null,
    resendAvailableAt: null,
    attemptsRemaining: policy.maxAttempts,
    sendsRemaining: policy.maxSends,
    error: null,
  });
}

export function createPhoneVerificationStartRequest(
  state: PhoneVerificationState,
  options: PhoneVerificationRequestOptions = {},
): PhoneVerificationStartRequest {
  if (state.phone === null) {
    throw new NumeratorError("INVALID_PHONE_NUMBER", {
      reason: "Phone verification requires a parsed phone value.",
    });
  }

  return freezeWithRequestOptions(
    {
      phoneE164: state.phone.e164,
      channel: state.channel,
      purpose: state.purpose,
    },
    state,
    options,
  );
}

export function createPhoneVerificationCheckRequest(
  state: PhoneVerificationState,
  options: Omit<
    PhoneVerificationRequestOptions,
    "locale" | "metadataProfile"
  > = {},
): PhoneVerificationCheckRequest {
  if (state.sessionId === null || state.sessionId.length === 0) {
    throw new NumeratorError("INVALID_PHONE_NUMBER", {
      reason: "Phone verification check requires a backend session id.",
    });
  }

  if (!canSubmitPhoneVerification(state)) {
    throw new NumeratorError("INVALID_PHONE_NUMBER", {
      reason: "Phone verification check requires a complete OTP code.",
    });
  }

  return freezeWithRequestOptions(
    {
      sessionId: state.sessionId,
      code: state.code,
      phoneE164: state.phone?.e164,
      purpose: state.purpose,
    },
    state,
    options,
  );
}

export function createPhoneVerificationResendRequest(
  state: PhoneVerificationState,
  options: PhoneVerificationRequestOptions = {},
): PhoneVerificationResendRequest {
  if (state.sessionId === null || state.sessionId.length === 0) {
    throw new NumeratorError("INVALID_PHONE_NUMBER", {
      reason: "Phone verification resend requires a backend session id.",
    });
  }

  if (state.phone === null) {
    throw new NumeratorError("INVALID_PHONE_NUMBER", {
      reason: "Phone verification resend requires a parsed phone value.",
    });
  }

  return freezeWithRequestOptions(
    {
      sessionId: state.sessionId,
      phoneE164: state.phone.e164,
      channel: state.channel,
      purpose: state.purpose,
    },
    state,
    options,
  );
}

export function markPhoneVerificationSending(
  state: PhoneVerificationState,
): PhoneVerificationState {
  if (state.phone === null) {
    return failPhoneVerificationState(state, {
      code: "INVALID_DESTINATION",
    });
  }

  return freezeVerificationState({
    ...state,
    status: "sending",
    error: null,
  });
}

export function applyPhoneVerificationStart(
  state: PhoneVerificationState,
  response: PhoneVerificationStartResponse,
  options: {
    readonly now?: number;
    readonly policy?: PhoneVerificationPolicy;
  } = {},
): PhoneVerificationState {
  const policy = getPhoneVerificationPolicy(options.policy);
  const now = options.now ?? Date.now();

  if (response.status === "rateLimited") {
    return failPhoneVerificationState(state, response.error, "rateLimited");
  }

  if (response.status === "failed") {
    return failPhoneVerificationState(state, response.error);
  }

  return freezeVerificationState({
    ...state,
    status: "sent",
    sessionId: response.sessionId ?? state.sessionId,
    channel: response.channel ?? state.channel,
    code: "",
    maskedDestination:
      response.maskedDestination ?? state.maskedDestination ?? null,
    startedAt: state.startedAt ?? now,
    expiresAt: response.expiresAt ?? now + policy.expiresInMs,
    resendAvailableAt: response.resendAvailableAt ?? now + policy.resendDelayMs,
    attemptsRemaining: response.attemptsRemaining ?? state.attemptsRemaining,
    sendsRemaining:
      response.sendsRemaining ?? decrementNullable(state.sendsRemaining),
    error: null,
  });
}

export function setPhoneVerificationCode(
  state: PhoneVerificationState,
  code: string,
): PhoneVerificationState {
  return freezeVerificationState({
    ...state,
    code: normalizePhoneText(code).slice(0, state.codeLength),
    error: null,
  });
}

export function markPhoneVerificationChecking(
  state: PhoneVerificationState,
): PhoneVerificationState {
  if (!canSubmitPhoneVerification(state)) {
    return failPhoneVerificationState(state, {
      code: "CODE_INVALID",
    });
  }

  return freezeVerificationState({
    ...state,
    status: "checking",
    error: null,
  });
}

export function applyPhoneVerificationCheck(
  state: PhoneVerificationState,
  response: PhoneVerificationCheckResponse,
): PhoneVerificationState {
  if (response.status === "verified") {
    return freezeVerificationState({
      ...state,
      status: "verified",
      attemptsRemaining: response.attemptsRemaining ?? state.attemptsRemaining,
      error: null,
    });
  }

  if (response.status === "expired") {
    return failPhoneVerificationState(
      {
        ...state,
        attemptsRemaining:
          response.attemptsRemaining ?? state.attemptsRemaining,
      },
      response.error ?? { code: "CODE_EXPIRED" },
      "expired",
    );
  }

  if (response.status === "rateLimited") {
    return failPhoneVerificationState(state, response.error, "rateLimited");
  }

  const error =
    response.error ??
    (response.status === "invalid"
      ? { code: "CODE_INVALID" as const }
      : { code: "UNKNOWN" as const });

  return failPhoneVerificationState(
    {
      ...state,
      attemptsRemaining: response.attemptsRemaining ?? state.attemptsRemaining,
    },
    error,
  );
}

export function applyPhoneVerificationResend(
  state: PhoneVerificationState,
  response: PhoneVerificationResendResponse,
  options: {
    readonly now?: number;
    readonly policy?: PhoneVerificationPolicy;
  } = {},
): PhoneVerificationState {
  const policy = getPhoneVerificationPolicy(options.policy);
  const now = options.now ?? Date.now();

  if (response.status === "rateLimited") {
    return failPhoneVerificationState(state, response.error, "rateLimited");
  }

  if (response.status === "failed") {
    return failPhoneVerificationState(state, response.error);
  }

  return freezeVerificationState({
    ...state,
    status: "sent",
    sessionId: response.sessionId ?? state.sessionId,
    channel: response.channel ?? state.channel,
    code: "",
    maskedDestination:
      response.maskedDestination ?? state.maskedDestination ?? null,
    expiresAt: response.expiresAt ?? now + policy.expiresInMs,
    resendAvailableAt: response.resendAvailableAt ?? now + policy.resendDelayMs,
    attemptsRemaining: response.attemptsRemaining ?? state.attemptsRemaining,
    sendsRemaining:
      response.sendsRemaining ?? decrementNullable(state.sendsRemaining),
    error: null,
  });
}

export function expirePhoneVerificationState(
  state: PhoneVerificationState,
  now = Date.now(),
): PhoneVerificationState {
  if (state.expiresAt === null || now < state.expiresAt) {
    return state;
  }

  return failPhoneVerificationState(state, { code: "CODE_EXPIRED" }, "expired");
}

export function cancelPhoneVerificationState(
  state: PhoneVerificationState,
): PhoneVerificationState {
  return freezeVerificationState({
    ...state,
    status: "cancelled",
    code: "",
    error: null,
  });
}

export function canSubmitPhoneVerification(
  state: PhoneVerificationState,
): boolean {
  return (
    state.status === "sent" &&
    state.sessionId !== null &&
    state.code.length === state.codeLength
  );
}

export function canResendPhoneVerification(
  state: PhoneVerificationState,
  now = Date.now(),
): boolean {
  return (
    state.status === "sent" &&
    state.sessionId !== null &&
    (state.sendsRemaining === null || state.sendsRemaining > 0) &&
    state.resendAvailableAt !== null &&
    now >= state.resendAvailableAt
  );
}

export function maskPhoneForVerification(phone: string | PhoneValue): string {
  const value = typeof phone === "string" ? parsePhone(phone) : phone;
  const digits = value.e164.slice(1);
  const visibleStart = digits.slice(0, Math.min(3, digits.length));
  const visibleEnd = digits.slice(-2);
  const hiddenLength = Math.max(0, digits.length - visibleStart.length - 2);

  return `+${visibleStart}${"*".repeat(hiddenLength)}${visibleEnd}`;
}

function getPhoneVerificationPolicy(
  policy: PhoneVerificationPolicy = {},
): Required<PhoneVerificationPolicy> {
  const allowedChannels =
    policy.allowedChannels !== undefined && policy.allowedChannels.length > 0
      ? policy.allowedChannels
      : DEFAULT_ALLOWED_CHANNELS;
  const defaultChannel =
    policy.defaultChannel !== undefined &&
    allowedChannels.includes(policy.defaultChannel)
      ? policy.defaultChannel
      : (allowedChannels[0] ?? DEFAULT_CHANNEL);
  const allowShortCode = policy.allowShortCode ?? false;

  return {
    allowedChannels,
    defaultChannel,
    codeLength: clampInteger(
      policy.codeLength,
      DEFAULT_CODE_LENGTH,
      allowShortCode ? MIN_SHORT_CODE_LENGTH : MIN_CODE_LENGTH,
      MAX_CODE_LENGTH,
    ),
    expiresInMs: clampInteger(
      policy.expiresInMs,
      DEFAULT_EXPIRES_IN_MS,
      MIN_EXPIRES_IN_MS,
      MAX_EXPIRES_IN_MS,
    ),
    resendDelayMs: clampInteger(
      policy.resendDelayMs,
      DEFAULT_RESEND_DELAY_MS,
      MIN_RESEND_DELAY_MS,
      MAX_RESEND_DELAY_MS,
    ),
    maxAttempts: clampInteger(
      policy.maxAttempts,
      DEFAULT_MAX_ATTEMPTS,
      MIN_COUNTER,
      MAX_ATTEMPTS,
    ),
    maxSends: clampInteger(
      policy.maxSends,
      DEFAULT_MAX_SENDS,
      MIN_COUNTER,
      MAX_SENDS,
    ),
    allowShortCode,
    allowNonGeographic: policy.allowNonGeographic ?? false,
  };
}

function normalizeVerificationChannel(
  channel: PhoneVerificationChannel,
  policy: Required<PhoneVerificationPolicy>,
): PhoneVerificationChannel {
  return policy.allowedChannels.includes(channel)
    ? channel
    : policy.defaultChannel;
}

function failPhoneVerificationState(
  state: PhoneVerificationState,
  error: PhoneVerificationError | undefined,
  status: "failed" | "expired" | "rateLimited" = "failed",
): PhoneVerificationState {
  return freezeVerificationState({
    ...state,
    status,
    error: error ?? { code: "UNKNOWN" },
  });
}

function decrementNullable(value: number | null): number | null {
  if (value === null) {
    return null;
  }

  return Math.max(0, value - 1);
}

function freezeVerificationState(
  state: PhoneVerificationState,
): PhoneVerificationState {
  return Object.freeze(state);
}

function freezeWithRequestOptions<T extends Record<string, unknown>>(
  request: T,
  state: PhoneVerificationState,
  options: PhoneVerificationRequestOptions,
): Readonly<T> {
  const enriched: Record<string, unknown> = {
    ...request,
    ...getDefinedRequestFields(options),
  };
  const rateLimitScope = getPhoneVerificationRateLimitScope(state, options);

  if (Object.keys(rateLimitScope).length > 0) {
    enriched.rateLimitScope = rateLimitScope;
  }

  return Object.freeze(enriched) as Readonly<T>;
}

function getDefinedRequestFields(
  options: PhoneVerificationRequestOptions,
): Record<string, unknown> {
  const fields: Record<string, unknown> = {};

  if (options.locale !== undefined) {
    fields.locale = options.locale;
  }

  if (options.metadataProfile !== undefined) {
    fields.metadataProfile = options.metadataProfile;
  }

  if (options.idempotencyKey !== undefined) {
    fields.idempotencyKey = options.idempotencyKey;
  }

  if (options.rateLimitKey !== undefined) {
    fields.rateLimitKey = options.rateLimitKey;
  }

  if (options.clientContext !== undefined) {
    fields.clientContext = freezeClientContext(options.clientContext);
  }

  return fields;
}

function getPhoneVerificationRateLimitScope(
  state: PhoneVerificationState,
  options: PhoneVerificationRequestOptions,
): PhoneVerificationRateLimitScope {
  const base: PhoneVerificationRateLimitScope = {
    phoneE164: state.phone?.e164,
    countryCallingCode: state.phone?.countryCallingCode,
    sessionId: state.sessionId ?? undefined,
  };
  const scope = options.rateLimitScope ?? {};
  const merged: PhoneVerificationRateLimitScope = {
    ...base,
    ...scope,
    custom:
      scope.custom !== undefined
        ? Object.freeze({ ...scope.custom })
        : undefined,
  };

  return dropUndefinedFields(merged);
}

function freezeClientContext(
  context: PhoneVerificationClientContext,
): PhoneVerificationClientContext {
  return Object.freeze({ ...context });
}

function dropUndefinedFields<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}

function clampInteger(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.trunc(value)));
}
