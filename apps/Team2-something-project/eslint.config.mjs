import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['.next/**/*', '**/out-tsc'],
  },
];
