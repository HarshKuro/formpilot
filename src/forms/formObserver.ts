import { extractQuestionsFromDocument, ExtractedQuestion } from './questionExtractor';

let activeObserver: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Observes dynamic form updates (e.g. multi-step sections, revealed questions)
 * with a debounced scanner to prevent runaway loops.
 */
export function observeFormChanges(
  onQuestionsUpdated: (questions: ExtractedQuestion[]) => void,
  debounceMs: number = 300,
  targetRoot?: Node
): () => void {
  // Teardown any existing observer first to prevent duplicate observation
  stopObservingForm();

  const root = targetRoot || (typeof document !== 'undefined' ? (document.body || document.documentElement) : null);

  // Initial immediate extraction
  if (typeof document !== 'undefined') {
    const initialQuestions = extractQuestionsFromDocument(document);
    onQuestionsUpdated(initialQuestions);
  }

  if (!root || typeof MutationObserver === 'undefined') {
    return stopObservingForm;
  }

  activeObserver = new MutationObserver((mutations) => {
    // Only re-scan if relevant elements outside FormPilot host were added or removed
    let hasRelevantChanges = false;
    for (const mutation of mutations) {
      const targetEl = mutation.target as HTMLElement | null;
      if (targetEl && (targetEl.id === 'formpilot-root-host' || targetEl.closest?.('#formpilot-root-host'))) {
        continue;
      }

      if (mutation.type === 'childList') {
        const added = Array.from(mutation.addedNodes) as HTMLElement[];
        const isSelfHost = added.some(node => node.id === 'formpilot-root-host' || (node.querySelector && node.querySelector('#formpilot-root-host')));
        if (isSelfHost && added.length === 1) {
          continue;
        }

        if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
          hasRelevantChanges = true;
          break;
        }
      }
    }

    if (!hasRelevantChanges) return;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      const questions = extractQuestionsFromDocument(document);
      onQuestionsUpdated(questions);
    }, debounceMs);
  });

  activeObserver.observe(root, {
    childList: true,
    subtree: true
  });

  return stopObservingForm;
}

/**
 * Disconnects the active form mutation observer and clears pending timers.
 */
export function stopObservingForm(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (activeObserver) {
    activeObserver.disconnect();
    activeObserver = null;
  }
}
