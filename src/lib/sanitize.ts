import sanitizeHtml from 'sanitize-html';

/**
 * Sanitises rich text authored in /studio.
 *
 * Journal bodies are stored as HTML and rendered with dangerouslySetInnerHTML,
 * so they are cleaned HERE — on write, once — rather than on every read. Only
 * admins can reach the editor, but "the only person who can post is trusted"
 * is not a security model: a stolen session, a compromised password or a
 * pasted payload from elsewhere would otherwise become stored XSS on a page
 * every visitor loads.
 *
 * The allowlist covers what the editor can actually produce and nothing more.
 * Notably absent: script, style, iframe, form, and any on* handler.
 */
export function sanitizeRichText(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      'p', 'br', 'hr',
      'h2', 'h3', 'h4',
      'strong', 'b', 'em', 'i', 'u', 's',
      'ul', 'ol', 'li',
      'blockquote',
      'a',
      'figure', 'figcaption', 'img',
      'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'span',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      span: ['class'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
    },
    // No data: or javascript: URLs anywhere.
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    // Anything leaving the site opens safely.
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? '';
        const isExternal = /^https?:\/\//i.test(href);
        return {
          tagName,
          attribs: {
            ...attribs,
            ...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
          },
        };
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: 'lazy' },
      }),
    },
    // Drop the contents of anything not on the list, rather than un-wrapping
    // it — a stripped <script> should not leave its source code as body text.
    nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript', 'iframe'],
  });
}

/**
 * Plain-text version of rich text, for excerpts, meta descriptions and the
 * read-time estimate.
 */
export function stripHtml(input: string): string {
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
}

/** Rough read time at 220 words per minute, floored at one minute. */
export function readMinutes(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
