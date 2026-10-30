import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { extractQuestionsFromDocument } from '../../src/forms/questionExtractor';
import { matchAllQuestions } from '../../src/matching/matcher';
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

describe('End-to-End Real Google Form Question Matching', () => {
  beforeEach(() => {
    const fixturePath = path.resolve(__dirname, '../fixtures/real_google_form.html');
    const html = fs.readFileSync(fixturePath, 'utf8');
    document.body.innerHTML = html;
  });

  it('matches all 18 student profile fields accurately on the real form', () => {
    const questions = extractQuestionsFromDocument(document);
    const matches = matchAllQuestions(questions, sampleProfile);

    const matchedKeys = matches
      .filter(m => m.matched)
      .map(m => m.fieldKey);

    expect(matchedKeys).toContain('uid');
    expect(matchedKeys).toContain('name');
    expect(matchedKeys).toContain('dateOfBirth');
    expect(matchedKeys).toContain('age');
    expect(matchedKeys).toContain('gender');
    expect(matchedKeys).toContain('college');
    expect(matchedKeys).toContain('currentCourse');
    expect(matchedKeys).toContain('currentStream');
    expect(matchedKeys).toContain('passingOutBatch');
    expect(matchedKeys).toContain('tenthPercentage');
    expect(matchedKeys).toContain('twelfthOrDiplomaPercentage');
    expect(matchedKeys).toContain('graduationPercentage');
    expect(matchedKeys).toContain('postGraduationPercentage');
    expect(matchedKeys).toContain('currentCourseBacklogs');
    expect(matchedKeys).toContain('currentCgpa');
    expect(matchedKeys).toContain('educationGapMonths');
    expect(matchedKeys).toContain('permanentAddress');
    expect(matchedKeys).toContain('mobile');
    expect(matchedKeys).toContain('email');

    // Confirm that manual fields and consent forms were strictly skipped!
    const manualAndConsentSkipped = matches.filter(
      m => m.skipReason === 'MANUAL_FIELD_EXCLUDED' || m.skipReason === 'CONSENT_DECLARATION'
    );

    const skippedTitles = manualAndConsentSkipped.map(m => m.questionTitle.toLowerCase());
    expect(skippedTitles.some(t => t.includes('resume'))).toBe(true);
    expect(skippedTitles.some(t => t.includes('position'))).toBe(true);
    expect(skippedTitles.some(t => t.includes('location'))).toBe(true);
    expect(skippedTitles.some(t => t.includes('important message'))).toBe(true);
  });
});
