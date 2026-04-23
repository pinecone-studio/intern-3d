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

export default [
  {
    plugins: {
      '@next/next': nextEslintPluginNext,
      '@typescript-eslint': typescriptEslint.plugin,
      import: importPlugin,
      'no-secrets': noSecretsPlugin,
      promise: promisePlugin,
      react: reactPlugin,
      spellcheck: spellcheckPlugin,
      unicorn: unicornPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  ...baseConfig,
  ...nx.configs['flat/react-typescript'],
  {
    ignores: ['.next/**/*', '.open-next/**/*', '**/out-tsc', 'cloudflare-env.d.ts'],
  },
  {
    files: ['**/_components/**/*.{ts,tsx,js,jsx}', '**/_features/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'import/no-default-export': 'error',
    },
  },
  {
    files: ['**/*.jsx', '**/*.tsx'],
    ignores: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx', '**/*.cy.ts', '**/*.cy.tsx'],
    rules: {
      'react/function-component-definition': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'camelcase': [
        'error',
        {
          properties: 'always',
        },
      ],
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.jsx', '**/*.tsx'],
    rules: {
      'unicorn/prefer-module': 'off',
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
        },
      ],
      'react/function-component-definition': 'off',
    },
  },
  {
    files: [
      '*.js',
      '*.ts',
      '**/*.js',
      '**/*.ts',
      '**/pages/**/*.tsx',
      '**/pages/**/*.jsx',
      '**/app/**/page.tsx',
      '**/app/**/layout.tsx',
      '**/app/**/template.tsx',
      '**/app/**/loading.tsx',
      '**/app/**/error.tsx',
      '**/app/**/global-error.tsx',
      '**/app/**/not-found.tsx',
      'mdx-components.tsx',
    ],
    rules: {
      'unicorn/prefer-module': 'off',
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
        },
      ],
    },
  },
  {
    files: ['**/use[A-Z]*.js', '**/use[A-Z]*.ts'],
    rules: {
      'unicorn/prefer-module': 'off',
      'unicorn/filename-case': [
        'error',
        {
          case: 'camelCase',
        },
      ],
    },
  },
  {
    files: ['**/*.native.tsx'],
    rules: {
      'unicorn/filename-case': 'off',
    },
  },
  {
    files: ['**/*.cy.ts', '**/*.cy.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      'unicorn/filename-case': 'off',
    },
  },
  {
    files: ['**/*.tsx'],
    ignores: ['**/app/**', '**/components/ui/**'],
    rules: {
      complexity: ['error', { max: 20 }],
    },
  },
  {
    files: ['**/*.ts'],
    ignores: ['**/app/**', '**/components/ui/**'],
    rules: {
      complexity: ['error', { max: 20 }],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-magic-numbers': 'off',
      'no-secrets/no-secrets': 'error',
      '@nx/enforce-module-boundaries': [
        'error',
        {
          allow: [],
          depConstraints: [
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['type:feature', 'type:data-access', 'type:util', 'type:ui'],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['type:feature', 'type:data-access', 'type:util', 'type:ui'],
            },
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['type:data-access', 'type:util'],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:util'],
            },
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util'],
            },
            {
              sourceTag: 'plugin:next',
              onlyDependOnLibsWithTags: ['plugin:next', 'plugin:react', 'plugin:node', 'plugin:js'],
            },
            {
              sourceTag: 'plugin:expo',
              onlyDependOnLibsWithTags: ['plugin:expo', 'plugin:react', 'plugin:js'],
            },
            {
              sourceTag: 'plugin:react',
              onlyDependOnLibsWithTags: ['plugin:react', 'plugin:js'],
            },
            {
              sourceTag: 'plugin:express',
              onlyDependOnLibsWithTags: ['plugin:express', 'plugin:js'],
            },
            {
              sourceTag: 'plugin:nest',
              onlyDependOnLibsWithTags: ['plugin:nest', 'plugin:js'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:int-lms-web',
              onlyDependOnLibsWithTags: ['scope:int-lms-web', 'scope:int-lms-api', 'scope:shared'],
            },
            {
              sourceTag: 'scope:int-lms-api',
              onlyDependOnLibsWithTags: ['scope:int-lms-api', 'scope:shared'],
            },
            {
              sourceTag: 'scope:int-alumnus-portfolio',
              onlyDependOnLibsWithTags: ['scope:int-alumnus-portfolio', 'scope:int-lms-api', 'scope:shared'],
            },
            {
              sourceTag: 'scope:int-student-detail-microservice',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/app/**', '**/components/ui/**'],
    rules: {
      'max-lines': ['error', { max: 160 }],
      'max-nested-callbacks': ['error', 3],
      'max-depth': ['error', 4],
    },
  },
  {
    files: ['src/lib/mock-data.ts'],
    rules: {
      'max-lines': 'off',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
    languageOptions: {
      globals: {
        jest: 'readonly',
      },
    },
    rules: {},
  },
  // The original config also referenced custom @nx/workspace rules:
  // - jsx-no-inline-function
  // - jsx-no-inline-types
  // - environment-key-naming-convention
  // - no-dynamic-routes
  // They are not exposed by the current @nx/eslint-plugin in this repo.
];
