// Reexport the native module. On web, it will be resolved to ExpoNumeratorModule.web.ts
// and on native platforms to ExpoNumeratorModule.ts
export { default } from './ExpoNumeratorModule';
export { default as ExpoNumeratorModuleView } from './ExpoNumeratorModuleView';
export * from  './ExpoNumeratorModule.types';
