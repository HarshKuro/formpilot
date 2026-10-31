import React, { useEffect } from 'react';
import { ShieldCheck, CheckCircle2, X, ExternalLink, Sparkles, UserPlus, AlertCircle } from 'lucide-react';

export interface PromptModalProps {
  matchedCount: number;
  skippedCount: number;
  studentName?: string;
  hasProfile?: boolean;
  isCompleted?: boolean;
  filledCount?: number;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
  onEdit: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({
  matchedCount,
  skippedCount,
  studentName,
  hasProfile = true,
  isCompleted = false,
  filledCount = 0,
  onAccept,
  onReject,
  onClose,
  onEdit
}) => {
  // Listen for Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-labelledby="formpilot-dialog-title"
      aria-describedby="formpilot-dialog-desc"
      className="fixed bottom-6 right-6 z-[2147483647] w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden font-sans text-slate-800 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
      style={{
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-inner">
            FP
          </div>
          <div>
            <h2 id="formpilot-dialog-title" className="font-semibold text-sm leading-tight text-white flex items-center gap-1.5">
              <span>FormPilot</span>
              <span className="text-[10px] bg-indigo-900/80 text-indigo-200 px-1.5 py-0.5 rounded font-mono font-normal">Local</span>
            </h2>
            <p id="formpilot-dialog-desc" className="text-[11px] text-slate-300">
              {hasProfile && studentName
                ? `Profile: ${studentName}`
                : hasProfile
                ? 'Student Profile Autofill'
                : 'Setup Required'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close prompt"
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-3.5">
        {!hasProfile ? (
          /* No profile onboarding state */
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-950">
              <div className="flex items-center space-x-2 font-semibold text-xs text-amber-900 mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Google Form Detected!</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                FormPilot can autofill your student details in 1 click. Configure your profile once to get started.
              </p>
            </div>

            <button
              onClick={onEdit}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer active:scale-[0.99]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Student Profile</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors focus:outline-none"
            >
              Dismiss for Now
            </button>
          </div>
        ) : isCompleted ? (
          /* Completed state */
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5 text-emerald-700 bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-xs text-emerald-900">Autofill Complete!</p>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  {filledCount} questions filled. Please review answers below and submit manually.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Done & Dismiss
            </button>
          </div>
        ) : matchedCount === 0 ? (
          /* 0 matches state */
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-center">
              <p className="font-semibold text-xs text-slate-800">No Profile Matches Found</p>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                None of the questions on this form matched your current profile fields.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onEdit}
                className="py-2 px-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg flex items-center justify-center space-x-1 transition-colors"
              >
                <span>Edit Profile</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                onClick={onClose}
                className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : (
          /* Ready to autofill state */
          <>
            {/* Field match breakdown */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-2.5">
                <span className="block text-lg font-bold text-indigo-700 leading-tight">
                  {matchedCount}
                </span>
                <span className="text-[11px] font-medium text-indigo-950">
                  {matchedCount} fields ready
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                <span className="block text-lg font-bold text-slate-600 leading-tight">
                  {skippedCount}
                </span>
                <span className="text-[11px] font-medium text-slate-600">
                  {skippedCount} manual questions
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              FormPilot fills only high-confidence profile fields. Manual questions, declaration checkboxes, and resume links remain untouched for you.
            </p>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={onAccept}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-[0.99]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Autofill {matchedCount} Fields</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onReject}
                  className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors text-center focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  Reject & Dismiss
                </button>
                <button
                  onClick={onEdit}
                  className="py-2 px-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg flex items-center justify-center space-x-1 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <span>Edit Profile</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span className="text-slate-600">No cloud transmission</span>
        </span>
        <span>By Harsh Partap Jain</span>
      </div>
    </div>
  );
};
