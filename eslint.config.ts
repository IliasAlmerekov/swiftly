import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';
import checkFile from 'eslint-plugin-check-file';

const architectureZones = [
  {
    target: './src/features/auth',
    from: ['./src/features/tickets', './src/features/users', './src/features/dashboard'],
    message: 'auth feature must not import other features.',
  },
  {
    target: './src/features/tickets',
    from: ['./src/features/auth', './src/features/users', './src/features/dashboard'],
    message: 'tickets feature must not import other features.',
  },
  {
    target: './src/features/users',
    from: ['./src/features/auth', './src/features/tickets', './src/features/dashboard'],
    message: 'users feature must not import other features.',
  },
  {
    target: './src/features/dashboard',
    from: ['./src/features/auth', './src/features/tickets', './src/features/users'],
    message: 'dashboard feature must not import other features.',
  },
  {
    target: './src/shared',
    from: ['./src/features', './src/app'],
    message: 'shared layer must not import features or app.',
  },
  {
    target: './src/config',
    from: ['./src/features', './src/app'],
    message: 'config layer must not import features or app.',
  },
  {
    target: './src/features',
    from: './src/app',
    message: 'features layer must not import app layer.',
  },
];

export default tseslint.config(
  // Ignore CommonJS config files and build output
  {
    ignores: ['**/*.cjs', 'dist/**', 'coverage/**', 'playwright-report/**'],
  },
  // Base JS config
  {
    files: ['**/*.{js,mjs,ts,mts,cts,jsx,tsx}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.browser },
  }, // TypeScript config
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  // TypeScript config
  ...tseslint.configs.recommended, // React config
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    plugins: {
      ...pluginReact.configs.flat.recommended.plugins,
      'react-hooks': pluginReactHooks,
      'react-refresh': pluginReactRefresh,
    },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+ JSX transform
      'react/prop-types': 'off', // TypeScript handles prop validation
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  }, // ============ Architecture Rules ============
  {
    name: 'architecture/no-restricted-paths',
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          basePath: '.',
          zones: architectureZones,
        },
      ],
      'import/no-cycle': 'error',
    },
  }, // Shared modules should not import from features or app
  {
    name: 'architecture/shared-modules',
    files: [
      'src/shared/**/*.ts',
      'src/shared/**/*.tsx',
      'src/config/**/*.ts',
      'src/config/**/*.tsx',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['@/features', '@/features/**', '@/app', '@/app/**'] },
      ],
    },
  },
  {
    name: 'architecture/features-no-app-imports',
    files: ['src/features/**/*.ts', 'src/features/**/*.tsx'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['@/app', '@/app/**'] }],
    },
  }, // ============ File Naming Convention ============
  {
    name: 'conventions/file-naming',
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    plugins: {
      'check-file': checkFile,
    },
    rules: {
      'check-file/folder-naming-convention': ['warn', { 'src/**/': 'KEBAB_CASE' }],
    },
  },
);
