import { describe, it, expect } from 'vitest';
import { fillTextInput, fillRadioOption } from '../../src/autofill/adapters';
import { FormOption } from '../../src/forms/questionExtractor';

describe('Input Adapters', () => {
  it('fills text input and dispatches input and change events', () => {
    const input = document.createElement('input');
    input.type = 'text';
    document.body.appendChild(input);

    let inputDispatched = false;
    let changeDispatched = false;

    input.addEventListener('input', () => {
      inputDispatched = true;
    });
    input.addEventListener('change', () => {
      changeDispatched = true;
    });

    const success = fillTextInput(input, '21BCS10100');
    expect(success).toBe(true);
    expect(input.value).toBe('21BCS10100');
    expect(inputDispatched).toBe(true);
    expect(changeDispatched).toBe(true);
  });

  it('does not overwrite text input if user has already typed a value', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = 'Existing Value';
    document.body.appendChild(input);

    const success = fillTextInput(input, 'New Value', false);
    expect(success).toBe(false);
    expect(input.value).toBe('Existing Value');
  });

  it('selects radio option and triggers click', () => {
    const container = document.createElement('div');
    const radio = document.createElement('div');
    radio.setAttribute('role', 'radio');
    radio.setAttribute('data-value', 'Male');
    container.appendChild(radio);
    document.body.appendChild(container);

    let clicked = false;
    radio.addEventListener('click', () => {
      clicked = true;
    });

    const option: FormOption = {
      value: 'Male',
      label: 'Male',
      element: radio
    };

    const success = fillRadioOption(option);
    expect(success).toBe(true);
    expect(clicked).toBe(true);
  });
});
