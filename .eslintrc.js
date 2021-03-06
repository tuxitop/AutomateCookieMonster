module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true,
  },
  'extends': ['eslint:recommended'],
  'parserOptions': {
    'ecmaVersion': 6,
  },
  'rules': {
    'indent': ['error', 2, { "SwitchCase": 1 }],
    'linebreak-style': ['error','unix'],
    'quotes': ['error','single'],
    'semi': ['error','always'],
    'no-console': ['warn', { 'allow': ['info', 'error', 'warn'] }]
  },
  'globals': {
    'Game': 'readonly',
    'ACM': 'writeable',
    'CM': 'readonly'
  }
};
