import type { PhoneParseOptions, PhoneValue } from "./phoneTypes";

export type PhoneVerificationChannel = "sms" | "whatsapp" | "voice";

export type PhoneVerificationPurpose =
  | "signIn"
  | "signUp"
  | "phoneChange"
  | "mfa"
  | "recovery";

export type PhoneVerificationStatus =
  | "idle"
  | "ready"
  | "sending"
  | "sent"
  | "checking"
  | "verified"
  | "failed"
  | "expired"
  | "rateLimited"
  | "cancelled";

export type PhoneVerificationErrorCode =
  | "INVALID_DESTINATION"
  | "UNSUPPORTED_CHANNEL"
  | "UNSUPPORTED_REGION"
  | "RATE_LIMITED"
  | "CODE_INVALID"
  | "CODE_EXPIRED"
  | "TOO_MANY_ATTEMPTS"
  | "DELIVERY_UNAVAILABLE"
  | "FRAUD_BLOCKED"
  | "PROVIDER_UNAVAILABLE"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export type PhoneVerificationError = {
  readonly code: PhoneVerificationErrorCode;
  readonly message?: string;
  readonly retryAfterMs?: number;
  readonly details?: unknown;
};

export type PhoneVerificationPolicy = {
  readonly allowedChannels?: readonly PhoneVerificationChannel[];
  readonly defaultChannel?: PhoneVerificationChannel;
  readonly codeLength?: number;
  readonly expiresInMs?: number;
  readonly resendDelayMs?: number;
  readonly maxAttempts?: number;
  readonly maxSends?: number;
  readonly allowShortCode?: boolean;
  readonly allowNonGeographic?: boolean;
};

export type PhoneVerificationRateLimitScope = {
  readonly phoneE164?: string;
  readonly countryCallingCode?: string;
  readonly sessionId?: string;
  readonly userId?: string;
  readonly deviceId?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly custom?: Record<string, string>;
};

export type PhoneVerificationClientContext = Record<
  string,
  string | number | boolean | null
>;

export type PhoneVerificationRequestOptions = {
  readonly locale?: string;
  readonly metadataProfile?: PhoneParseOptions["metadataProfile"];
  readonly idempotencyKey?: string;
  readonly rateLimitKey?: string;
  readonly rateLimitScope?: PhoneVerificationRateLimitScope;
  readonly clientContext?: PhoneVerificationClientContext;
};

export type PhoneVerificationStateOptions = PhoneParseOptions & {
  readonly phone?: string | PhoneValue | null;
  readonly channel?: PhoneVerificationChannel;
  readonly purpose?: PhoneVerificationPurpose;
  readonly policy?: PhoneVerificationPolicy;
  readonly now?: number;
};

export type PhoneVerificationState = {
  readonly status: PhoneVerificationStatus;
  readonly phone: PhoneValue | null;
  readonly channel: PhoneVerificationChannel;
  readonly purpose: PhoneVerificationPurpose;
  readonly sessionId: string | null;
  readonly code: string;
  readonly codeLength: number;
  readonly maskedDestination: string | null;
  readonly startedAt: number | null;
  readonly expiresAt: number | null;
  readonly resendAvailableAt: number | null;
  readonly attemptsRemaining: number | null;
  readonly sendsRemaining: number | null;
  readonly error: PhoneVerificationError | null;
};

export type PhoneVerificationStartRequest = {
  readonly phoneE164: string;
  readonly channel: PhoneVerificationChannel;
  readonly purpose: PhoneVerificationPurpose;
  readonly locale?: PhoneVerificationRequestOptions["locale"];
  readonly metadataProfile?: PhoneVerificationRequestOptions["metadataProfile"];
  readonly idempotencyKey?: PhoneVerificationRequestOptions["idempotencyKey"];
  readonly rateLimitKey?: PhoneVerificationRequestOptions["rateLimitKey"];
  readonly rateLimitScope?: PhoneVerificationRequestOptions["rateLimitScope"];
  readonly clientContext?: PhoneVerificationRequestOptions["clientContext"];
};

export type PhoneVerificationCheckRequest = {
  readonly sessionId: string;
  readonly code: string;
  readonly phoneE164?: string;
  readonly purpose?: PhoneVerificationPurpose;
  readonly idempotencyKey?: PhoneVerificationRequestOptions["idempotencyKey"];
  readonly rateLimitKey?: PhoneVerificationRequestOptions["rateLimitKey"];
  readonly rateLimitScope?: PhoneVerificationRequestOptions["rateLimitScope"];
  readonly clientContext?: PhoneVerificationRequestOptions["clientContext"];
};

export type PhoneVerificationResendRequest = {
  readonly sessionId: string;
  readonly phoneE164: string;
  readonly channel: PhoneVerificationChannel;
  readonly purpose: PhoneVerificationPurpose;
  readonly locale?: PhoneVerificationRequestOptions["locale"];
  readonly metadataProfile?: PhoneVerificationRequestOptions["metadataProfile"];
  readonly idempotencyKey?: PhoneVerificationRequestOptions["idempotencyKey"];
  readonly rateLimitKey?: PhoneVerificationRequestOptions["rateLimitKey"];
  readonly rateLimitScope?: PhoneVerificationRequestOptions["rateLimitScope"];
  readonly clientContext?: PhoneVerificationRequestOptions["clientContext"];
};

export type PhoneVerificationStartResponse = {
  readonly status?: "sent" | "rateLimited" | "failed";
  readonly sessionId?: string;
  readonly channel?: PhoneVerificationChannel;
  readonly maskedDestination?: string;
  readonly expiresAt?: number;
  readonly resendAvailableAt?: number;
  readonly attemptsRemaining?: number;
  readonly sendsRemaining?: number;
  readonly error?: PhoneVerificationError;
};

export type PhoneVerificationCheckResponse = {
  readonly status:
    | "verified"
    | "invalid"
    | "expired"
    | "rateLimited"
    | "failed";
  readonly verifiedAt?: number;
  readonly attemptsRemaining?: number;
  readonly error?: PhoneVerificationError;
};

export type PhoneVerificationResendResponse = {
  readonly status?: "sent" | "rateLimited" | "failed";
  readonly sessionId?: string;
  readonly channel?: PhoneVerificationChannel;
  readonly maskedDestination?: string;
  readonly expiresAt?: number;
  readonly resendAvailableAt?: number;
  readonly attemptsRemaining?: number;
  readonly sendsRemaining?: number;
  readonly error?: PhoneVerificationError;
};

export type PhoneOtpInputTextInputProps = {
  readonly value: string;
  readonly onChangeText: (text: string) => void;
  readonly onFocus: () => void;
  readonly onBlur: () => void;
};

export type UsePhoneVerificationResult = PhoneVerificationState & {
  readonly inputProps: PhoneOtpInputTextInputProps;
  readonly setCode: (code: string) => void;
  readonly markSending: () => void;
  readonly applyStart: (
    response: PhoneVerificationStartResponse,
    options?: {
      readonly now?: number;
      readonly policy?: PhoneVerificationPolicy;
    },
  ) => void;
  readonly markChecking: () => void;
  readonly applyCheck: (response: PhoneVerificationCheckResponse) => void;
  readonly applyResend: (
    response: PhoneVerificationResendResponse,
    options?: {
      readonly now?: number;
      readonly policy?: PhoneVerificationPolicy;
    },
  ) => void;
  readonly expire: (now?: number) => void;
  readonly cancel: () => void;
  readonly reset: (options?: PhoneVerificationStateOptions) => void;
  readonly canSubmit: boolean;
  readonly canResend: (now?: number) => boolean;
  readonly createStartRequest: (options?: {
    readonly locale?: string;
    readonly metadataProfile?: PhoneVerificationStateOptions["metadataProfile"];
    readonly idempotencyKey?: PhoneVerificationRequestOptions["idempotencyKey"];
    readonly rateLimitKey?: PhoneVerificationRequestOptions["rateLimitKey"];
    readonly rateLimitScope?: PhoneVerificationRequestOptions["rateLimitScope"];
    readonly clientContext?: PhoneVerificationRequestOptions["clientContext"];
  }) => PhoneVerificationStartRequest;
  readonly createCheckRequest: (options?: {
    readonly idempotencyKey?: PhoneVerificationRequestOptions["idempotencyKey"];
    readonly rateLimitKey?: PhoneVerificationRequestOptions["rateLimitKey"];
    readonly rateLimitScope?: PhoneVerificationRequestOptions["rateLimitScope"];
    readonly clientContext?: PhoneVerificationRequestOptions["clientContext"];
  }) => PhoneVerificationCheckRequest;
  readonly createResendRequest: (options?: {
    readonly locale?: string;
    readonly metadataProfile?: PhoneVerificationStateOptions["metadataProfile"];
    readonly idempotencyKey?: PhoneVerificationRequestOptions["idempotencyKey"];
    readonly rateLimitKey?: PhoneVerificationRequestOptions["rateLimitKey"];
    readonly rateLimitScope?: PhoneVerificationRequestOptions["rateLimitScope"];
    readonly clientContext?: PhoneVerificationRequestOptions["clientContext"];
  }) => PhoneVerificationResendRequest;
};
