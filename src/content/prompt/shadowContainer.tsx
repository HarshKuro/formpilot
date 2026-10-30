import { createRoot, Root } from 'react-dom/client';
import { PromptModal, PromptModalProps } from './PromptModal';

const HOST_ELEMENT_ID = 'formpilot-root-host';

let activeRoot: Root | null = null;
let hostElement: HTMLElement | null = null;

// Built-in scoped styles for Shadow DOM isolation so Google Forms styles never leak in
const SHADOW_STYLES = `
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  .font-sans {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  .fixed { position: fixed; }
  .bottom-6 { bottom: 1.5rem; }
  .right-6 { right: 1.5rem; }
  .w-\\[340px\\] { width: 340px; }
  .w-full { width: 100%; }
  .w-7 { width: 1.75rem; }
  .h-7 { height: 1.75rem; }
  .w-5 { width: 1.25rem; }
  .h-5 { height: 1.25rem; }
  .w-4 { width: 1rem; }
  .h-4 { height: 1rem; }
  .w-3\\.5 { width: 0.875rem; }
  .h-3\\.5 { height: 0.875rem; }
  .w-3 { width: 0.75rem; }
  .h-3 { height: 0.75rem; }
  .rounded-2xl { border-radius: 1rem; }
  .rounded-xl { border-radius: 0.75rem; }
  .rounded-lg { border-radius: 0.5rem; }
  .rounded-md { border-radius: 0.375rem; }
  .rounded { border-radius: 0.25rem; }
  .bg-white { background-color: #ffffff; }
  .bg-slate-900 { background-color: #0f172a; }
  .bg-slate-800 { background-color: #1e293b; }
  .bg-slate-100 { background-color: #f1f5f9; }
  .bg-slate-50 { background-color: #f8fafc; }
  .bg-indigo-600 { background-color: #4f46e5; }
  .bg-indigo-500 { background-color: #6366f1; }
  .bg-indigo-50 { background-color: #eef2ff; }
  .bg-indigo-900\\/80 { background-color: rgba(49, 46, 129, 0.8); }
  .bg-emerald-50 { background-color: #ecfdf5; }
  .text-white { color: #ffffff; }
  .text-slate-800 { color: #1e293b; }
  .text-slate-700 { color: #334155; }
  .text-slate-600 { color: #475569; }
  .text-slate-500 { color: #64748b; }
  .text-slate-400 { color: #94a3b8; }
  .text-slate-300 { color: #cbd5e1; }
  .text-indigo-600 { color: #4f46e5; }
  .text-indigo-700 { color: #4338ca; }
  .text-indigo-950 { color: #1e1b4b; }
  .text-indigo-200 { color: #c7d2fe; }
  .text-emerald-900 { color: #064e3b; }
  .text-emerald-800 { color: #065f46; }
  .text-emerald-700 { color: #047857; }
  .text-emerald-600 { color: #059669; }
  .border { border-width: 1px; border-style: solid; }
  .border-t { border-top-width: 1px; border-top-style: solid; }
  .border-slate-200 { border-color: #e2e8f0; }
  .border-slate-100 { border-color: #f1f5f9; }
  .border-indigo-100 { border-color: #e0e7ff; }
  .border-emerald-100 { border-color: #d1fae5; }
  .p-4 { padding: 1rem; }
  .p-3 { padding: 0.75rem; }
  .p-2\\.5 { padding: 0.625rem; }
  .p-2 { padding: 0.5rem; }
  .p-1 { padding: 0.25rem; }
  .px-4 { padding-left: 1rem; padding-right: 1rem; }
  .py-3\\.5 { padding-top: 0.875rem; padding-bottom: 0.875rem; }
  .py-2\\.5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }
  .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
  .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
  .px-1\\.5 { padding-left: 0.375rem; padding-right: 0.375rem; }
  .flex { display: flex; }
  .grid { display: grid; }
  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gap-2 { gap: 0.5rem; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .justify-center { justify-content: center; }
  .space-x-1 > * + * { margin-left: 0.25rem; }
  .space-x-1\\.5 > * + * { margin-left: 0.375rem; }
  .space-x-2 > * + * { margin-left: 0.5rem; }
  .space-x-2\\.5 > * + * { margin-left: 0.625rem; }
  .space-y-2 > * + * { margin-top: 0.5rem; }
  .space-y-3 > * + * { margin-top: 0.75rem; }
  .space-y-3\\.5 > * + * { margin-top: 0.875rem; }
  .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
  .text-xs { font-size: 0.75rem; line-height: 1rem; }
  .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
  .text-\\[11px\\] { font-size: 11px; line-height: 1rem; }
  .text-\\[10px\\] { font-size: 10px; line-height: 0.875rem; }
  .font-semibold { font-weight: 600; }
  .font-bold { font-weight: 700; }
  .font-black { font-weight: 900; }
  .font-medium { font-weight: 500; }
  .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
  .leading-tight { line-height: 1.25; }
  .leading-relaxed { line-height: 1.5; }
  .cursor-pointer { cursor: pointer; }
  .cursor-not-allowed { cursor: not-allowed; }
  .overflow-hidden { overflow: hidden; }
  button {
    border: none;
    font-family: inherit;
    cursor: pointer;
  }
  button:hover {
    filter: brightness(0.96);
  }
`;

/**
 * Mounts or updates the PromptModal inside an isolated Shadow DOM container
 */
export function mountPromptModal(props: PromptModalProps): void {
  // If host does not exist, create it
  if (!hostElement) {
    const existing = document.getElementById(HOST_ELEMENT_ID);
    if (existing) {
      existing.remove();
    }

    hostElement = document.createElement('div');
    hostElement.id = HOST_ELEMENT_ID;
    hostElement.style.position = 'fixed';
    hostElement.style.zIndex = '2147483647';
    hostElement.style.bottom = '0';
    hostElement.style.right = '0';
    document.body.appendChild(hostElement);

    const shadowRoot = hostElement.attachShadow({ mode: 'open' });

    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = SHADOW_STYLES;
    shadowRoot.appendChild(styleEl);

    // Root container
    const reactContainer = document.createElement('div');
    reactContainer.id = 'formpilot-shadow-app';
    shadowRoot.appendChild(reactContainer);

    activeRoot = createRoot(reactContainer);
  }

  if (activeRoot) {
    activeRoot.render(<PromptModal {...props} />);
  }
}

/**
 * Unmounts the PromptModal and removes the host element from the DOM
 */
export function unmountPromptModal(): void {
  if (activeRoot) {
    activeRoot.unmount();
    activeRoot = null;
  }
  if (hostElement) {
    hostElement.remove();
    hostElement = null;
  }
}
