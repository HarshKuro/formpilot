import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { extractQuestionsFromDocument, cleanQuestionTitle } from '../../src/forms/questionExtractor';

describe('Question Title Normalization', () => {
  it('strips asterisks and collapses extra whitespace', () => {
    expect(cleanQuestionTitle('UID *')).toBe('UID');
    expect(cleanQuestionTitle('  Passing   out Batch * ')).toBe('Passing out Batch');
    expect(cleanQuestionTitle('Best in XIIth and Diploma %')).toBe('Best in XIIth and Diploma %');
    expect(cleanQuestionTitle('Age (In Years) *')).toBe('Age (In Years)');
  });
});

describe('Question Extractor - Real Google Form Fixture', () => {
  beforeEach(() => {
    const fixturePath = path.resolve(__dirname, '../fixtures/real_google_form.html');
    const html = fs.readFileSync(fixturePath, 'utf8');
    document.body.innerHTML = html;
  });

  it('extracts all expected questions from the rendered Google Form DOM', () => {
    const questions = extractQuestionsFromDocument(document);
    expect(questions.length).toBeGreaterThanOrEqual(20);

    const titles = questions.map(q => q.title);
    expect(titles).toContain('UID');
    expect(titles).toContain('Name');
    expect(titles).toContain('Date of Birth');
    expect(titles).toContain('Gender');
    expect(titles).toContain('College');
    expect(titles).toContain('Current Course');
    expect(titles).toContain('Current Stream');
    expect(titles).toContain('Passing out Batch');
    expect(titles).toContain('Xth%');
    expect(titles).toContain('Best in XIIth and Diploma %');
    expect(titles).toContain('Grad.%');
    expect(titles).toContain('PG %');
    expect(titles).toContain('Current CGPA');
    expect(titles).toContain('Permanent Address');
    expect(titles).toContain('Mobile');
    expect(titles).toContain('Email ID');
  });

  it('identifies radio button questions with their options', () => {
    const questions = extractQuestionsFromDocument(document);
    const genderQ = questions.find(q => q.title === 'Gender');
    expect(genderQ).toBeDefined();
    expect(genderQ?.controlType).toBe('radio');
    const optionLabels = genderQ?.options?.map(o => o.label);
    expect(optionLabels).toContain('Male');
    expect(optionLabels).toContain('Female');

    const streamQ = questions.find(q => q.title === 'Current Stream');
    expect(streamQ).toBeDefined();
    expect(streamQ?.controlType).toBe('radio');
    const streamOptions = streamQ?.options?.map(o => o.label);
    expect(streamOptions).toContain('AIML');
    expect(streamOptions).toContain('BDA');
  });

  it('identifies text input questions with their input elements', () => {
    const questions = extractQuestionsFromDocument(document);
    const uidQ = questions.find(q => q.title === 'UID');
    expect(uidQ).toBeDefined();
    expect(uidQ?.controlType).toBe('text');
    expect(uidQ?.inputElement).toBeDefined();
    expect(uidQ?.inputElement?.tagName.toLowerCase()).toBe('input');
  });

  it('marks consent/declaration/message questions appropriately', () => {
    const questions = extractQuestionsFromDocument(document);
    const messageQ = questions.find(q => q.title.toLowerCase().includes('important message'));
    expect(messageQ).toBeDefined();
    expect(messageQ?.isConsentOrDeclaration).toBe(true);
  });
});
