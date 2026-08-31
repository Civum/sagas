import baseConfig from '@sagas/eslint-config/base';

export default [
  { ignores: ['states/**'] },
  ...baseConfig,
  {
    // `!` is normal in tests, where you've already asserted the thing exists.
    files: ['test/**/*.ts', 'conformance/**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    },
  },
];
