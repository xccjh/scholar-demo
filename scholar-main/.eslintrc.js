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
    'no-console': process.env.VUE_APP_deploy === '1' ? 'off' : 'off',
    'no-debugger': process.env.VUE_APP_deploy === '1' ? 'warn' : 'off',
    '@typescript-eslint/no-explicit-any': ['off'], // 放开any
    '@typescript-eslint/explicit-module-boundary-types': 'off', // 强制把变量的使用限制在其定义的作用域范围内
    '@typescript-eslint/no-unused-vars': 'off', // 未使用变量
    '@typescript-eslint/no-var-requires': 'off', // 允许require
    '@typescript-eslint/no-empty-function': 'off', // 允许空函数
    '@typescript-eslint/ban-ts-comment': 'off', // 支持ts-ignore
    '@typescript-eslint/no-non-null-assertion': 'off', // 支持非空断言
    'no-case-declarations': 'off', // case变量声明
    'symbol-description': 'off', // symbol空参
    'vue/no-unused-components': 'off', // 未使用组件
    'vue/valid-v-model': ['off'], // v-modal验证参数支持
    'vue/no-v-model-argument': ['off'], // v-modal验证参数支持
    'camelcase': ['warn'], // 非驼峰
    'no-undef': ['warn'],// 未定义变量
    '@typescript-eslint/no-this-alias': 'off', // this别名
    'prefer-rest-params':'off' // 启用arguments
  }
}
