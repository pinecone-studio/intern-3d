import nextEslintPluginNext from '@next/eslint-plugin-next';
import nx from '@nx/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import noSecretsPlugin from 'eslint-plugin-no-secrets';
import promisePlugin from 'eslint-plugin-promise';
import reactPlugin from 'eslint-plugin-react';
import spellcheckPlugin from 'eslint-plugin-spellcheck';
import unicornPlugin from 'eslint-plugin-unicorn';
import typescriptEslint from 'typescript-eslint';
import baseConfig from '../../eslint.config.mjs';
import { defaultDepConstraints, nextAppEntryFiles, timelineDepConstraints } from './eslint-config-parts.mjs';

const kebabCaseRule = ['error', { case: 'kebabCase' }];
const camelCaseFileRule = ['error', { case: 'camelCase' }];
const componentComplexityRule = { complexity: ['error', { max: 20 }] };

export default [
  { plugins: { '@next/next': nextEslintPluginNext, '@typescript-eslint': typescriptEslint.plugin, import: importPlugin, 'no-secrets': noSecretsPlugin, promise: promisePlugin, react: reactPlugin, spellcheck: spellcheckPlugin, unicorn: unicornPlugin }, settings: { react: { version: 'detect' } } },
  ...baseConfig,
  ...nx.configs['flat/react-typescript'],
  { ignores: ['.next/**/*', '.open-next/**/*', '.wrangler/**/*', '**/out-tsc', 'cloudflare-env.d.ts', 'src/graphql/generated.ts'] },
  { files: ['**/_components/**/*.{ts,tsx,js,jsx}', '**/_features/**/*.{ts,tsx,js,jsx}'], rules: { 'import/no-default-export': 'error' } },
  { files: ['**/*.jsx', '**/*.tsx'], ignores: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx', '**/*.cy.ts', '**/*.cy.tsx'], rules: { 'react/function-component-definition': 'off' } },
  { files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'], rules: { 'max-lines': ['error', { max: 160, skipBlankLines: true, skipComments: true }], camelcase: ['error', { properties: 'always' }], '@nx/enforce-module-boundaries': ['error', { enforceBuildableLibDependency: true, allow: [], depConstraints: defaultDepConstraints }] } },
  { files: ['**/*.jsx', '**/*.tsx'], rules: { 'unicorn/prefer-module': 'off', 'unicorn/filename-case': kebabCaseRule, 'react/function-component-definition': 'off' } },
  { files: nextAppEntryFiles, rules: { 'unicorn/prefer-module': 'off', 'unicorn/filename-case': kebabCaseRule } },
  { files: ['**/use[A-Z]*.js', '**/use[A-Z]*.ts'], rules: { 'unicorn/prefer-module': 'off', 'unicorn/filename-case': camelCaseFileRule } },
  { files: ['**/*.native.tsx', '**/*.cy.ts', '**/*.cy.tsx', '**/*.spec.ts', '**/*.spec.tsx'], rules: { 'unicorn/filename-case': 'off' } },
  { files: ['**/*.tsx'], ignores: ['**/app/**', '**/components/ui/**'], rules: componentComplexityRule },
  { files: ['**/*.ts'], ignores: ['**/app/**', '**/components/ui/**'], rules: componentComplexityRule },
  { files: ['**/*.ts', '**/*.tsx'], rules: { 'no-unused-vars': ['error', { vars: 'all', args: 'after-used', argsIgnorePattern: '^_', ignoreRestSiblings: true }], 'no-magic-numbers': 'off', 'no-secrets/no-secrets': 'error', '@nx/enforce-module-boundaries': ['error', { allow: [], depConstraints: timelineDepConstraints }] } },
  { files: ['**/*.ts', '**/*.tsx'], ignores: ['**/app/**', '**/components/ui/**'], rules: { 'max-lines': ['error', { max: 160 }], 'max-nested-callbacks': ['error', 3], 'max-depth': ['error', 4] } },
  { files: ['src/lib/mock-data.ts'], rules: { 'max-lines': 'off' } },
  { files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'], languageOptions: { globals: { jest: 'readonly' } }, rules: {} },
];
