module.exports = {
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    parser: '@typescript-eslint/parser'
  },
  rules: {
    'no-console': process.env.VUE_APP_deploy === '1' ? 'warn' : 'off',
    'no-debugger': process.env.VUE_APP_deploy === '1' ? 'warn' : 'off',
    '@typescript-eslint/no-explicit-any': ['off'], // 放开any
    '@typescript-eslint/explicit-module-boundary-types': 'off', // 强制把变量的使用限制在其定义的作用域范围内
    '@typescript-eslint/no-unused-vars': 'off', // 未使用变量
    '@typescript-eslint/no-var-requires': 'off', // 允许require
    '@typescript-eslint/no-empty-function': 'off', // 允许空函数
    '@typescript-eslint/ban-ts-comment': 'off', // 支持ts-ignore
    'vue/valid-v-model':['off'],
    'vue/no-v-model-argument':['off'],
    'camelcase': ['warn'],
    'no-undef': ['warn'],
    '@typescript-eslint/no-this-alias': 'off', // this别名
    'prefer-rest-params':'off' // 启用arguments
  }
}
