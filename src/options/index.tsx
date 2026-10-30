import React from 'react';
import { createRoot } from 'react-dom/client';
import { ProfileEditor } from './ProfileEditor';

export const Options: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <header className="border-b pb-6 mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              FP
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">FormPilot Student Profile</h1>
              <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Privacy-First Autofill</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Enter and maintain your student and placement details once. FormPilot securely autofills supported Google Forms.
          </p>
        </div>
      </header>
      <main>
        <ProfileEditor />
      </main>
    </div>
  );
};

const rootEl = document.getElementById('options-root');
if (rootEl) {
  createRoot(rootEl).render(<Options />);
}
