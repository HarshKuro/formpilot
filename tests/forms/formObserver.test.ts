import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { observeFormChanges, stopObservingForm } from '../../src/forms/formObserver';

describe('Google Forms Dynamic Observer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div class="Qr7Oae" role="listitem"><span class="M7eMe">Name</span><input type="text" class="whsOnd" /></div>';
  });

  afterEach(() => {
    stopObservingForm();
    vi.useRealTimers();
  });

  it('performs an initial scan and invokes callback', () => {
    const callback = vi.fn();
    observeFormChanges(callback, 50);

    expect(callback).toHaveBeenCalledTimes(1);
    const questions = callback.mock.calls[0][0];
    expect(questions.length).toBe(1);
    expect(questions[0].title).toBe('Name');
  });

  it('debounces mutations and invokes callback after delay', async () => {
    const callback = vi.fn();
    observeFormChanges(callback, 50);
    expect(callback).toHaveBeenCalledTimes(1);

    // Mutate DOM
    const newEl = document.createElement('div');
    newEl.className = 'Qr7Oae';
    newEl.innerHTML = '<span class="M7eMe">UID</span><input type="text" class="whsOnd" />';
    document.body.appendChild(newEl);

    // Flush MutationObserver microtask queue
    await Promise.resolve();

    // Not yet called immediately due to debounce
    expect(callback).toHaveBeenCalledTimes(1);

    // Advance timers past debounce
    await vi.advanceTimersByTimeAsync(60);
    expect(callback).toHaveBeenCalledTimes(2);
    const updated = callback.mock.calls[1][0];
    expect(updated.length).toBe(2);
  });

  it('prevents duplicate observers when called multiple times', async () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    observeFormChanges(cb1, 50);
    observeFormChanges(cb2, 50);

    const newEl = document.createElement('div');
    newEl.className = 'Qr7Oae';
    newEl.innerHTML = '<span class="M7eMe">Email</span><input type="text" class="whsOnd" />';
    document.body.appendChild(newEl);

    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(60);
    expect(cb2).toHaveBeenCalled();
  });
});
