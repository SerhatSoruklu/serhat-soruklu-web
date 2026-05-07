// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'window',
          message: 'Use Angular platform checks before browser-only APIs so SSR cannot crash.',
        },
        {
          name: 'document',
          message: 'Inject DOCUMENT and use platform checks so SSR cannot crash.',
        },
        {
          name: 'localStorage',
          message: 'Use Angular platform checks before browser storage access so SSR cannot crash.',
        },
        {
          name: 'sessionStorage',
          message: 'Use Angular platform checks before browser storage access so SSR cannot crash.',
        },
        {
          name: 'navigator',
          message: 'Use Angular platform checks before browser-only APIs so SSR cannot crash.',
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
