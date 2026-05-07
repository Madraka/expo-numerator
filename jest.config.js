const expoModulePreset = require('expo-module-scripts/jest-preset');

const nodeProject = expoModulePreset.projects.find(
  (project) => project.displayName?.name === 'Node'
);

module.exports = {
  ...nodeProject,
  prettierPath: expoModulePreset.prettierPath,
};

