import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { extractQuestionsFromDocument } from '../../src/forms/questionExtractor';
import { matchAllQuestions } from '../../src/matching/matcher';
import { executeAutofill } from '../../src/autofill/orchestrator';
import { StudentProfile } from '../../src/domain/profile';

const sampleProfile: StudentProfile = {
  uid: '21BCS10100',
  name: 'Harsh Partap Jain',
  dateOfBirth: '2003-05-15',
  age: '23',
  gender: 'Male',
  college: 'Chandigarh University',
  currentCourse: 'B.E.',
  currentStream: 'AIML',
  passingOutBatch: '2026',
  tenthPercentage: '88.4',
  twelfthOrDiplomaPercentage: '86.2',
  graduationPercentage: '82.5',
  postGraduationPercentage: '80.0',
  currentCourseBacklogs: '0',
  currentCgpa: '8.75',
  educationGapMonths: '0',
  permanentAddress: 'House 123, Sector 45, Chandigarh',
  mobile: '9876543210',
  email: 'harsh@example.com'
};

describe('Autofill Orchestrator on Real Google Form', () => {
  beforeEach(() => {
    const fixturePath = path.resolve(__dirname, '../fixtures/real_google_form.html');
    const html = fs.readFileSync(fixturePath, 'utf8');
    document.body.innerHTML = html;
  });

  it('safely autofills all matched questions into the DOM without touching manual or consent fields', () => {
    const questions = extractQuestionsFromDocument(document);
    const matches = matchAllQuestions(questions, sampleProfile);

    const summary = executeAutofill(questions, matches);

    expect(summary.filledCount).toBe(19);
    expect(summary.skippedCount).toBe(4);

    // Verify UID text input has been populated
    const uidQ = questions.find(q => q.title === 'UID');
    expect((uidQ?.inputElement as HTMLInputElement)?.value).toBe('21BCS10100');

    // Verify Name text input has been populated
    const nameQ = questions.find(q => q.title === 'Name');
    expect((nameQ?.inputElement as HTMLInputElement)?.value).toBe('Harsh Partap Jain');

    // Verify Gender radio button was checked
    const genderQ = questions.find(q => q.title === 'Gender');
    const maleOption = genderQ?.options?.find(o => o.value === 'Male');
    expect(maleOption?.element.getAttribute('aria-checked')).toBe('true');

    // Verify consent checkboxes were NOT clicked or checked
    const consentCheckboxes = document.querySelectorAll<HTMLElement>('div[role="checkbox"]');
    consentCheckboxes.forEach(cb => {
      expect(cb.getAttribute('aria-checked')).not.toBe('true');
    });
  });
});
