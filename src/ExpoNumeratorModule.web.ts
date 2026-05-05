import { registerWebModule, NativeModule } from 'expo';

import { ExpoNumeratorModuleEvents } from './ExpoNumeratorModule.types';

class ExpoNumeratorModule extends NativeModule<ExpoNumeratorModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoNumeratorModule, 'ExpoNumeratorModule');
