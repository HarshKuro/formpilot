import React, { useState, useEffect } from 'react';
import {
  StudentProfile,
  GENDER_OPTIONS,
  COURSE_OPTIONS,
  STREAM_OPTIONS,
  BATCH_OPTIONS,
  calculateAge,
  validateProfile
} from '../domain/profile';
import {
  getProfile,
  saveProfile,
  clearProfile,
  exportProfileJson,
  importProfileJson
} from '../storage/profileStorage';
import {
  User,
  GraduationCap,
  Award,
  Phone,
  ShieldCheck,
  Save,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ProfileEditor: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile>({
    uid: '',
    name: '',
    dateOfBirth: '',
    age: '',
    gender: 'Male',
    college: '',
    currentCourse: 'B.E.',
    currentStream: 'AIML',
    passingOutBatch: '2026',
    tenthPercentage: '',
    twelfthOrDiplomaPercentage: '',
    graduationPercentage: '',
    postGraduationPercentage: '',
    currentCourseBacklogs: '0',
    currentCgpa: '',
    educationGapMonths: '0',
    permanentAddress: '',
    mobile: '',
    email: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof StudentProfile, string>>>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        const stored = await getProfile();
        if (stored) {
          setProfile(prev => ({ ...prev, ...stored }));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (field: keyof StudentProfile, value: string) => {
    setProfile(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-calculate age if date of birth changes
      if (field === 'dateOfBirth') {
        const derivedAge = calculateAge(value);
        if (derivedAge !== null) {
          updated.age = derivedAge.toString();
        }
      }
      return updated;
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateProfile(profile);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setSaveStatus('Please correct the validation errors before saving.');
      return;
    }

    await saveProfile(profile);
    setSaveStatus('Profile saved successfully to local storage!');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleClear = async () => {
    await clearProfile();
    setProfile({
      uid: '',
      name: '',
      dateOfBirth: '',
      age: '',
      gender: 'Male',
      college: '',
      currentCourse: 'B.E.',
      currentStream: 'AIML',
      passingOutBatch: '2026',
      tenthPercentage: '',
      twelfthOrDiplomaPercentage: '',
      graduationPercentage: '',
      postGraduationPercentage: '',
      currentCourseBacklogs: '0',
      currentCgpa: '',
      educationGapMonths: '0',
      permanentAddress: '',
      mobile: '',
      email: ''
    });
    setIsConfirmingClear(false);
    setSaveStatus('Profile data cleared completely.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleExport = async () => {
    const jsonStr = await exportProfileJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formpilot_profile_${profile.uid || 'backup'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const imported = await importProfileJson(text);
        setProfile(prev => ({ ...prev, ...imported }));
        setSaveStatus('Profile imported and saved successfully!');
        setTimeout(() => setSaveStatus(null), 4000);
      } catch (err) {
        setSaveStatus('Failed to import: Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-500">
        Loading profile data...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Privacy Notice Card */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 flex items-start space-x-4 shadow-sm">
        <ShieldCheck className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-indigo-950">
          <h2 className="font-semibold text-base mb-1">Privacy-First Architecture</h2>
          <p className="leading-relaxed">
            All your student and academic data is kept strictly inside your browser's local extension storage.
            FormPilot contains <strong>zero analytics, no remote telemetry, and zero cloud backends</strong>.
          </p>
        </div>
      </div>

      {saveStatus && (
        <div className={`p-4 rounded-lg text-sm flex items-center space-x-2 ${
          saveStatus.includes('error') || saveStatus.includes('Failed')
            ? 'bg-rose-50 border border-rose-200 text-rose-800'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
        }`}>
          {saveStatus.includes('error') ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{saveStatus}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: PERSONAL DETAILS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center space-x-2">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">1. Personal Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                UID / Registration No. <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={profile.uid || ''}
                onChange={e => handleChange('uid', e.target.value)}
                placeholder="e.g. 21BCS10100"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">University roll or registration number</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="e.g. Harsh Partap Jain"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={profile.dateOfBirth || ''}
                onChange={e => handleChange('dateOfBirth', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Age (In Years)
              </label>
              <input
                type="number"
                value={profile.age || ''}
                onChange={e => handleChange('age', e.target.value)}
                placeholder="Derived automatically from DOB"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">Calculated from Date of Birth</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                value={profile.gender || 'Male'}
                onChange={e => handleChange('gender', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                {GENDER_OPTIONS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                College / University Name
              </label>
              <input
                type="text"
                value={profile.college || ''}
                onChange={e => handleChange('college', e.target.value)}
                placeholder="e.g. Chandigarh University"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: EDUCATION */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">2. Current Degree & Batch</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Current Course <span className="text-rose-500">*</span>
              </label>
              <select
                value={profile.currentCourse || 'B.E.'}
                onChange={e => handleChange('currentCourse', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                {COURSE_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Current Stream <span className="text-rose-500">*</span>
              </label>
              <select
                value={profile.currentStream || 'AIML'}
                onChange={e => handleChange('currentStream', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                {STREAM_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Passing Out Batch <span className="text-rose-500">*</span>
              </label>
              <select
                value={profile.passingOutBatch || '2026'}
                onChange={e => handleChange('passingOutBatch', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                {BATCH_OPTIONS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: ACADEMIC PERFORMANCE */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">3. Academic Performance</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Xth Percentage (%)
              </label>
              <input
                type="text"
                value={profile.tenthPercentage || ''}
                onChange={e => handleChange('tenthPercentage', e.target.value)}
                placeholder="e.g. 88.4"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                  errors.tenthPercentage ? 'border-rose-300 bg-rose-50' : ''
                }`}
              />
              {errors.tenthPercentage && (
                <p className="text-xs text-rose-600 mt-1">{errors.tenthPercentage}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Best in XIIth / Diploma (%)
              </label>
              <input
                type="text"
                value={profile.twelfthOrDiplomaPercentage || ''}
                onChange={e => handleChange('twelfthOrDiplomaPercentage', e.target.value)}
                placeholder="e.g. 86.2"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                  errors.twelfthOrDiplomaPercentage ? 'border-rose-300 bg-rose-50' : ''
                }`}
              />
              {errors.twelfthOrDiplomaPercentage && (
                <p className="text-xs text-rose-600 mt-1">{errors.twelfthOrDiplomaPercentage}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Graduation Percentage (%)
              </label>
              <input
                type="text"
                value={profile.graduationPercentage || ''}
                onChange={e => handleChange('graduationPercentage', e.target.value)}
                placeholder="e.g. 82.5"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                  errors.graduationPercentage ? 'border-rose-300 bg-rose-50' : ''
                }`}
              />
              {errors.graduationPercentage && (
                <p className="text-xs text-rose-600 mt-1">{errors.graduationPercentage}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                PG Percentage (%) (Optional)
              </label>
              <input
                type="text"
                value={profile.postGraduationPercentage || ''}
                onChange={e => handleChange('postGraduationPercentage', e.target.value)}
                placeholder="Leave blank if undergraduate"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                  errors.postGraduationPercentage ? 'border-rose-300 bg-rose-50' : ''
                }`}
              />
              {errors.postGraduationPercentage && (
                <p className="text-xs text-rose-600 mt-1">{errors.postGraduationPercentage}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Current CGPA
              </label>
              <input
                type="text"
                value={profile.currentCgpa || ''}
                onChange={e => handleChange('currentCgpa', e.target.value)}
                placeholder="e.g. 8.75"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                  errors.currentCgpa ? 'border-rose-300 bg-rose-50' : ''
                }`}
              />
              {errors.currentCgpa && (
                <p className="text-xs text-rose-600 mt-1">{errors.currentCgpa}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Backlogs in Current Course
              </label>
              <input
                type="number"
                value={profile.currentCourseBacklogs ?? '0'}
                onChange={e => handleChange('currentCourseBacklogs', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                  errors.currentCourseBacklogs ? 'border-rose-300 bg-rose-50' : ''
                }`}
              />
              {errors.currentCourseBacklogs && (
                <p className="text-xs text-rose-600 mt-1">{errors.currentCourseBacklogs}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Gap / Break in Education (Months)
              </label>
              <input
                type="number"
                value={profile.educationGapMonths ?? '0'}
                onChange={e => handleChange('educationGapMonths', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                  errors.educationGapMonths ? 'border-rose-300 bg-rose-50' : ''
                }`}
              />
              {errors.educationGapMonths && (
                <p className="text-xs text-rose-600 mt-1">{errors.educationGapMonths}</p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: CONTACT DETAILS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center space-x-2">
            <Phone className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">4. Contact Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={profile.mobile || ''}
                onChange={e => handleChange('mobile', e.target.value)}
                placeholder="e.g. 9876543210"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                  errors.mobile ? 'border-rose-300 bg-rose-50' : ''
                }`}
              />
              {errors.mobile && (
                <p className="text-xs text-rose-600 mt-1">{errors.mobile}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="e.g. harsh@example.com"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                  errors.email ? 'border-rose-300 bg-rose-50' : ''
                }`}
              />
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Permanent Address
              </label>
              <textarea
                rows={3}
                value={profile.permanentAddress || ''}
                onChange={e => handleChange('permanentAddress', e.target.value)}
                placeholder="Complete address with pin code"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <div className="flex items-center space-x-3">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-sm border border-slate-300 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Backup
            </button>

            <label className="inline-flex items-center px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-sm border border-slate-300 shadow-sm transition-colors cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Import Backup
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          <div>
            {isConfirmingClear ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-rose-600 font-medium">Delete all data?</span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md shadow-sm"
                >
                  Yes, Clear
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingClear(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-md"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingClear(true)}
                className="inline-flex items-center px-3 py-2 text-rose-600 hover:text-rose-700 text-sm font-medium hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Clear Profile
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Developer Footer */}
      <footer className="pt-10 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
        <p className="font-medium text-slate-700">
          FormPilot — Built by Harsh Partap Jain
        </p>
        <p className="space-x-3">
          <a
            href="https://github.com/HarshKuro"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            GitHub: HarshKuro
          </a>
          <span>•</span>
          <a
            href="https://instagram.com/brainrotharsh"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            Instagram: @brainrotharsh
          </a>
        </p>
      </footer>
    </div>
  );
};
