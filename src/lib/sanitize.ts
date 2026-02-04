import DOMPurify from 'dompurify'

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Uses DOMPurify to clean untrusted HTML
 * 
 * @param html - The HTML string to sanitize
 * @param options - Optional DOMPurify configuration
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeHtml(
  html: string,
  options?: DOMPurify.Config
): string {
  // Default configuration - allow common HTML tags and attributes
  const defaultConfig: DOMPurify.Config = {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'span', 'div',
      'strong', 'em', 'u', 'b', 'i',
      'ul', 'ol', 'li',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'style' // Allow style tags for email templates
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title',
      'style', 'class', 'id',
      'width', 'height', 'align',
      'cellpadding', 'cellspacing', 'border'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
    ...options
  }

  return DOMPurify.sanitize(html, defaultConfig)
}

/**
 * Sanitizes HTML for email templates specifically
 * More permissive to allow email styling
 */
export function sanitizeEmailHtml(html: string): string {
  return sanitizeHtml(html, {
    ALLOWED_TAGS: [
      'html', 'head', 'body', 'meta', 'title',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'span', 'div', 'section',
      'strong', 'em', 'u', 'b', 'i', 'small',
      'ul', 'ol', 'li',
      'a', 'img',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      'style', 'link'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'target', 'rel',
      'style', 'class', 'id', 'name',
      'width', 'height', 'align', 'valign',
      'cellpadding', 'cellspacing', 'border',
      'bgcolor', 'color', 'size',
      'type', 'charset'
    ],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false
  })
}

/**
 * Creates a sanitized dangerouslySetInnerHTML object
 * Use this instead of raw dangerouslySetInnerHTML
 * 
 * @param html - The HTML string to sanitize
 * @param forEmail - Whether this is for email content (more permissive)
 * @returns Object safe to use with dangerouslySetInnerHTML
 */
export function createSafeHtml(html: string, forEmail = false) {
  const sanitized = forEmail ? sanitizeEmailHtml(html) : sanitizeHtml(html)
  return { __html: sanitized }
}
