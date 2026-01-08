/** @type {import('jest').Config} */
const baseConfig = require('@3asoftwares/utils/config/jest.backend');

module.exports = {
  ...baseConfig,
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@3asoftwares/types$': '<rootDir>/../../packages/types/src/index.ts',
  },
};
