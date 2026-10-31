import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Popup } from '../../src/popup/index';
import * as profileStorage from '../../src/storage/profileStorage';

describe('Extension Toolbar Popup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders student profile and detects non-form tab', async () => {
    vi.spyOn(profileStorage, 'getProfile').mockResolvedValue({
      name: 'Harsh Partap Jain',
      uid: '21BCS101',
      college: 'Test College',
      currentCourse: 'B.Tech',
      currentStream: 'Computer Science',
      passingOutBatch: '2025'
    } as any);

    // Mock chrome.tabs.query for non-form page
    (globalThis as any).chrome = {
      ...(globalThis as any).chrome,
      tabs: {
        query: vi.fn((_query, callback) => {
          callback([{ id: 101, url: 'https://example.com' }]);
        }),
        sendMessage: vi.fn()
      },
      runtime: {
        openOptionsPage: vi.fn()
      }
    };

    render(<Popup />);

    await waitFor(() => {
      expect(screen.getAllByText(/Harsh Partap Jain/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/UID: 21BCS101/i)).toBeDefined();
      expect(screen.getByText(/No Active Form/i)).toBeDefined();
    });
  });

  it('shows autofill button when active tab is a Google Form', async () => {
    vi.spyOn(profileStorage, 'getProfile').mockResolvedValue({
      name: 'Harsh Partap Jain',
      uid: '21BCS101'
    } as any);

    const sendMessageMock = vi.fn((_tabId, _msg, callback) => {
      callback({ success: true, filledCount: 15 });
    });

    (globalThis as any).chrome = {
      ...(globalThis as any).chrome,
      tabs: {
        query: vi.fn((_query, callback) => {
          callback([{ id: 202, url: 'https://docs.google.com/forms/d/e/sample/viewform' }]);
        }),
        sendMessage: sendMessageMock
      },
      runtime: {
        openOptionsPage: vi.fn()
      }
    };

    render(<Popup />);

    await waitFor(() => {
      expect(screen.getByText(/Form Active/i)).toBeDefined();
      expect(screen.getByText(/Google Form Detected/i)).toBeDefined();
      expect(screen.getByText(/Autofill Current Form/i)).toBeDefined();
    });

    const autofillBtn = screen.getByRole('button', { name: /autofill current form/i });
    fireEvent.click(autofillBtn);

    expect(sendMessageMock).toHaveBeenCalledWith(
      202,
      { action: 'TRIGGER_AUTOFILL' },
      expect.any(Function)
    );

    await waitFor(() => {
      expect(screen.getByText(/Success! 15 questions filled/i)).toBeDefined();
    });
  });

  it('triggers in-page prompt display when clicking Open In-Page Prompt', async () => {
    vi.spyOn(profileStorage, 'getProfile').mockResolvedValue({
      name: 'Harsh Partap Jain',
      uid: '21BCS101'
    } as any);

    const sendMessageMock = vi.fn((_tabId, _msg, callback) => {
      callback({ success: true });
    });

    (globalThis as any).chrome = {
      ...(globalThis as any).chrome,
      tabs: {
        query: vi.fn((_query, callback) => {
          callback([{ id: 303, url: 'https://docs.google.com/forms/d/e/sample/viewform' }]);
        }),
        sendMessage: sendMessageMock
      },
      runtime: {
        openOptionsPage: vi.fn()
      }
    };

    render(<Popup />);

    await waitFor(() => {
      expect(screen.getByText(/Open In-Page Prompt/i)).toBeDefined();
    });

    const promptBtn = screen.getByRole('button', { name: /open in-page prompt/i });
    fireEvent.click(promptBtn);

    expect(sendMessageMock).toHaveBeenCalledWith(
      303,
      { action: 'SHOW_PROMPT' },
      expect.any(Function)
    );
  });
});
