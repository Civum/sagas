import baseConfig from '@sagas/eslint-config/base';
import nextjsConfig from '@sagas/eslint-config/nextjs';
import reactConfig from '@sagas/eslint-config/react';

export default [
  { ignores: ['.next/**'] },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
];
