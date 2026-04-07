import antfu from '@antfu/eslint-config'

/**
 * @see https://github.com/antfu/eslint-config
 * ESLint 9+ flat config；规则前缀见 README（如 ts/*、vue/*）
 */
export default antfu(
  {
    type: 'lib',
    vue: {
      overrides: {
        'vue/no-mutating-props': 'off',
      },
    },
    typescript: {
      overrides: {
        'ts/no-use-before-define': 'off',
        // 与 tsconfig（noImplicitAny: false）一致，避免一次性补全大量显式返回类型
        'ts/explicit-function-return-type': 'off',
      },
    },
    formatters: true,
    rules: {
      'no-console': 'off',
      'no-alert': 'off',
    },
  },
)
