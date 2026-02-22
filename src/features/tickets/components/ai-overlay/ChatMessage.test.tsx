import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ChatMessage } from './ChatMessage';

describe('ChatMessage sanitization', () => {
  it('sanitizes assistant rich text before rendering', () => {
    render(
      <ChatMessage
        message={{
          role: 'assistant',
          content: `**Safe** text <script>alert('xss')</script>`,
          timestamp: new Date().toISOString(),
        }}
      />,
    );

    expect(screen.getByText('Safe')).toBeInTheDocument();
    expect(document.querySelector('script')).not.toBeInTheDocument();
  });
});
