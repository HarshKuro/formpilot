import React from 'react';
import { createRoot } from 'react-dom/client';

export const Options: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <header className="border-b pb-6 mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">FormPilot Profile Setup</h1>
        <p className="mt-2 text-base text-slate-600">
          Save your academic and personal information once. FormPilot fills matching Google Forms with one click.
        </p>
      </header>
      <main id="profile-container">
        {/* Full Profile Editor will be rendered here */}
        <p className="text-slate-500">Loading profile...</p>
      </main>
    </div>
  );
};

const rootEl = document.getElementById('options-root');
if (rootEl) {
  createRoot(rootEl).render(<Options />);
}
