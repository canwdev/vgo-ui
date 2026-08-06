import antfu from '@antfu/eslint-config'

/**
 * @see https://github.com/antfu/eslint-config
 * 根项目和 docs 共用此 ESLint flat config。
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
        'ts/explicit-function-return-type': 'off',
        'ts/no-use-before-define': 'off',
      },
    },
    formatters: true,
    rules: {
      'no-console': 'off',
      'no-alert': 'off',
    },
  },
)
