import hljs from 'highlight.js'
import githubDarkCss from 'highlight.js/styles/github-dark.css?raw'
import githubCss from 'highlight.js/styles/github.css?raw'
import MarkdownIt from 'markdown-it'
import './github-markdown.css'
import './github-markdown-dark.css'

// 兼容不能识别的语言
const langMap: Record<string, string> = {
  vue: 'html',
}
function getLang(lang: string) {
  lang = lang.toLowerCase()
  return langMap[lang] || lang
}

const md = new MarkdownIt({
  linkify: true,
  breaks: true, // 启用换行
  // 风险： 允许块级 HTML 会引入 XSS 漏洞的风险。 仅在您信任 Markdown 内容的来源时才这样做。
  html: true,
  highlight(code: string, lang: string) {
    const langOriginal = lang
    let langDisplay = lang
    lang = getLang(lang)
    if (lang !== langDisplay) {
      langDisplay = `${langDisplay} (${lang})`
    }
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    const content = hljs.highlight(code, { language, ignoreIllegals: true }).value
    return `<pre class="hljs-code-container">
<div class="hljs-code-header vgo-panel">
  <span class="lang-display" data-lang="${langOriginal}">${langDisplay}</span>
  <button class="_js-action-button vgo-u-button-reset" data-action="copy" title="Copy" aria-label="Copy"><svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path fill="currentColor" d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z"/></svg></button>
  <!--<button class="_js-action-button vgo-u-button-reset" data-action="download" title="Download" aria-label="Download"><svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path fill="currentColor" d="M5 20h14v-2H5m14-9h-4V3H9v6H5l7 7z"/></svg></button>-->
</div><code class="hljs language-${language}">${content}</code>
</pre>`
  },
})

export interface Heading {
  level: number
  text: string
  id: string
}

export function getHighlightThemeCss(dark: boolean): string {
  return dark ? githubDarkCss : githubCss
}

function inlineText(content: string): string {
  return content
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/<[^>]*>/g, '')
    .trim()
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** 与渲染时的 heading id 保持同一条计算路径，供目录组件复用 */
export function getHeadings(markdown: string): Heading[] {
  const tokens = md.parse(markdown, {})
  const headings: Heading[] = []
  const used = new Map<string, number>()

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type !== 'heading_open')
      continue

    const level = Number(token.tag.slice(1))
    if (level < 1 || level > 3)
      continue

    const inline = tokens[i + 1]
    const raw = inline?.type === 'inline' ? inline.content : ''
    const text = inlineText(raw)
    let id = slugify(text) || `section-${headings.length + 1}`

    const count = used.get(id) ?? 0
    used.set(id, count + 1)
    if (count > 0)
      id = `${id}-${count}`

    headings.push({ level, text, id })
  }

  return headings
}

let headingIdCounts = new Map<string, number>()
let headingIndex = 0

md.renderer.rules.heading_open = (tokens, idx, options, _env, self) => {
  const token = tokens[idx]
  const level = Number(token.tag.slice(1))

  if (level >= 1 && level <= 3) {
    const inline = tokens[idx + 1]
    const raw = inline?.type === 'inline' ? inline.content : ''
    const text = inlineText(raw)
    headingIndex++
    let id = slugify(text) || `section-${headingIndex}`

    const count = headingIdCounts.get(id) ?? 0
    headingIdCounts.set(id, count + 1)
    if (count > 0)
      id = `${id}-${count}`

    token.attrSet('id', id)
  }

  return self.renderToken(tokens, idx, options)
}

function render(markdown: string): string {
  headingIdCounts = new Map()
  headingIndex = 0
  return md.render(markdown)
}

export default {
  render,
}
