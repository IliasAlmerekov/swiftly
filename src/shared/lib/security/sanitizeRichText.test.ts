import { describe, expect, it } from 'vitest';

import { sanitizeUserGeneratedRichText } from './sanitizeRichText';

describe('sanitizeUserGeneratedRichText', () => {
  it('removes unsafe html tags and attributes', () => {
    const input = `
      <p>Hello</p>
      <script>alert('xss')</script>
      <a href="javascript:alert('xss')" onclick="alert('xss')">Bad</a>
      <a href="https://example.com">Good</a>
    `;

    const output = sanitizeUserGeneratedRichText(input, 'html');

    expect(output).toContain('<p>Hello</p>');
    expect(output).not.toContain('<script>');
    expect(output).not.toContain('onclick=');
    expect(output).not.toContain('javascript:');
    expect(output).toContain('href="https://example.com"');
    expect(output).toContain('rel="noopener noreferrer nofollow"');
  });

  it('sanitizes markdown and keeps safe formatting', () => {
    const input = `**Bold** text
1. First
2. Second
<img src=x onerror=alert(1)>`;

    const output = sanitizeUserGeneratedRichText(input, 'markdown');

    expect(output).toContain('<strong>Bold</strong>');
    expect(output).toContain('<ol>');
    expect(output).toContain('<li>First</li>');
    expect(output).toContain('<li>Second</li>');
    expect(output).not.toContain('<img');
    expect(output).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
});
