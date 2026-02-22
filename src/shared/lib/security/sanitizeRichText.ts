export type RichTextMode = 'auto' | 'html' | 'markdown' | 'plain';

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'em',
  'code',
  'pre',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
]);

const DROP_CONTENT_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed']);
const SAFE_HREF_PATTERN = /^(https?:|mailto:|tel:|\/|#)/i;

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatInlineMarkdown = (value: string): string => {
  const escaped = escapeHtml(value);

  return escaped
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
};

const markdownToHtml = (markdown: string): string => {
  const lines = markdown.split(/\r?\n/);
  const parts: string[] = [];
  let inOrderedList = false;
  let inUnorderedList = false;

  const closeLists = () => {
    if (inOrderedList) {
      parts.push('</ol>');
      inOrderedList = false;
    }
    if (inUnorderedList) {
      parts.push('</ul>');
      inUnorderedList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      closeLists();
      continue;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      if (!inOrderedList) {
        if (inUnorderedList) {
          parts.push('</ul>');
          inUnorderedList = false;
        }
        parts.push('<ol>');
        inOrderedList = true;
      }
      parts.push(`<li>${formatInlineMarkdown(ordered[1])}</li>`);
      continue;
    }

    const unordered = trimmed.match(/^[-*]\s+(.+)$/);
    if (unordered) {
      if (!inUnorderedList) {
        if (inOrderedList) {
          parts.push('</ol>');
          inOrderedList = false;
        }
        parts.push('<ul>');
        inUnorderedList = true;
      }
      parts.push(`<li>${formatInlineMarkdown(unordered[1])}</li>`);
      continue;
    }

    closeLists();
    parts.push(`<p>${formatInlineMarkdown(trimmed)}</p>`);
  }

  closeLists();
  return parts.join('');
};

const sanitizeHref = (href: string): string | null => {
  const normalized = href.trim();
  return SAFE_HREF_PATTERN.test(normalized) ? normalized : null;
};

const sanitizeNode = (parent: HTMLElement) => {
  const children = Array.from(parent.childNodes);

  for (const child of children) {
    if (child.nodeType === Node.COMMENT_NODE) {
      child.remove();
      continue;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) {
      continue;
    }

    const element = child as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (DROP_CONTENT_TAGS.has(tag)) {
      element.remove();
      continue;
    }

    if (!ALLOWED_TAGS.has(tag)) {
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      element.remove();
      continue;
    }

    const attributes = Array.from(element.attributes);
    for (const attr of attributes) {
      const attrName = attr.name.toLowerCase();
      const isAllowedAnchorAttr = tag === 'a' && attrName === 'href';

      if (!isAllowedAnchorAttr) {
        element.removeAttribute(attr.name);
        continue;
      }

      const safeHref = sanitizeHref(attr.value);
      if (!safeHref) {
        element.removeAttribute(attr.name);
        continue;
      }

      element.setAttribute('href', safeHref);
      element.setAttribute('target', '_blank');
      element.setAttribute('rel', 'noopener noreferrer nofollow');
    }

    sanitizeNode(element);
  }
};

const sanitizeHtml = (rawHtml: string): string => {
  if (typeof DOMParser === 'undefined') {
    return escapeHtml(rawHtml);
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(rawHtml, 'text/html');
  sanitizeNode(document.body);
  return document.body.innerHTML;
};

const plainTextToHtml = (input: string): string => {
  return escapeHtml(input).replace(/\r?\n/g, '<br />');
};

export const sanitizeUserGeneratedRichText = (
  input: string,
  mode: RichTextMode = 'auto',
): string => {
  if (!input) {
    return '';
  }

  const normalizedMode =
    mode === 'auto' ? (/<[a-z][\s\S]*>/i.test(input) ? 'html' : 'markdown') : mode;

  if (normalizedMode === 'plain') {
    return plainTextToHtml(input);
  }

  if (normalizedMode === 'markdown') {
    return sanitizeHtml(markdownToHtml(input));
  }

  return sanitizeHtml(input);
};
