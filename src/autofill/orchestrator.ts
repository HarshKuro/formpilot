import { ExtractedQuestion } from '../forms/questionExtractor';
import { MatchResult } from '../matching/matcher';
import { fillTextInput, fillRadioOption, fillDropdownOption } from './adapters';

export interface AutofillSummary {
  filledCount: number;
  skippedCount: number;
  totalCount: number;
  filledFields: string[];
  skippedFields: string[];
}

/**
 * Executes autofill across all matched questions in the Google Form
 */
export function executeAutofill(
  questions: ExtractedQuestion[],
  matches: MatchResult[]
): AutofillSummary {
  let filledCount = 0;
  let skippedCount = 0;
  const filledFields: string[] = [];
  const skippedFields: string[] = [];

  const questionMap = new Map<string, ExtractedQuestion>();
  for (const q of questions) {
    questionMap.set(q.id, q);
  }

  for (const match of matches) {
    if (!match.matched || !match.valueToFill) {
      skippedCount++;
      skippedFields.push(match.questionTitle);
      continue;
    }

    const question = questionMap.get(match.questionId);
    if (!question) {
      skippedCount++;
      skippedFields.push(match.questionTitle);
      continue;
    }

    // Safety checks: Never touch consent or manual fields
    if (question.isConsentOrDeclaration || match.skipReason === 'CONSENT_DECLARATION' || match.skipReason === 'MANUAL_FIELD_EXCLUDED') {
      skippedCount++;
      skippedFields.push(match.questionTitle);
      continue;
    }

    let success = false;

    if (question.controlType === 'text' || question.controlType === 'paragraph' || question.controlType === 'date') {
      const targetInput = question.inputElement || question.containerElement.querySelector<HTMLInputElement>('input[type="text"], textarea');
      if (targetInput) {
        success = fillTextInput(targetInput, match.valueToFill);
      }
    } else if (question.controlType === 'radio' && match.selectedOption) {
      success = fillRadioOption(match.selectedOption);
    } else if (question.controlType === 'dropdown' && match.selectedOption) {
      success = fillDropdownOption(match.selectedOption);
    }

    if (success) {
      filledCount++;
      filledFields.push(question.title);
    } else {
      skippedCount++;
      skippedFields.push(question.title);
    }
  }

  return {
    filledCount,
    skippedCount,
    totalCount: questions.length,
    filledFields,
    skippedFields
  };
}
