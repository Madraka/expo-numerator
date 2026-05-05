import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoNumeratorModuleViewProps } from './ExpoNumeratorModule.types';

const NativeView: React.ComponentType<ExpoNumeratorModuleViewProps> =
  requireNativeView('ExpoNumeratorModule');

export default function ExpoNumeratorModuleView(props: ExpoNumeratorModuleViewProps) {
  return <NativeView {...props} />;
}
