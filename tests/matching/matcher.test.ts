import { describe, it, expect } from 'vitest';
import { matchQuestionToProfile, normalizeLabel } from '../../src/matching/matcher';
import { StudentProfile } from '../../src/domain/profile';
import { ExtractedQuestion } from '../../src/forms/questionExtractor';

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
  postGraduationPercentage: '',
  currentCourseBacklogs: '0',
  currentCgpa: '8.75',
  educationGapMonths: '0',
  permanentAddress: 'House 123, Sector 45, Chandigarh',
  mobile: '9876543210',
  email: 'harsh@example.com'
};

function createMockQuestion(
  title: string,
  controlType: ExtractedQuestion['controlType'] = 'text',
  options?: string[],
  isConsent: boolean = false
): ExtractedQuestion {
  return {
    id: 'q-test',
    title,
    rawTitle: title,
    controlType,
    containerElement: {} as any,
    options: options?.map(o => ({ value: o, label: o, element: {} as any })),
    isRequired: true,
    isConsentOrDeclaration: isConsent
  };
}

describe('Matching Engine - Label Normalization', () => {
  it('normalizes labels by stripping punctuation and lowercasing', () => {
    expect(normalizeLabel('UID *')).toBe('uid');
    expect(normalizeLabel('Age (In Years)')).toBe('age in years');
    expect(normalizeLabel('Grad.%')).toBe('grad %');
    expect(normalizeLabel('Passing   out Batch')).toBe('passing out batch');
  });
});

describe('Matching Engine - Academic Percentage Isolation', () => {
  it('correctly maps Xth% to tenthPercentage and NEVER to 12th or graduation', () => {
    const q1 = createMockQuestion('Xth%');
    const m1 = matchQuestionToProfile(q1, sampleProfile);
    expect(m1.matched).toBe(true);
    expect(m1.fieldKey).toBe('tenthPercentage');
    expect(m1.valueToFill).toBe('88.4');

    const q2 = createMockQuestion('10th Percentage');
    const m2 = matchQuestionToProfile(q2, sampleProfile);
    expect(m2.matched).toBe(true);
    expect(m2.fieldKey).toBe('tenthPercentage');
  });

  it('correctly maps XIIth/Diploma to twelfthOrDiplomaPercentage', () => {
    const q = createMockQuestion('Best in XIIth and Diploma %');
    const m = matchQuestionToProfile(q, sampleProfile);
    expect(m.matched).toBe(true);
    expect(m.fieldKey).toBe('twelfthOrDiplomaPercentage');
    expect(m.valueToFill).toBe('86.2');
  });

  it('correctly maps Grad.% to graduationPercentage', () => {
    const q = createMockQuestion('Grad.%');
    const m = matchQuestionToProfile(q, sampleProfile);
    expect(m.matched).toBe(true);
    expect(m.fieldKey).toBe('graduationPercentage');
    expect(m.valueToFill).toBe('82.5');
  });

  it('correctly maps PG % to postGraduationPercentage', () => {
    const profileWithPg = { ...sampleProfile, postGraduationPercentage: '79.0' };
    const q = createMockQuestion('PG %');
    const m = matchQuestionToProfile(q, profileWithPg);
    expect(m.matched).toBe(true);
    expect(m.fieldKey).toBe('postGraduationPercentage');
    expect(m.valueToFill).toBe('79.0');
  });
});

describe('Matching Engine - Radio Option Matching', () => {
  it('matches Gender radio option by visible text', () => {
    const q = createMockQuestion('Gender', 'radio', ['Male', 'Female']);
    const m = matchQuestionToProfile(q, sampleProfile);
    expect(m.matched).toBe(true);
    expect(m.fieldKey).toBe('gender');
    expect(m.selectedOption?.label).toBe('Male');
  });

  it('matches Current Course option safely (handles B.E vs B.E.)', () => {
    const q = createMockQuestion('Current Course', 'radio', ['B.E', 'B.E+M.E (Integrated)', 'B.E Later Entry']);
    const m = matchQuestionToProfile(q, sampleProfile);
    expect(m.matched).toBe(true);
    expect(m.fieldKey).toBe('currentCourse');
    expect(m.selectedOption?.label).toBe('B.E');
  });

  it('matches Stream and Batch options', () => {
    const qStream = createMockQuestion('Current Stream', 'radio', ['BDA', 'AIML', 'CC', 'IoT', 'GG', 'CSBS']);
    const mStream = matchQuestionToProfile(qStream, sampleProfile);
    expect(mStream.matched).toBe(true);
    expect(mStream.selectedOption?.label).toBe('AIML');

    const qBatch = createMockQuestion('Passing  out Batch', 'radio', ['2025', '2026', '2027', '2028', '2029']);
    const mBatch = matchQuestionToProfile(qBatch, sampleProfile);
    expect(mBatch.matched).toBe(true);
    expect(mBatch.selectedOption?.label).toBe('2026');
  });

  it('refuses to match radio when no option matches profile value', () => {
    const q = createMockQuestion('Current Stream', 'radio', ['Mechanical', 'Civil', 'Electrical']);
    const m = matchQuestionToProfile(q, sampleProfile);
    expect(m.matched).toBe(false);
    expect(m.skipReason).toBe('NO_OPTION_MATCH');
  });
});

describe('Matching Engine - Exclusion and Skip Guards', () => {
  it('skips Public Resume Link as strictly manual', () => {
    const q = createMockQuestion('Public Resume link');
    const m = matchQuestionToProfile(q, sampleProfile);
    expect(m.matched).toBe(false);
    expect(m.skipReason).toBe('MANUAL_FIELD_EXCLUDED');
  });

  it('skips Position Applying For as strictly manual', () => {
    const q = createMockQuestion('Position Applying for', 'checkbox', ['Graduate Engineer Trainee']);
    const m = matchQuestionToProfile(q, sampleProfile);
    expect(m.matched).toBe(false);
    expect(m.skipReason).toBe('MANUAL_FIELD_EXCLUDED');
  });

  it('skips Job Location Preference as strictly manual', () => {
    const q = createMockQuestion('Job Location Preference', 'checkbox', ['Halol', 'Gurgaon', 'Mumbai']);
    const m = matchQuestionToProfile(q, sampleProfile);
    expect(m.matched).toBe(false);
    expect(m.skipReason).toBe('MANUAL_FIELD_EXCLUDED');
  });

  it('skips consent and declaration questions strictly', () => {
    const q = createMockQuestion('Important Message', 'checkbox', ['I confirm that...'], true);
    const m = matchQuestionToProfile(q, sampleProfile);
    expect(m.matched).toBe(false);
    expect(m.skipReason).toBe('CONSENT_DECLARATION');
  });

  it('skips unknown arbitrary questions', () => {
    const q = createMockQuestion('What is your favorite hobby?');
    const m = matchQuestionToProfile(q, sampleProfile);
    expect(m.matched).toBe(false);
    expect(m.skipReason).toBe('LOW_CONFIDENCE');
  });

  it('skips field when student profile has no value stored', () => {
    const profileNoEmail = { ...sampleProfile, email: '' };
    const q = createMockQuestion('Email ID');
    const m = matchQuestionToProfile(q, profileNoEmail);
    expect(m.matched).toBe(false);
    expect(m.skipReason).toBe('NO_PROFILE_VALUE');
  });
});
