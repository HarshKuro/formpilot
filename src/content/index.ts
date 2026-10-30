// FormPilot Content Script Entry Point for Google Forms

console.log('[FormPilot] Content script loaded on Google Form');

export function initContentScript() {
  const isGoogleForm = window.location.hostname === 'docs.google.com' && window.location.pathname.includes('/forms/');
  if (!isGoogleForm) {
    return;
  }
  console.log('[FormPilot] Confirmed Google Forms page');
}

if (typeof window !== 'undefined') {
  initContentScript();
}
