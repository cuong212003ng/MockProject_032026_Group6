module.exports = {
  env: { node: true, es2021: true },
  extends: 'eslint:recommended',
  parserOptions: { ecmaVersion: 'latest' },
  rules: {
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    indent: ['error', 2],
    'no-unused-vars': 'error',
    'no-console': 'off',
  },
};
