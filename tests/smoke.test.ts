import { describe, it, expect } from 'vitest';

describe('FormPilot Test Suite Foundation', () => {
  it('runs unit tests in jsdom environment', () => {
    expect(window).toBeDefined();
    expect(chrome.storage).toBeDefined();
    expect(1 + 1).toBe(2);
  });
});
