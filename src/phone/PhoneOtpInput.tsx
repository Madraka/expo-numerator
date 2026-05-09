import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import type { ComponentType, Ref } from "react";
import type {
  TextInput as TextInputInstance,
  TextInputProps,
} from "react-native";

import { setPhoneVerificationCode } from "./phoneVerificationState";
import { usePhoneVerification } from "./usePhoneVerification";
import type {
  PhoneVerificationState,
  PhoneVerificationStateOptions,
} from "./verificationTypes";

declare const require: (moduleName: string) => unknown;

type TextInputComponent = ComponentType<
  TextInputProps & {
    ref?: Ref<TextInputInstance>;
  }
>;

export type PhoneOtpInputProps = Omit<
  TextInputProps,
  "defaultValue" | "maxLength" | "value"
> &
  PhoneVerificationStateOptions & {
    readonly verificationState?: PhoneVerificationState;
    readonly onVerificationStateChange?: (
      state: PhoneVerificationState,
    ) => void;
    readonly onCodeChange?: (
      code: string,
      state: PhoneVerificationState,
    ) => void;
    readonly onComplete?: (code: string, state: PhoneVerificationState) => void;
    readonly textInputComponent?: TextInputComponent;
  };

let cachedTextInput: TextInputComponent | null = null;

export const PhoneOtpInput = forwardRef<TextInputInstance, PhoneOtpInputProps>(
  function PhoneOtpInput(props, ref) {
    const {
      channel,
      defaultRegion,
      includeNonGeographic,
      metadataProfile,
      onBlur,
      onChangeText,
      onCodeChange,
      onComplete,
      onFocus,
      onVerificationStateChange,
      phone,
      policy,
      purpose,
      textInputComponent,
      validationMode,
      verificationState,
      keyboardType = "number-pad",
      autoComplete = "one-time-code",
      textContentType = "oneTimeCode",
      ...textInputProps
    } = props;
    const internal = usePhoneVerification({
      channel,
      defaultRegion,
      includeNonGeographic,
      metadataProfile,
      phone,
      policy,
      purpose,
      validationMode,
    });
    const current = verificationState ?? internal;
    const callbackRef = useRef({
      onCodeChange,
      onComplete,
      onVerificationStateChange,
    });
    const lastCompletedCodeRef = useRef<string | null>(null);
    const publicState = useMemo(
      () => toPhoneVerificationState(current),
      [
        current.attemptsRemaining,
        current.channel,
        current.code,
        current.codeLength,
        current.error,
        current.expiresAt,
        current.maskedDestination,
        current.phone,
        current.purpose,
        current.resendAvailableAt,
        current.sendsRemaining,
        current.sessionId,
        current.startedAt,
        current.status,
      ],
    );

    useEffect(() => {
      callbackRef.current = {
        onCodeChange,
        onComplete,
        onVerificationStateChange,
      };
    }, [onCodeChange, onComplete, onVerificationStateChange]);

    useEffect(() => {
      callbackRef.current.onVerificationStateChange?.(publicState);
      callbackRef.current.onCodeChange?.(publicState.code, publicState);

      if (publicState.code.length === publicState.codeLength) {
        const completionKey = getCompletionKey(publicState);

        if (lastCompletedCodeRef.current === completionKey) {
          return;
        }

        lastCompletedCodeRef.current = completionKey;
        callbackRef.current.onComplete?.(publicState.code, publicState);
      } else {
        lastCompletedCodeRef.current = null;
      }
    }, [publicState]);

    const TextInput = textInputComponent ?? getTextInputComponent();

    return React.createElement(TextInput, {
      ...textInputProps,
      ref,
      autoComplete,
      keyboardType,
      maxLength: current.codeLength,
      textContentType,
      value: current.code,
      onBlur: (event) => {
        onBlur?.(event);
      },
      onChangeText: (text) => {
        const next = setPhoneVerificationCode(current, text);

        if (verificationState === undefined) {
          internal.setCode(text);
        } else {
          onVerificationStateChange?.(next);
          onCodeChange?.(next.code, next);

          if (next.code.length === next.codeLength) {
            lastCompletedCodeRef.current = getCompletionKey(next);
            onComplete?.(next.code, next);
          } else {
            lastCompletedCodeRef.current = null;
          }
        }

        onChangeText?.(next.code);
      },
      onFocus: (event) => {
        onFocus?.(event);
      },
    });
  },
);

function getTextInputComponent(): TextInputComponent {
  if (cachedTextInput === null) {
    const reactNative = require("react-native") as {
      TextInput: TextInputComponent;
    };
    cachedTextInput = reactNative.TextInput;
  }

  return cachedTextInput;
}

function getCompletionKey(state: PhoneVerificationState): string {
  return `${state.sessionId ?? "no-session"}:${state.code}`;
}

function toPhoneVerificationState(
  state: PhoneVerificationState,
): PhoneVerificationState {
  return {
    status: state.status,
    phone: state.phone,
    channel: state.channel,
    purpose: state.purpose,
    sessionId: state.sessionId,
    code: state.code,
    codeLength: state.codeLength,
    maskedDestination: state.maskedDestination,
    startedAt: state.startedAt,
    expiresAt: state.expiresAt,
    resendAvailableAt: state.resendAvailableAt,
    attemptsRemaining: state.attemptsRemaining,
    sendsRemaining: state.sendsRemaining,
    error: state.error,
  };
}
