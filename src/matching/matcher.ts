import { StudentProfile } from '../domain/profile';
import { ExtractedQuestion, FormOption } from '../forms/questionExtractor';

export type SkipReason =
  | 'MANUAL_FIELD_EXCLUDED'
  | 'CONSENT_DECLARATION'
  | 'NO_PROFILE_VALUE'
  | 'UNSUPPORTED_CONTROL'
  | 'LOW_CONFIDENCE'
  | 'AMBIGUOUS_MATCH'
  | 'NO_OPTION_MATCH';

export interface MatchResult {
  questionId: string;
  questionTitle: string;
  matched: boolean;
  fieldKey?: keyof StudentProfile;
  valueToFill?: string;
  selectedOption?: FormOption;
  skipReason?: SkipReason;
  confidence: number;
}

/**
 * Normalizes question labels for robust token and phrase matching
 */
export function normalizeLabel(label: string): string {
  if (!label) return '';
  return label
    .toLowerCase()
    .replace(/[*\-_/\\()[\],.:;?]/g, ' ')
    .replace(/%/g, ' % ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes an option label (collapses punctuation and whitespace)
 */
export function normalizeOption(opt: string): string {
  if (!opt) return '';
  return opt
    .toLowerCase()
    .replace(/[.\-_/\\()[\],:;]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

/**
 * Manual-only patterns that must NEVER be populated automatically
 */
const MANUAL_PATTERNS = [
  'resume',
  'cv',
  'position applying for',
  'job location preference',
  'location preference',
  'preferred location',
  'notice period',
  'expected ctc',
  'current ctc',
  'why should we hire you',
  'cover letter'
];

/**
 * Curated aliases for canonical profile keys
 */
const FIELD_ALIASES: Record<keyof StudentProfile, string[]> = {
  uid: [
    'uid',
    'roll no',
    'roll number',
    'registration no',
    'registration number',
    'reg no',
    'reg number',
    'student id',
    'enrollment no',
    'enrollment number',
    'university roll no'
  ],
  name: [
    'name',
    'full name',
    'student name',
    'candidate name',
    'applicant name',
    'name of student',
    'name of candidate'
  ],
  dateOfBirth: [
    'date of birth',
    'dob',
    'birth date',
    'd o b'
  ],
  age: [
    'age',
    'age in years',
    'current age',
    'age years'
  ],
  gender: [
    'gender',
    'sex'
  ],
  college: [
    'college',
    'university',
    'college name',
    'university name',
    'institute',
    'institute name',
    'institution',
    'name of college',
    'name of university'
  ],
  currentCourse: [
    'current course',
    'course',
    'degree',
    'program',
    'current degree',
    'pursuing course',
    'course enrolled'
  ],
  currentStream: [
    'current stream',
    'stream',
    'branch',
    'specialization',
    'specialisation',
    'department',
    'current branch',
    'current specialization'
  ],
  passingOutBatch: [
    'passing out batch',
    'batch',
    'passing year',
    'year of passing',
    'yop',
    'pass out batch',
    'passout batch',
    'graduating year'
  ],
  tenthPercentage: [
    'xth %',
    'xth percentage',
    'xth',
    '10th %',
    '10th percentage',
    '10th',
    'tenth percentage',
    'class 10',
    'class 10th',
    'ssc percentage',
    'matriculation percentage',
    'x percentage'
  ],
  twelfthOrDiplomaPercentage: [
    'best in xiith and diploma %',
    'best in xiith and diploma',
    'xiith %',
    'xiith percentage',
    'xiith',
    '12th %',
    '12th percentage',
    '12th',
    'twelfth percentage',
    'class 12',
    'class 12th',
    'diploma percentage',
    'diploma %',
    'hsc percentage',
    'intermediate percentage',
    'inter percentage',
    'best in 12th and diploma %',
    'xii percentage'
  ],
  graduationPercentage: [
    'grad %',
    'grad percentage',
    'grad',
    'graduation percentage',
    'graduation %',
    'btech percentage',
    'be percentage',
    'degree percentage',
    'ug percentage',
    'undergraduate percentage'
  ],
  postGraduationPercentage: [
    'pg %',
    'pg percentage',
    'pg',
    'post graduation percentage',
    'post graduation %',
    'mtech percentage',
    'postgraduate percentage',
    'masters percentage'
  ],
  currentCourseBacklogs: [
    'backlogs in current course',
    'current course backlogs',
    'backlogs',
    'active backlogs',
    'current backlogs',
    'number of backlogs',
    'standing backlogs',
    'history of backlogs',
    'any backlogs'
  ],
  currentCgpa: [
    'current cgpa',
    'cgpa',
    'current gpa',
    'gpa',
    'overall cgpa',
    'cumulative gpa'
  ],
  educationGapMonths: [
    'gap break in education in months',
    'gap break in education',
    'gap in education in months',
    'gap in education',
    'break in education in months',
    'break in education',
    'education gap months',
    'education gap',
    'gap months'
  ],
  permanentAddress: [
    'permanent address',
    'address',
    'residential address',
    'home address'
  ],
  mobile: [
    'mobile',
    'mobile number',
    'phone',
    'phone number',
    'contact number',
    'whatsapp number',
    'calling number'
  ],
  email: [
    'email id',
    'email',
    'email address',
    'official email',
    'college email',
    'personal email'
  ]
};

/**
 * Matches a student's profile value against candidate options
 */
export function matchOptionValue(options: FormOption[] = [], profileValue: string): FormOption | null {
  if (!options || options.length === 0 || !profileValue) return null;

  const normalizedProfileVal = normalizeOption(profileValue);

  // 1. Direct normalized match
  for (const opt of options) {
    if (normalizeOption(opt.label) === normalizedProfileVal || normalizeOption(opt.value) === normalizedProfileVal) {
      return opt;
    }
  }

  // 2. Specific approved equivalences
  // E.g. "B.E." matches "B.E" or "BE"
  // E.g. "AIML" matches "AI & ML" or "AI/ML"
  if (normalizedProfileVal === 'aiml') {
    const found = options.find(o => {
      const n = normalizeOption(o.label);
      return n === 'aiml' || n === 'aiml' || n.includes('aiml') || (n.includes('ai') && n.includes('ml'));
    });
    if (found) return found;
  }

  if (normalizedProfileVal === 'be') {
    const found = options.find(o => normalizeOption(o.label) === 'be');
    if (found) return found;
  }

  return null;
}

/**
 * Matches an extracted question against the student's profile
 */
export function matchQuestionToProfile(
  question: ExtractedQuestion,
  profile: StudentProfile
): MatchResult {
  const normTitle = normalizeLabel(question.title);

  // 1. Skip consent, declaration, or agreement questions strictly
  if (question.isConsentOrDeclaration) {
    return {
      questionId: question.id,
      questionTitle: question.title,
      matched: false,
      skipReason: 'CONSENT_DECLARATION',
      confidence: 0
    };
  }

  // 2. Skip manual-only questions (resume, location preferences, applying for)
  for (const pattern of MANUAL_PATTERNS) {
    if (normTitle.includes(pattern)) {
      return {
        questionId: question.id,
        questionTitle: question.title,
        matched: false,
        skipReason: 'MANUAL_FIELD_EXCLUDED',
        confidence: 0
      };
    }
  }

  // 3. Percentage Stage Isolation Guard:
  // Strictly prevent overlap between 10th, 12th, graduation, and PG percentages!
  let candidateKeys: (keyof StudentProfile)[] = [];

  const is10th = /\b(10th|xth|tenth|ssc|matric)\b/i.test(normTitle);
  const is12th = /\b(12th|xiith|twelfth|diploma|hsc|inter)\b/i.test(normTitle);
  const isPg = /\b(pg|post grad|post graduation|mtech|masters)\b/i.test(normTitle);
  const isGrad = /\b(grad|graduation|btech|be|undergraduate|ug)\b/i.test(normTitle) && !isPg && !is10th && !is12th;

  if (is10th) {
    candidateKeys = ['tenthPercentage'];
  } else if (is12th) {
    candidateKeys = ['twelfthOrDiplomaPercentage'];
  } else if (isPg) {
    candidateKeys = ['postGraduationPercentage'];
  } else if (isGrad && (normTitle.includes('%') || normTitle.includes('percentage') || normTitle.includes('marks'))) {
    candidateKeys = ['graduationPercentage'];
  } else {
    // Standard alias dictionary search
    for (const [key, aliases] of Object.entries(FIELD_ALIASES) as [keyof StudentProfile, string[]][]) {
      // Do not allow percentage fields to match here unless explicitly qualified above
      if (['tenthPercentage', 'twelfthOrDiplomaPercentage', 'graduationPercentage', 'postGraduationPercentage'].includes(key)) {
        continue;
      }

      for (const alias of aliases) {
        // Exact normalized phrase match or token boundary match
        if (normTitle === alias || normTitle.startsWith(alias + ' ') || normTitle.endsWith(' ' + alias) || normTitle.includes(' ' + alias + ' ')) {
          candidateKeys.push(key);
          break;
        }
      }
    }
  }

  // No candidates found
  if (candidateKeys.length === 0) {
    return {
      questionId: question.id,
      questionTitle: question.title,
      matched: false,
      skipReason: 'LOW_CONFIDENCE',
      confidence: 0
    };
  }

  // Ambiguous match (multiple distinct keys matched)
  if (candidateKeys.length > 1) {
    // If one candidate is an exact match for the whole title, prioritize it
    const exactMatch = candidateKeys.find(k => {
      const aliases = FIELD_ALIASES[k];
      return aliases.includes(normTitle);
    });

    if (exactMatch) {
      candidateKeys = [exactMatch];
    } else {
      return {
        questionId: question.id,
        questionTitle: question.title,
        matched: false,
        skipReason: 'AMBIGUOUS_MATCH',
        confidence: 0.5
      };
    }
  }

  const matchedKey = candidateKeys[0];
  const profileVal = profile[matchedKey];

  // Check if student has saved a value for this field
  if (!profileVal || (typeof profileVal === 'string' && profileVal.trim() === '')) {
    return {
      questionId: question.id,
      questionTitle: question.title,
      matched: false,
      fieldKey: matchedKey,
      skipReason: 'NO_PROFILE_VALUE',
      confidence: 0.9
    };
  }

  // For radio or dropdown questions, verify that an option matches the stored value
  if (question.controlType === 'radio' || question.controlType === 'dropdown') {
    const matchedOption = matchOptionValue(question.options, profileVal);
    if (!matchedOption) {
      return {
        questionId: question.id,
        questionTitle: question.title,
        matched: false,
        fieldKey: matchedKey,
        skipReason: 'NO_OPTION_MATCH',
        confidence: 0.9
      };
    }

    return {
      questionId: question.id,
      questionTitle: question.title,
      matched: true,
      fieldKey: matchedKey,
      valueToFill: matchedOption.value,
      selectedOption: matchedOption,
      confidence: 1.0
    };
  }

  // For text, date, and paragraph controls
  return {
    questionId: question.id,
    questionTitle: question.title,
    matched: true,
    fieldKey: matchedKey,
    valueToFill: profileVal,
    confidence: 1.0
  };
}

/**
 * Matches an entire list of extracted questions against the student profile
 */
export function matchAllQuestions(
  questions: ExtractedQuestion[],
  profile: StudentProfile
): MatchResult[] {
  const results: MatchResult[] = [];
  const claimedKeys = new Set<keyof StudentProfile>();

  for (const q of questions) {
    const res = matchQuestionToProfile(q, profile);

    // Prevent filling the same profile key multiple times if duplicate questions appear
    if (res.matched && res.fieldKey) {
      if (claimedKeys.has(res.fieldKey)) {
        results.push({
          ...res,
          matched: false,
          skipReason: 'AMBIGUOUS_MATCH',
          confidence: 0.5
        });
        continue;
      }
      claimedKeys.add(res.fieldKey);
    }

    results.push(res);
  }

  return results;
}
