import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mountPromptModal, unmountPromptModal } from '../../src/content/prompt/shadowContainer';

describe('Shadow DOM Container Lifecycle', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    unmountPromptModal();
  });

  it('mounts host element with ShadowRoot attached to document.body', () => {
    mountPromptModal({
      matchedCount: 18,
      skippedCount: 4,
      onAccept: vi.fn(),
      onReject: vi.fn(),
      onClose: vi.fn(),
      onEdit: vi.fn()
    });

    const host = document.getElementById('formpilot-root-host');
    expect(host).toBeDefined();
    expect(host?.shadowRoot).toBeDefined();
  });

  it('unmounts cleanly and removes host element', () => {
    mountPromptModal({
      matchedCount: 18,
      skippedCount: 4,
      onAccept: vi.fn(),
      onReject: vi.fn(),
      onClose: vi.fn(),
      onEdit: vi.fn()
    });

    expect(document.getElementById('formpilot-root-host')).not.toBeNull();
    unmountPromptModal();
    expect(document.getElementById('formpilot-root-host')).toBeNull();
  });

  it('prevents duplicate host elements when mounted multiple times', () => {
    mountPromptModal({
      matchedCount: 5,
      skippedCount: 2,
      onAccept: vi.fn(),
      onReject: vi.fn(),
      onClose: vi.fn(),
      onEdit: vi.fn()
    });

    mountPromptModal({
      matchedCount: 10,
      skippedCount: 3,
      onAccept: vi.fn(),
      onReject: vi.fn(),
      onClose: vi.fn(),
      onEdit: vi.fn()
    });

    const hosts = document.querySelectorAll('#formpilot-root-host');
    expect(hosts.length).toBe(1);
  });
});
