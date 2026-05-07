import { requireOptionalNativeModule } from "expo";

import type { ExpoNumeratorNativeModule } from "./ExpoNumeratorModule.types";

export default requireOptionalNativeModule<ExpoNumeratorNativeModule>(
  "ExpoNumeratorModule",
);
