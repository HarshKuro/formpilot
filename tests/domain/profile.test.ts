import { describe, it, expect } from 'vitest';
import {
  calculateAge,
  formatDateToDDMMYY,
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

  it('calculates age correctly from dd/mm/yy format', () => {
    const dob = '15/05/03';
    const refDate = new Date('2026-06-01');
    expect(calculateAge(dob, refDate)).toBe(23);
  });

  it('returns null for invalid dates', () => {
    expect(calculateAge('invalid-date')).toBeNull();
    expect(calculateAge('')).toBeNull();
  });
});

describe('Profile Domain - Date Formatting', () => {
  it('formats YYYY-MM-DD into dd/mm/yy format', () => {
    expect(formatDateToDDMMYY('2003-05-15')).toBe('15/05/03');
    expect(formatDateToDDMMYY('1999-12-05')).toBe('05/12/99');
  });

  it('formats DD/MM/YYYY into dd/mm/yy format', () => {
    expect(formatDateToDDMMYY('15/05/2003')).toBe('15/05/03');
    expect(formatDateToDDMMYY('05-12-1999')).toBe('05/12/99');
  });

  it('preserves existing dd/mm/yy format', () => {
    expect(formatDateToDDMMYY('15/05/03')).toBe('15/05/03');
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
    expect(resValid.isValid).toBe(true);
  });

  it('validates mobile number digit length', () => {
    const resShort = validateProfile({ mobile: '123' });
    expect(resShort.isValid).toBe(false);
    expect(resShort.errors.mobile).toBeDefined();

    const resValid = validateProfile({ mobile: '+91 9876543210' });
    expect(resValid.isValid).toBe(true);
  });

  it('validates percentage fields are within 0-100 range', () => {
    const resOver = validateProfile({ tenthPercentage: '105' });
    expect(resOver.isValid).toBe(false);
    expect(resOver.errors.tenthPercentage).toBeDefined();

    const resUnder = validateProfile({ graduationPercentage: '-5' });
    expect(resUnder.isValid).toBe(false);
    expect(resUnder.errors.graduationPercentage).toBeDefined();

    const resValid = validateProfile({
      tenthPercentage: '85.5%',
      graduationPercentage: '78.2'
    });
    expect(resValid.isValid).toBe(true);
  });

  it('validates CGPA is within 0-10 range', () => {
    const resOver = validateProfile({ currentCgpa: '11' });
    expect(resOver.isValid).toBe(false);
    expect(resOver.errors.currentCgpa).toBeDefined();

    const resValid = validateProfile({ currentCgpa: '9.4' });
    expect(resValid.isValid).toBe(true);
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
