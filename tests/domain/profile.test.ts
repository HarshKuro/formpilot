import { describe, it, expect } from 'vitest';
import {
  calculateAge,
  validateProfile,
  formatPercentage,
  StudentProfile,
  GENDER_OPTIONS,
  COURSE_OPTIONS,
  STREAM_OPTIONS,
  BATCH_OPTIONS
} from '../../src/domain/profile';

describe('Profile Domain - Age Calculation', () => {
  it('calculates age correctly when birthday has already occurred this year', () => {
    const dob = '2003-05-15';
    const refDate = new Date('2026-06-01');
    expect(calculateAge(dob, refDate)).toBe(23);
  });

  it('calculates age correctly when birthday has not yet occurred this year', () => {
    const dob = '2003-11-20';
    const refDate = new Date('2026-06-01');
    expect(calculateAge(dob, refDate)).toBe(22);
  });

  it('calculates age correctly on the exact day of birthday', () => {
    const dob = '2003-06-01';
    const refDate = new Date('2026-06-01');
    expect(calculateAge(dob, refDate)).toBe(23);
  });

  it('returns null for invalid dates', () => {
    expect(calculateAge('invalid-date')).toBeNull();
    expect(calculateAge('')).toBeNull();
  });
});

describe('Profile Domain - Validation', () => {
  it('allows empty partial profile without errors', () => {
    const partial: Partial<StudentProfile> = {};
    const res = validateProfile(partial);
    expect(res.isValid).toBe(true);
    expect(Object.keys(res.errors).length).toBe(0);
  });

  it('validates email format', () => {
    const resInvalid = validateProfile({ email: 'notanemail' });
    expect(resInvalid.isValid).toBe(false);
    expect(resInvalid.errors.email).toBeDefined();

    const resValid = validateProfile({ email: 'student@example.com' });
    expect(resValid.errors.email).toBeUndefined();
  });

  it('validates mobile number format', () => {
    const resInvalid = validateProfile({ mobile: '123' });
    expect(resInvalid.isValid).toBe(false);
    expect(resInvalid.errors.mobile).toBeDefined();

    const resValid = validateProfile({ mobile: '9876543210' });
    expect(resValid.errors.mobile).toBeUndefined();
  });

  it('validates percentages within 0-100', () => {
    const resInvalid = validateProfile({ tenthPercentage: '105' });
    expect(resInvalid.isValid).toBe(false);
    expect(resInvalid.errors.tenthPercentage).toBeDefined();

    const resValid = validateProfile({ tenthPercentage: '88.5%' });
    expect(resValid.errors.tenthPercentage).toBeUndefined();
  });

  it('validates CGPA within 0-10', () => {
    const resInvalid = validateProfile({ currentCgpa: '11.5' });
    expect(resInvalid.isValid).toBe(false);
    expect(resInvalid.errors.currentCgpa).toBeDefined();

    const resValid = validateProfile({ currentCgpa: '8.45' });
    expect(resValid.errors.currentCgpa).toBeUndefined();
  });

  it('validates backlogs and education gap are non-negative', () => {
    const resInvalid = validateProfile({ currentCourseBacklogs: '-1' });
    expect(resInvalid.isValid).toBe(false);
    expect(resInvalid.errors.currentCourseBacklogs).toBeDefined();

    const resValid = validateProfile({ currentCourseBacklogs: '0', educationGapMonths: '0' });
    expect(resValid.isValid).toBe(true);
  });
});

describe('Profile Constants', () => {
  it('contains expected enum values', () => {
    expect(GENDER_OPTIONS).toContain('Male');
    expect(GENDER_OPTIONS).toContain('Female');
    expect(COURSE_OPTIONS).toContain('B.E.');
    expect(STREAM_OPTIONS).toContain('AIML');
    expect(BATCH_OPTIONS).toContain('2026');
  });

  it('normalizes percentage strings cleanly', () => {
    expect(formatPercentage('85.5%')).toBe('85.5');
    expect(formatPercentage('92')).toBe('92');
  });
});
