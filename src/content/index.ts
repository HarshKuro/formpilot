import { isGoogleFormsPage } from '../forms/formDetector';
import { observeFormChanges, stopObservingForm } from '../forms/formObserver';
import { extractQuestionsFromDocument } from '../forms/questionExtractor';
import { matchAllQuestions } from '../matching/matcher';
import { getProfile } from '../storage/profileStorage';
import { mountPromptModal, unmountPromptModal } from './prompt/shadowContainer';
import { executeAutofill } from '../autofill/orchestrator';
import { StudentProfile } from '../domain/profile';

let currentProfile: StudentProfile | null = null;
let isCompleted = false;
let lastFilledCount = 0;

export async function initFormPilotContentScript(): Promise<void> {
  // 1. Verify URL is a Google Form
  if (!isGoogleFormsPage()) {
    return;
  }

  const formSessionKey = `formpilot_dismissed_${window.location.pathname}`;

  // 2. Setup runtime message listener for commands from the toolbar popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.action === 'TRIGGER_AUTOFILL') {
        handleTriggerAutofill().then(sendResponse);
        return true; // Keep channel open for async response
      }

      if (message.action === 'SHOW_PROMPT') {
        sessionStorage.removeItem(formSessionKey);
        handleShowPrompt().then(sendResponse);
        return true;
      }

      if (message.action === 'GET_STATUS') {
        handleGetStatus().then(sendResponse);
        return true;
      }

      return false;
    });
  }

  // 3. Listen for storage changes so editing profile updates content script in real-time
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes['formpilot_profile']) {
        currentProfile = changes['formpilot_profile'].newValue || null;
        renderPrompt(false);
      }
    });
  }

  // 4. Load initial profile
  currentProfile = await getProfile();

  // 5. If prompt dismissed in this session, don't auto-show floating prompt
  if (sessionStorage.getItem(formSessionKey) === 'true') {
    return;
  }

  // 6. Start observing form changes & render prompt
  observeFormChanges(() => {
    if (sessionStorage.getItem(formSessionKey) === 'true') {
      unmountPromptModal();
      stopObservingForm();
      return;
    }
    renderPrompt(false);
  });

  // Safety fallback timers for asynchronous Google Forms client-side hydration
  [500, 1500, 3000].forEach((delay) => {
    setTimeout(() => {
      if (sessionStorage.getItem(formSessionKey) !== 'true') {
        renderPrompt(false);
      }
    }, delay);
  });
}

/**
 * Evaluates current DOM questions and profile, then mounts the appropriate prompt state
 */
export function renderPrompt(forceShow: boolean = false): void {
  const formSessionKey = `formpilot_dismissed_${window.location.pathname}`;
  if (!forceShow && sessionStorage.getItem(formSessionKey) === 'true') {
    return;
  }

  // Case A: No profile configured yet -> show onboarding prompt
  if (!currentProfile || (!currentProfile.uid && !currentProfile.name)) {
    mountPromptModal({
      matchedCount: 0,
      skippedCount: 0,
      hasProfile: false,
      isCompleted: false,
      onAccept: () => {},
      onReject: () => {
        sessionStorage.setItem(formSessionKey, 'true');
        unmountPromptModal();
      },
      onClose: () => {
        sessionStorage.setItem(formSessionKey, 'true');
        unmountPromptModal();
      },
      onEdit: () => {
        chrome.runtime.sendMessage({ action: 'OPEN_OPTIONS' });
      }
    });
    return;
  }

  // Case B: Profile exists -> extract questions and match
  const questions = extractQuestionsFromDocument(document);
  if (questions.length === 0 && !forceShow) {
    return;
  }

  const matches = matchAllQuestions(questions, currentProfile);
  const matchedCount = matches.filter(m => m.matched).length;
  const skippedCount = matches.filter(m => !m.matched).length;

  if (matchedCount === 0 && !forceShow && !isCompleted) {
    return;
  }

  mountPromptModal({
    matchedCount,
    skippedCount,
    studentName: currentProfile.name,
    hasProfile: true,
    isCompleted,
    filledCount: lastFilledCount,
    onAccept: () => {
      const summary = executeAutofill(questions, matches);
      isCompleted = true;
      lastFilledCount = summary.filledCount;

      // Re-mount in completed state
      mountPromptModal({
        matchedCount,
        skippedCount,
        studentName: currentProfile?.name,
        hasProfile: true,
        isCompleted: true,
        filledCount: summary.filledCount,
        onAccept: () => {},
        onReject: () => {
          sessionStorage.setItem(formSessionKey, 'true');
          unmountPromptModal();
          stopObservingForm();
        },
        onClose: () => {
          sessionStorage.setItem(formSessionKey, 'true');
          unmountPromptModal();
          stopObservingForm();
        },
        onEdit: () => {
          chrome.runtime.sendMessage({ action: 'OPEN_OPTIONS' });
        }
      });
    },
    onReject: () => {
      sessionStorage.setItem(formSessionKey, 'true');
      unmountPromptModal();
      stopObservingForm();
    },
    onClose: () => {
      sessionStorage.setItem(formSessionKey, 'true');
      unmountPromptModal();
      stopObservingForm();
    },
    onEdit: () => {
      chrome.runtime.sendMessage({ action: 'OPEN_OPTIONS' });
    }
  });
}

/**
 * Handles explicit TRIGGER_AUTOFILL message from popup
 */
async function handleTriggerAutofill(): Promise<{
  success: boolean;
  filledCount?: number;
  matchedCount?: number;
  skippedCount?: number;
  reason?: string;
  message?: string;
}> {
  const formSessionKey = `formpilot_dismissed_${window.location.pathname}`;
  sessionStorage.removeItem(formSessionKey);

  currentProfile = await getProfile();

  if (!currentProfile || (!currentProfile.uid && !currentProfile.name)) {
    renderPrompt(true);
    return {
      success: false,
      reason: 'NO_PROFILE',
      message: 'Student profile not configured. Please create your profile first.'
    };
  }

  const questions = extractQuestionsFromDocument(document);
  if (questions.length === 0) {
    return {
      success: false,
      reason: 'NO_QUESTIONS',
      message: 'No form questions detected on this page.'
    };
  }

  const matches = matchAllQuestions(questions, currentProfile);
  const matchedCount = matches.filter(m => m.matched).length;
  const skippedCount = matches.filter(m => !m.matched).length;

  if (matchedCount === 0) {
    renderPrompt(true);
    return {
      success: false,
      reason: 'NO_MATCHES',
      matchedCount: 0,
      skippedCount,
      message: 'No questions matched your current student profile.'
    };
  }

  const summary = executeAutofill(questions, matches);
  isCompleted = true;
  lastFilledCount = summary.filledCount;

  // Show completed modal on page
  mountPromptModal({
    matchedCount,
    skippedCount,
    studentName: currentProfile.name,
    hasProfile: true,
    isCompleted: true,
    filledCount: summary.filledCount,
    onAccept: () => {},
    onReject: () => {
      sessionStorage.setItem(formSessionKey, 'true');
      unmountPromptModal();
    },
    onClose: () => {
      sessionStorage.setItem(formSessionKey, 'true');
      unmountPromptModal();
    },
    onEdit: () => {
      chrome.runtime.sendMessage({ action: 'OPEN_OPTIONS' });
    }
  });

  return {
    success: true,
    filledCount: summary.filledCount,
    matchedCount,
    skippedCount
  };
}

/**
 * Handles SHOW_PROMPT request from popup
 */
async function handleShowPrompt(): Promise<{ success: boolean }> {
  currentProfile = await getProfile();
  renderPrompt(true);
  return { success: true };
}

/**
 * Handles GET_STATUS request from popup
 */
async function handleGetStatus(): Promise<{
  isGoogleForm: boolean;
  hasProfile: boolean;
  questionsCount: number;
  matchedCount: number;
}> {
  currentProfile = await getProfile();
  const hasProfile = !!(currentProfile && (currentProfile.uid || currentProfile.name));
  const questions = extractQuestionsFromDocument(document);
  let matchedCount = 0;

  if (hasProfile && currentProfile) {
    const matches = matchAllQuestions(questions, currentProfile);
    matchedCount = matches.filter(m => m.matched).length;
  }

  return {
    isGoogleForm: true,
    hasProfile,
    questionsCount: questions.length,
    matchedCount
  };
}

// Auto-run when running in browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  initFormPilotContentScript();
}
