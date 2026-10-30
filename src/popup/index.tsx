import React from 'react';
import { createRoot } from 'react-dom/client';

export const Popup: React.FC = () => {
  return (
    <div className="p-4 bg-white min-h-[400px] flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-2 border-b pb-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            FP
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 leading-tight">FormPilot</h1>
            <p className="text-xs text-slate-500">Student Profile Autofill</p>
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm text-indigo-900 mb-4">
          <p className="font-medium">Privacy-First Guarantee</p>
          <p className="text-xs text-indigo-700 mt-1">
            All profile information is stored 100% locally on your browser. Zero cloud transmission.
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t">
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Open Profile Editor
        </button>
      </div>
    </div>
  );
};

const rootEl = document.getElementById('popup-root');
if (rootEl) {
  createRoot(rootEl).render(<Popup />);
}
