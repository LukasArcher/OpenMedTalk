import js from '@eslint/js';
import ts from 'typescript-eslint';
export default ts.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.expo/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ['**/*.cjs'],
    languageOptions: {
      globals: { require: 'readonly', module: 'readonly', __dirname: 'readonly' },
    },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
  {
    files: ['apps/mobile/src/**/*.{ts,tsx}', 'packages/**/*.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'Intl',
          property: 'DisplayNames',
          message: 'Hermes has no DisplayNames constructor. Use the versioned language-name data.',
        },
      ],
    },
  },
);
