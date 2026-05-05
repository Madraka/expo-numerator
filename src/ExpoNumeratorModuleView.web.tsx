import * as React from 'react';

import { ExpoNumeratorModuleViewProps } from './ExpoNumeratorModule.types';

export default function ExpoNumeratorModuleView(props: ExpoNumeratorModuleViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
