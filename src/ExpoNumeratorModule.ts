import { NativeModule, requireNativeModule } from 'expo';

import { ExpoNumeratorModuleEvents } from './ExpoNumeratorModule.types';

declare class ExpoNumeratorModule extends NativeModule<ExpoNumeratorModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoNumeratorModule>('ExpoNumeratorModule');
