import { FormOption } from '../forms/questionExtractor';

/**
 * Fills a standard text input or textarea, using prototype setters to ensure
 * Google Forms framework (React / Google Closure) detects the input.
 */
export function fillTextInput(
  input: HTMLElement,
  value: string,
  overwrite: boolean = false
): boolean {
  if (!input) return false;
  const tag = input.tagName.toLowerCase();
  if (tag !== 'input' && tag !== 'textarea') {
    return false;
  }

  const inputEl = input as HTMLInputElement | HTMLTextAreaElement;

  // Guard: Never overwrite user-entered text unless explicitly asked
  if (!overwrite && inputEl.value && inputEl.value.trim().length > 0) {
    return false;
  }

  try {
    inputEl.focus();

    // Call native setter on the element's window realm prototype to bypass framework synthetic traps
    const win = input.ownerDocument?.defaultView || window;
    const proto = tag === 'input'
      ? win.HTMLInputElement?.prototype
      : win.HTMLTextAreaElement?.prototype;

    const nativeSetter = proto ? Object.getOwnPropertyDescriptor(proto, 'value')?.set : null;

    if (nativeSetter) {
      nativeSetter.call(inputEl, value);
    } else {
      inputEl.value = value;
    }

    // Dispatch input and change events
    inputEl.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    inputEl.blur();

    return true;
  } catch (err) {
    console.error('[FormPilot] Failed to fill text input:', err);
    return false;
  }
}

/**
 * Selects a radio button option element cleanly
 */
export function fillRadioOption(option: FormOption): boolean {
  if (!option || !option.element) return false;

  try {
    const el = option.element;
    el.focus();
    el.click();

    // Ensure aria-checked is updated
    el.setAttribute('aria-checked', 'true');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    el.blur();

    return true;
  } catch (err) {
    console.error('[FormPilot] Failed to select radio option:', err);
    return false;
  }
}

/**
 * Selects a dropdown option element
 */
export function fillDropdownOption(option: FormOption): boolean {
  if (!option || !option.element) return false;

  try {
    const el = option.element;
    el.click();
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  } catch (err) {
    console.error('[FormPilot] Failed to select dropdown option:', err);
    return false;
  }
}
