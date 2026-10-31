import { isGoogleFormsPage } from '../forms/formDetector';
import { observeFormChanges, stopObservingForm } from '../forms/formObserver';
import { matchAllQuestions } from '../matching/matcher';
import { getProfile } from '../storage/profileStorage';
import { mountPromptModal, unmountPromptModal } from './prompt/shadowContainer';
import { executeAutofill } from '../autofill/orchestrator';

export async function initFormPilotContentScript(): Promise<void> {
  // 1. Check if current URL is a supported Google Form
  if (!isGoogleFormsPage()) {
    return;
  }

  // 2. Check if prompt was dismissed in this session for this form
  const formSessionKey = `formpilot_dismissed_${window.location.pathname}`;
  if (sessionStorage.getItem(formSessionKey) === 'true') {
    return;
  }

  // 3. Load saved profile
  const profile = await getProfile();
  if (!profile || (!profile.uid && !profile.name)) {
    return;
  }

  let isCompleted = false;
  let lastFilledCount = 0;

  // 4. Start observing form questions
  observeFormChanges((questions) => {
    if (sessionStorage.getItem(formSessionKey) === 'true') {
      unmountPromptModal();
      stopObservingForm();
      return;
    }

    if (questions.length === 0) {
      return;
    }

    const matches = matchAllQuestions(questions, profile);
    const matchedCount = matches.filter(m => m.matched).length;
    const skippedCount = matches.filter(m => !m.matched).length;

    // Do not show prompt if there are 0 matches
    if (matchedCount === 0 && !isCompleted) {
      return;
    }

    mountPromptModal({
      matchedCount,
      skippedCount,
      studentName: profile.name,
      isCompleted,
      filledCount: lastFilledCount,
      onAccept: () => {
        const summary = executeAutofill(questions, matches);
        isCompleted = true;
        lastFilledCount = summary.filledCount;

        // Re-render prompt in completion state
        mountPromptModal({
          matchedCount,
          skippedCount,
          studentName: profile.name,
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
  });
}

// Auto-run when running in browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  initFormPilotContentScript();
}
