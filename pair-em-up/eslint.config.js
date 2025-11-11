// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import airbnbBase from 'eslint-config-airbnb-base';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

const airbnbRules = airbnbBase.rules || {};

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js',
      'vite.config.js',
      'stylelint.config.js',
    ],
  },

  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },
  },

  importPlugin.flatConfigs.recommended,

  { rules: airbnbRules },

  prettierConfig,

  {
    plugins: { prettier: prettierPlugin },
    rules: { 'prettier/prettier': 'error' },
  },

  {
    files: ['src/**/*.js'],
  },

  {
    rules: {
      'no-console': 'warn',
      'import/prefer-default-export': 'off',
      'class-methods-use-this': 'off',
    },
  },
];