import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  eslintPluginPrettierRecommended,
  {
    ignores: [
      '**/*.json',
      '**/dist/',
      '**/package.json',
      '**/package-lock.json',
      '**/examples/**',
      'node_modules/**',
      'jest.config.js',
      'eslint.config.mjs',
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.json'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ['**/*.test.js', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
  {
    rules: {
      'prettier/prettier': 'error',
      curly: ['error', 'multi-line'],
    },
  },
);
