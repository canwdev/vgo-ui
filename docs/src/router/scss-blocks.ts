// 把库里的令牌定义直接注入文档，避免文档和源码各写一份、改一处漏一处。
// 在 markdown 里写 `<!-- @scss:core-tokens -->`，构建时会替换成对应的 SCSS 代码块。
import coreScss from '../../../src/styles/core/_runtime.scss?raw'
import themeScss from '../../../src/styles/themes/default/_tokens.scss?raw'

const SOURCES: Record<string, { source: string, selector: string }> = {
  'core-tokens': { source: coreScss, selector: ':root' },
  'theme-tokens': { source: themeScss, selector: 'body.vgo-theme-default' },
  'theme-tokens-dark': { source: themeScss, selector: 'html.dark body.vgo-theme-default' },
}

/** 从 SCSS 文本里按选择器取出第一个规则块（含选择器与花括号），靠计数配对 */
function extractBlock(source: string, selector: string): string {
  const start = source.indexOf(`${selector} {`)
  if (start === -1)
    throw new Error(`[scss-blocks] 找不到选择器 ${selector}`)

  let depth = 0
  for (let i = start; i < source.length; i++) {
    if (source[i] === '{')
      depth++
    else if (source[i] === '}' && --depth === 0)
      return source.slice(start, i + 1)
  }
  throw new Error(`[scss-blocks] ${selector} 的花括号没有闭合`)
}

export function injectScssBlocks(markdown: string): string {
  return markdown.replace(/<!--\s*@scss:([\w-]+)\s*-->/g, (_, key: string) => {
    const entry = SOURCES[key]
    if (!entry)
      throw new Error(`[scss-blocks] 未知的注入键 @scss:${key}`)
    return `\`\`\`scss\n${extractBlock(entry.source, entry.selector)}\n\`\`\``
  })
}
