import { useCallback, useMemo, useState } from "react";

import {
  applyPhoneVerificationCheck,
  applyPhoneVerificationResend,
  applyPhoneVerificationStart,
  canResendPhoneVerification,
  canSubmitPhoneVerification,
  cancelPhoneVerificationState,
  createPhoneVerificationCheckRequest,
  createPhoneVerificationResendRequest,
  createPhoneVerificationStartRequest,
  createPhoneVerificationState,
  expirePhoneVerificationState,
  markPhoneVerificationChecking,
  markPhoneVerificationSending,
  setPhoneVerificationCode,
} from "./phoneVerificationState";
import type {
  PhoneVerificationCheckResponse,
  PhoneVerificationPolicy,
  PhoneVerificationRequestOptions,
  PhoneVerificationResendResponse,
  PhoneVerificationStartResponse,
  PhoneVerificationStateOptions,
  UsePhoneVerificationResult,
} from "./verificationTypes";

export function usePhoneVerification(
  options: PhoneVerificationStateOptions = {},
): UsePhoneVerificationResult {
  const [state, setState] = useState(() =>
    createPhoneVerificationState(options),
  );

  const setCode = useCallback((code: string) => {
    setState((current) => setPhoneVerificationCode(current, code));
  }, []);

  const markSending = useCallback(() => {
    setState((current) => markPhoneVerificationSending(current));
  }, []);

  const applyStart = useCallback(
    (
      response: PhoneVerificationStartResponse,
      applyOptions: {
        readonly now?: number;
        readonly policy?: PhoneVerificationPolicy;
      } = {},
    ) => {
      setState((current) =>
        applyPhoneVerificationStart(current, response, applyOptions),
      );
    },
    [],
  );

  const markChecking = useCallback(() => {
    setState((current) => markPhoneVerificationChecking(current));
  }, []);

  const applyCheck = useCallback((response: PhoneVerificationCheckResponse) => {
    setState((current) => applyPhoneVerificationCheck(current, response));
  }, []);

  const applyResend = useCallback(
    (
      response: PhoneVerificationResendResponse,
      applyOptions: {
        readonly now?: number;
        readonly policy?: PhoneVerificationPolicy;
      } = {},
    ) => {
      setState((current) =>
        applyPhoneVerificationResend(current, response, applyOptions),
      );
    },
    [],
  );

  const expire = useCallback((now?: number) => {
    setState((current) => expirePhoneVerificationState(current, now));
  }, []);

  const cancel = useCallback(() => {
    setState((current) => cancelPhoneVerificationState(current));
  }, []);

  const reset = useCallback(
    (resetOptions: PhoneVerificationStateOptions = options) => {
      setState(createPhoneVerificationState(resetOptions));
    },
    [options],
  );

  const createStartRequest = useCallback(
    (requestOptions: PhoneVerificationRequestOptions = {}) =>
      createPhoneVerificationStartRequest(state, requestOptions),
    [state],
  );

  const createCheckRequest = useCallback(
    (
      requestOptions: Omit<
        PhoneVerificationRequestOptions,
        "locale" | "metadataProfile"
      > = {},
    ) => createPhoneVerificationCheckRequest(state, requestOptions),
    [state],
  );

  const createResendRequest = useCallback(
    (requestOptions: PhoneVerificationRequestOptions = {}) =>
      createPhoneVerificationResendRequest(state, requestOptions),
    [state],
  );

  const inputProps = useMemo(
    () => ({
      value: state.code,
      onChangeText: setCode,
      onFocus() {
        // Reserved for parity with other input hooks.
      },
      onBlur() {
        // Reserved for parity with other input hooks.
      },
    }),
    [setCode, state.code],
  );

  return {
    ...state,
    inputProps,
    setCode,
    markSending,
    applyStart,
    markChecking,
    applyCheck,
    applyResend,
    expire,
    cancel,
    reset,
    canSubmit: canSubmitPhoneVerification(state),
    canResend(now?: number) {
      return canResendPhoneVerification(state, now);
    },
    createStartRequest,
    createCheckRequest,
    createResendRequest,
  };
}
