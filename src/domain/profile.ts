export type Gender = 'Male' | 'Female';

export type CurrentCourse =
  | 'B.E.'
  | 'B.E.+M.E. (Integrated)'
  | 'B.E. Later Entry';

export type CurrentStream =
  | 'BDA'
  | 'AIML'
  | 'CC'
  | 'IoT'
  | 'GG'
  | 'CSBS'
  | 'IS'
  | 'Blockchain'
  | 'Devops'
  | 'AIDataSci';

export type PassingOutBatch = '2025' | '2026' | '2027' | '2028' | '2029';

export interface StudentProfile {
  // Personal details
  uid?: string;
  name?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  age?: string; // Derived or explicit years
  gender?: Gender | string;
  college?: string;

  // Education
  currentCourse?: CurrentCourse | string;
  currentStream?: CurrentStream | string;
  passingOutBatch?: PassingOutBatch | string;

  // Academic performance
  tenthPercentage?: string;
  twelfthOrDiplomaPercentage?: string;
  graduationPercentage?: string;
  postGraduationPercentage?: string;
  currentCourseBacklogs?: string;
  currentCgpa?: string;
  educationGapMonths?: string;

  // Contact
  permanentAddress?: string;
  mobile?: string;
  email?: string;
}

export const GENDER_OPTIONS: readonly Gender[] = ['Male', 'Female'] as const;

export const COURSE_OPTIONS: readonly CurrentCourse[] = [
  'B.E.',
  'B.E.+M.E. (Integrated)',
  'B.E. Later Entry'
] as const;

export const STREAM_OPTIONS: readonly CurrentStream[] = [
  'BDA',
  'AIML',
  'CC',
  'IoT',
  'GG',
  'CSBS',
  'IS',
  'Blockchain',
  'Devops',
  'AIDataSci'
] as const;

export const BATCH_OPTIONS: readonly PassingOutBatch[] = [
  '2025',
  '2026',
  '2027',
  '2028',
  '2029'
] as const;

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof StudentProfile, string>>;
}

/**
 * Calculates current age in full years from date of birth string (YYYY-MM-DD)
 */
export function calculateAge(dobString: string, referenceDate: Date = new Date()): number | null {
  if (!dobString || typeof dobString !== 'string') return null;
  const parts = dobString.split('-');
  if (parts.length < 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  const birth = new Date(year, month, day);
  if (isNaN(birth.getTime())) return null;

  let age = referenceDate.getFullYear() - birth.getFullYear();
  const monthDiff = referenceDate.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

/**
 * Strips % symbols and whitespace from percentage input
 */
export function formatPercentage(val: string): string {
  if (!val) return '';
  return val.replace(/%/g, '').trim();
}

/**
 * Validates partial or complete profile fields.
 */
export function validateProfile(profile: Partial<StudentProfile>): ValidationResult {
  const errors: Partial<Record<keyof StudentProfile, string>> = {};

  if (profile.email && profile.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
  }

  if (profile.mobile && profile.mobile.trim()) {
    const digits = profile.mobile.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      errors.mobile = 'Mobile number should contain between 10 and 15 digits';
    }
  }

  const validatePct = (key: keyof StudentProfile, label: string) => {
    const raw = profile[key];
    if (raw && typeof raw === 'string' && raw.trim()) {
      const clean = formatPercentage(raw);
      const num = parseFloat(clean);
      if (isNaN(num) || num < 0 || num > 100) {
        errors[key] = `${label} must be a number between 0 and 100`;
      }
    }
  };

  validatePct('tenthPercentage', '10th percentage');
  validatePct('twelfthOrDiplomaPercentage', '12th/Diploma percentage');
  validatePct('graduationPercentage', 'Graduation percentage');
  validatePct('postGraduationPercentage', 'Post-graduation percentage');

  if (profile.currentCgpa && profile.currentCgpa.trim()) {
    const cgpa = parseFloat(profile.currentCgpa.trim());
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      errors.currentCgpa = 'CGPA must be a number between 0 and 10';
    }
  }

  if (profile.currentCourseBacklogs && profile.currentCourseBacklogs.trim()) {
    const backlogs = parseInt(profile.currentCourseBacklogs.trim(), 10);
    if (isNaN(backlogs) || backlogs < 0) {
      errors.currentCourseBacklogs = 'Backlogs must be 0 or a positive integer';
    }
  }

  if (profile.educationGapMonths && profile.educationGapMonths.trim()) {
    const gap = parseInt(profile.educationGapMonths.trim(), 10);
    if (isNaN(gap) || gap < 0) {
      errors.educationGapMonths = 'Education gap must be 0 or a positive integer';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
