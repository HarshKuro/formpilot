import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getProfile } from '../storage/profileStorage';
import { StudentProfile } from '../domain/profile';
import { UserCheck, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export const Popup: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        const stored = await getProfile();
        setProfile(stored);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const openOptions = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('options.html', '_blank');
    }
  };

  return (
    <div className="p-5 bg-white min-h-[380px] flex flex-col justify-between select-none">
      <div>
        <div className="flex items-center space-x-3 border-b pb-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            FP
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">FormPilot</h1>
            <p className="text-xs text-indigo-600 font-medium">Student Profile Autofill</p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Checking profile...</div>
        ) : profile && profile.uid ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-950 mb-4">
            <div className="flex items-center space-x-2 font-semibold text-sm mb-1 text-emerald-900">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Profile Active</span>
            </div>
            <p className="text-xs text-emerald-800 font-medium">{profile.name || 'Student'}</p>
            <p className="text-xs text-emerald-700 font-mono mt-0.5">UID: {profile.uid}</p>
            {profile.currentCourse && (
              <p className="text-[11px] text-emerald-600 mt-1">
                {profile.currentCourse} ({profile.currentStream}) • {profile.passingOutBatch}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-950 mb-4">
            <div className="flex items-center space-x-2 font-semibold text-sm mb-1 text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>No Profile Configured</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Set up your student profile to enable one-click autofill on Google Forms.
            </p>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="leading-snug">
            All data stored locally in your browser. No server calls, telemetry, or remote storage.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t space-y-2">
        <button
          onClick={openOptions}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <span>{profile?.uid ? 'Edit Profile & Settings' : 'Create Student Profile'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        <p className="text-[10px] text-center text-slate-400">
          FormPilot by Harsh Partap Jain
        </p>
      </div>
    </div>
  );
};

const rootEl = document.getElementById('popup-root');
if (rootEl) {
  createRoot(rootEl).render(<Popup />);
}
