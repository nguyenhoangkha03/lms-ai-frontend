import { dirname } from 'path';
import { fileURLToPath } from 'url'; // chuyen doi url thanh path
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url); // import.meta.url la url cua file hien tai
const __dirname = dirname(__filename);

// compatibility
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    'prettier'
  ),
  {
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': (await import('@typescript-eslint/eslint-plugin'))
        .default,
      'react-hooks': (await import('eslint-plugin-react-hooks')).default,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',

      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
];

export default eslintConfig;
