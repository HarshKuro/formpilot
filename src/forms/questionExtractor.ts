export type FormControlType =
  | 'text'
  | 'paragraph'
  | 'date'
  | 'radio'
  | 'dropdown'
  | 'checkbox'
  | 'unsupported';

export interface FormOption {
  value: string;
  label: string;
  element: HTMLElement;
}

export interface ExtractedQuestion {
  id: string;
  title: string;
  rawTitle: string;
  controlType: FormControlType;
  containerElement: HTMLElement;
  inputElement?: HTMLElement;
  options?: FormOption[];
  isRequired: boolean;
  isConsentOrDeclaration: boolean;
}

/**
 * Normalizes question title by stripping asterisks, "Your answer", and collapsing whitespace
 */
export function cleanQuestionTitle(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\*/g, '')
    .replace(/\u00A0/g, ' ') // Replace non-breaking spaces
    .replace(/Your answer/gi, '')
    .replace(/Required/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a question represents a user declaration, agreement, or consent
 */
export function isConsentQuestion(title: string, options: FormOption[] = []): boolean {
  const normalized = title.toLowerCase();
  const consentKeywords = [
    'consent',
    'declaration',
    'important message',
    'agree',
    'confirm that',
    'terms',
    'responsibility',
    'undertaking',
    'acknowledgement',
    'acknowledge'
  ];

  if (consentKeywords.some(kw => normalized.includes(kw))) {
    return true;
  }

  // Check options text as well
  for (const opt of options) {
    const optText = opt.label.toLowerCase();
    if (consentKeywords.some(kw => optText.includes(kw))) {
      return true;
    }
  }

  return false;
}

/**
 * Extracts question metadata from a Google Forms DOM document
 */
export function extractQuestionsFromDocument(doc: Document = document): ExtractedQuestion[] {
  const questions: ExtractedQuestion[] = [];

  // Google Forms groups each question inside a container with role="listitem" or class "Qr7Oae"
  const containers = Array.from(
    doc.querySelectorAll<HTMLElement>('div.Qr7Oae, div[role="listitem"]')
  );

  let idCounter = 1;

  for (const container of containers) {
    // In Google Forms, the exact question title is in span.M7eMe.
    // Fallback to div[role="heading"] or div.geS5n if not found.
    let title = '';
    let rawTitle = '';

    const exactTitleSpan = container.querySelector<HTMLElement>('span.M7eMe, .M7eMe');
    if (exactTitleSpan) {
      rawTitle = exactTitleSpan.textContent || '';
      title = cleanQuestionTitle(rawTitle);
    } else {
      const headingEl = container.querySelector<HTMLElement>(
        'div[role="heading"], div.geS5n, [aria-level="3"]'
      );
      if (headingEl) {
        rawTitle = headingEl.textContent || '';
        title = cleanQuestionTitle(rawTitle);
      }
    }

    if (!title) continue;

    // Check if required
    const isRequired = !!(
      container.querySelector('[aria-label*="Required"]') ||
      container.querySelector('[aria-label*="required"]') ||
      container.querySelector('.v5Duua') ||
      rawTitle.includes('*')
    );

    // Identify control type
    let controlType: FormControlType = 'unsupported';
    let inputElement: HTMLElement | undefined;
    const options: FormOption[] = [];

    // Check for radio buttons
    const radioElements = Array.from(
      container.querySelectorAll<HTMLElement>('div[role="radio"]')
    );

    if (radioElements.length > 0) {
      controlType = 'radio';
      for (const radio of radioElements) {
        const dataVal = radio.getAttribute('data-value');
        const ariaLbl = radio.getAttribute('aria-label');
        const closestLbl = radio.closest('.docssharedWizToggleLabeledContainer')?.querySelector<HTMLElement>('.docssharedWizToggleLabeledLabelText')?.textContent;

        const labelText = (dataVal || ariaLbl || closestLbl || radio.textContent || '').replace(/\u00A0/g, ' ').trim();

        options.push({
          value: dataVal || labelText,
          label: labelText,
          element: radio
        });
      }
    } else {
      // Check for checkboxes
      const checkboxElements = Array.from(
        container.querySelectorAll<HTMLElement>('div[role="checkbox"]')
      );
      if (checkboxElements.length > 0) {
        controlType = 'checkbox';
        for (const cb of checkboxElements) {
          const dataVal = cb.getAttribute('data-value');
          const ariaLbl = cb.getAttribute('aria-label');
          const closestLbl = cb.closest('.docssharedWizToggleLabeledContainer')?.querySelector<HTMLElement>('.docssharedWizToggleLabeledLabelText')?.textContent;

          const labelText = (dataVal || ariaLbl || closestLbl || cb.textContent || '').replace(/\u00A0/g, ' ').trim();

          options.push({
            value: dataVal || labelText,
            label: labelText,
            element: cb
          });
        }
      } else {
        // Check for dropdown listbox
        const listbox = container.querySelector<HTMLElement>('div[role="listbox"]');
        if (listbox) {
          controlType = 'dropdown';
          inputElement = listbox;
          const optionEls = Array.from(
            container.querySelectorAll<HTMLElement>('div[role="option"]')
          );
          for (const opt of optionEls) {
            const label = (opt.textContent || opt.getAttribute('data-value') || '').trim();
            options.push({
              value: opt.getAttribute('data-value') || label,
              label,
              element: opt
            });
          }
        } else {
          // Check for date input
          const dateInput = container.querySelector<HTMLInputElement>('input[type="date"]');
          if (dateInput) {
            controlType = 'date';
            inputElement = dateInput;
          } else {
            // Check for textarea (paragraph)
            const textarea = container.querySelector<HTMLTextAreaElement>('textarea.KHxj8b, textarea');
            if (textarea) {
              controlType = 'paragraph';
              inputElement = textarea;
            } else {
              // Check for text input
              const textInput = container.querySelector<HTMLInputElement>('input[type="text"].whsOnd, input[type="text"]');
              if (textInput) {
                controlType = 'text';
                inputElement = textInput;
              }
            }
          }
        }
      }
    }

    const isConsentOrDeclaration = isConsentQuestion(title, options);

    questions.push({
      id: `formpilot-q-${idCounter++}`,
      title,
      rawTitle,
      controlType,
      containerElement: container,
      inputElement,
      options: options.length > 0 ? options : undefined,
      isRequired,
      isConsentOrDeclaration
    });
  }

  return questions;
}
