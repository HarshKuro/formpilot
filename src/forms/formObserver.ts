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
  targetRoot: Node = document.body
): () => void {
  // Teardown any existing observer first to prevent duplicate observation
  stopObservingForm();

  // Initial immediate extraction
  const initialQuestions = extractQuestionsFromDocument(document);
  onQuestionsUpdated(initialQuestions);

  activeObserver = new MutationObserver((mutations) => {
    // Only re-scan if relevant elements were added or removed
    let hasRelevantChanges = false;
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
        hasRelevantChanges = true;
        break;
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

  activeObserver.observe(targetRoot, {
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
