import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import checkFile from 'eslint-plugin-check-file';

// ============ Architecture Rules - Cross-feature import restrictions ============
const featureRestrictions = {
  auth: [
    '@/features/tickets',
    '@/features/tickets/*',
    '@/features/users',
    '@/features/users/*',
    '@/features/dashboard',
    '@/features/dashboard/*',
  ],
  tickets: [
    '@/features/auth',
    '@/features/auth/*',
    '@/features/users',
    '@/features/users/*',
    '@/features/dashboard',
    '@/features/dashboard/*',
  ],
  users: [
    '@/features/auth',
    '@/features/auth/*',
    '@/features/tickets',
    '@/features/tickets/*',
    '@/features/dashboard',
    '@/features/dashboard/*',
  ],
  dashboard: ['@/features/auth', '@/features/auth/*'],
};

export default tseslint.config(
  // Base JS config
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.browser },
  }, // TypeScript config
  ...tseslint.configs.recommended, // React config
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+ JSX transform
    },
  }, // ============ Architecture Rules ============
  {
    name: 'architecture/auth-feature',
    files: ['src/features/auth/**/*.ts', 'src/features/auth/**/*.tsx'],
    rules: {
      'no-restricted-imports': ['error', { patterns: featureRestrictions.auth }],
    },
  },
  {
    name: 'architecture/tickets-feature',
    files: ['src/features/tickets/**/*.ts', 'src/features/tickets/**/*.tsx'],
    rules: {
      'no-restricted-imports': ['error', { patterns: featureRestrictions.tickets }],
    },
  },
  {
    name: 'architecture/users-feature',
    files: ['src/features/users/**/*.ts', 'src/features/users/**/*.tsx'],
    rules: {
      'no-restricted-imports': ['error', { patterns: featureRestrictions.users }],
    },
  },
  {
    name: 'architecture/dashboard-feature',
    files: ['src/features/dashboard/**/*.ts', 'src/features/dashboard/**/*.tsx'],
    rules: {
      'no-restricted-imports': ['error', { patterns: featureRestrictions.dashboard }],
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
        { patterns: ['@/features', '@/features/*', '@/app', '@/app/*'] },
      ],
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
