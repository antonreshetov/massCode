module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: ['plugin:vue/recommended', '@vue/standard'],
  globals: {
    __static: true
  },
  rules: {
    'vue/component-name-in-template-casing': [
      'error',
      'PascalCase',
      { registeredComponentsOnly: false }
    ],
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 1,
        multiline: {
          max: 1,
          allowFirstLine: false
        }
      }
    ],
    'arrow-parens': 0,
    'no-console': 0,
    'import/order': 0
  }
}
