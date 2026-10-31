import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getProfile } from '../storage/profileStorage';
import { StudentProfile } from '../domain/profile';
import { isGoogleFormsPage } from '../forms/formDetector';
import {
  UserCheck,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Eye
} from 'lucide-react';

interface AutofillFeedback {
  type: 'success' | 'error' | 'info';
  message: string;
}

export const Popup: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFormTab, setIsFormTab] = useState<boolean>(false);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [autofilling, setAutofilling] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<AutofillFeedback | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const stored = await getProfile();
        setProfile(stored);

        // Check active tab
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (currentTab && currentTab.id) {
              setActiveTabId(currentTab.id);
              if (currentTab.url && isGoogleFormsPage(currentTab.url)) {
                setIsFormTab(true);
              }
            }
          });
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const openOptions = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('options.html', '_blank');
    }
  };

  /**
   * Triggers autofill in the active tab content script
   */
  const handleAutofillClick = async () => {
    if (!activeTabId) return;

    if (!profile || (!profile.uid && !profile.name)) {
      setFeedback({
        type: 'error',
        message: 'Please create your student profile first.'
      });
      return;
    }

    setAutofilling(true);
    setFeedback(null);

    const sendTriggerMessage = (tabId: number) => {
      chrome.tabs.sendMessage(
        tabId,
        { action: 'TRIGGER_AUTOFILL' },
        (response) => {
          setAutofilling(false);

          if (chrome.runtime.lastError || !response) {
            // Attempt script injection fallback for pre-existing tabs
            if (typeof chrome !== 'undefined' && chrome.scripting) {
              chrome.scripting.executeScript(
                {
                  target: { tabId },
                  files: ['content/index.js']
                },
                () => {
                  setTimeout(() => {
                    chrome.tabs.sendMessage(
                      tabId,
                      { action: 'TRIGGER_AUTOFILL' },
                      (retryRes) => {
                        handleAutofillResponse(retryRes);
                      }
                    );
                  }, 300);
                }
              );
              return;
            }

            setFeedback({
              type: 'error',
              message: 'Could not connect to Google Form. Please refresh the form tab.'
            });
            return;
          }

          handleAutofillResponse(response);
        }
      );
    };

    sendTriggerMessage(activeTabId);
  };

  const handleAutofillResponse = (response: any) => {
    setAutofilling(false);
    if (!response) {
      setFeedback({
        type: 'error',
        message: 'Could not connect to the form. Please refresh the page.'
      });
      return;
    }

    if (response.success) {
      setFeedback({
        type: 'success',
        message: `Success! ${response.filledCount} questions filled. Please review and submit.`
      });
    } else {
      setFeedback({
        type: 'info',
        message: response.message || 'No fields matched your profile.'
      });
    }
  };

  /**
   * Forces the in-page prompt to open on the active Google Form
   */
  const handleShowPromptClick = () => {
    if (!activeTabId) return;
    setFeedback(null);

    chrome.tabs.sendMessage(activeTabId, { action: 'SHOW_PROMPT' }, (res) => {
      if (chrome.runtime.lastError || !res) {
        if (typeof chrome !== 'undefined' && chrome.scripting) {
          chrome.scripting.executeScript(
            {
              target: { tabId: activeTabId },
              files: ['content/index.js']
            },
            () => {
              setTimeout(() => {
                chrome.tabs.sendMessage(activeTabId, { action: 'SHOW_PROMPT' });
              }, 300);
            }
          );
        }
      }
      setFeedback({
        type: 'info',
        message: 'Prompt modal displayed on Google Form!'
      });
    });
  };

  const hasConfiguredProfile = !!(profile && (profile.uid || profile.name));

  return (
    <div className="p-4 bg-white min-h-[420px] w-[350px] flex flex-col justify-between select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              FP
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-900 leading-tight">FormPilot</h1>
              <p className="text-[11px] text-indigo-600 font-medium">Student Profile Autofill</p>
            </div>
          </div>

          {/* Form Detection Badge */}
          {isFormTab ? (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Form Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
              <span>No Active Form</span>
            </span>
          )}
        </div>

        {/* Action Section for Google Forms */}
        {isFormTab && (
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-950 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Google Form Detected</span>
              </span>
            </div>

            {hasConfiguredProfile ? (
              <div className="space-y-2">
                <button
                  onClick={handleAutofillClick}
                  disabled={autofilling}
                  className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-[0.99] cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{autofilling ? 'Autofilling Form...' : '⚡ Autofill Current Form'}</span>
                </button>

                <button
                  onClick={handleShowPromptClick}
                  className="w-full py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium flex items-center justify-center space-x-1 transition-colors"
                >
                  <Eye className="w-3 h-3 text-slate-500" />
                  <span>Open In-Page Prompt</span>
                </button>
              </div>
            ) : (
              <div>
                <p className="text-[11px] text-indigo-900 mb-2 leading-relaxed">
                  Configure your student profile once to enable 1-click autofill on this form.
                </p>
                <button
                  onClick={openOptions}
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Create Student Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-2.5 rounded-lg text-xs mb-3 flex items-start space-x-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : feedback.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-900'
                : 'bg-amber-50 border border-amber-200 text-amber-900'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <span className="leading-snug">{feedback.message}</span>
          </div>
        )}

        {/* Profile Card */}
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading profile...</div>
        ) : hasConfiguredProfile ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-950 mb-3">
            <div className="flex items-center space-x-1.5 font-semibold text-xs mb-1 text-emerald-900">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Student Profile Active</span>
            </div>
            <p className="text-xs text-emerald-800 font-medium">{profile?.name || 'Student'}</p>
            <p className="text-[11px] text-emerald-700 font-mono mt-0.5">UID: {profile?.uid}</p>
            {profile?.currentCourse && (
              <p className="text-[10px] text-emerald-600 mt-1">
                {profile.currentCourse} ({profile.currentStream}) • {profile.passingOutBatch}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-950 mb-3">
            <div className="flex items-center space-x-1.5 font-semibold text-xs mb-1 text-amber-900">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>No Profile Configured</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Fill out your student details to activate 1-click autofill.
            </p>
          </div>
        )}

        {!isFormTab && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-600 mb-3 flex items-start space-x-2">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="leading-snug">
              Open any Google Form (<span className="font-mono text-slate-700">docs.google.com/forms</span>) to autofill questions.
            </p>
          </div>
        )}

        {/* Privacy Note */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[10px] text-slate-500 flex items-start space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="leading-snug">
            All data stored locally in your browser. Zero cloud transmission. Never auto-submits.
          </p>
        </div>
      </div>

      {/* Footer / Settings Link */}
      <div className="pt-3 border-t space-y-1.5">
        <button
          onClick={openOptions}
          className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors focus:outline-none"
        >
          <span>{hasConfiguredProfile ? 'Edit Profile & Settings' : 'Create Student Profile'}</span>
          <ExternalLink className="w-3 h-3" />
        </button>

        <p className="text-[9px] text-center text-slate-400">
          FormPilot by Harsh Partap Jain • 100% Client-Side
        </p>
      </div>
    </div>
  );
};

const rootEl = document.getElementById('popup-root');
if (rootEl) {
  createRoot(rootEl).render(<Popup />);
}
