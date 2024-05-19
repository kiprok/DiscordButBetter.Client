// eslint.config.js
import eslintPluginReadableTailwind from 'eslint-plugin-readable-tailwind';
import eslintParserVue from 'vue-eslint-parser';

export default [
  {
    languageOptions: {
      parser: eslintParserVue,
    },
    plugins: {
      'readable-tailwind': eslintPluginReadableTailwind,
    },
    rules: {
      // enable all recommended rules to warn
      ...eslintPluginReadableTailwind.configs.warning.rules,
      // enable all recommended rules to error
      ...eslintPluginReadableTailwind.configs.error.rules,

      // or configure rules individually
      'readable-tailwind/multiline': ['warn', { printWidth: 100 }],
    },
  },
];
