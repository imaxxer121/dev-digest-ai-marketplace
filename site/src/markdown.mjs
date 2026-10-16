import DOMPurify from 'dompurify';
import { marked } from 'marked';
const escapeAttribute = text => String(text).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export function sourceUrl(repository, sourcePath) {
  try {
    const url = new URL(repository);
    if (url.protocol !== 'https:' || !/^[a-zA-Z0-9._/-]+$/.test(sourcePath) || sourcePath.split('/').some(part => part === '..')) return undefined;
    return `${url.href.replace(/\/$/, '')}/blob/main/${sourcePath.split('/').map(encodeURIComponent).join('/')}`;
  } catch { return undefined; }
}
export function renderMarkdown(source, purifier = DOMPurify, baseUrl) {
  const renderer = new marked.Renderer();
  renderer.link = function ({ href, title, tokens }) {
    let target = href;
    if (baseUrl && !href.startsWith('#')) {
      try { target = new URL(href, baseUrl).href; } catch { target = ''; }
    }
    return `<a href="${escapeAttribute(target)}"${title ? ` title="${escapeAttribute(title)}"` : ''} rel="noopener noreferrer">${this.parser.parseInline(tokens)}</a>`;
  };
  const html = marked.parse(source, { async: false, gfm: true, renderer });
  return purifier.sanitize(html, { USE_PROFILES: { html: true }, FORBID_TAGS: ['style', 'form', 'input', 'button'], FORBID_ATTR: ['style'] });
}
