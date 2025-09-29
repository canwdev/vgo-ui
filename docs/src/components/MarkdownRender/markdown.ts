import hljs from 'highlight.js'
import MarkdownIt from 'markdown-it'
import './github-markdown.css'
import './github-markdown-dark.css'
import 'highlight.js/styles/github.css'
// import 'highlight.js/styles/github-dark.css'

// 兼容不能识别的语言
const langMap = {
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
  <button class="_js-action-button btn-no-style mdi mdi-content-copy" data-action="copy" title="Copy">📋</button>
  <!--<button class="_js-action-button btn-no-style mdi mdi-download" data-action="download" title="Download">Download</button>-->
</div><code class="hljs language-${language}">${content}</code>
</pre>`
  },
})

export default md
