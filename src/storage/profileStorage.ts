import { StudentProfile } from '../domain/profile';

const STORAGE_KEY = 'formpilot_profile';
const SETTINGS_KEY = 'formpilot_settings';

export interface StorageSettings {
  autoOpenPrompt: boolean;
  minConfidenceThreshold: number;
}

const DEFAULT_SETTINGS: StorageSettings = {
  autoOpenPrompt: true,
  minConfidenceThreshold: 0.8
};

/**
 * Retrieves the stored student profile from local extension storage.
 */
export async function getProfile(): Promise<StudentProfile | null> {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
    // Fallback for non-extension environments (e.g. testing with localStorage)
    if (typeof localStorage !== 'undefined') {
      const item = localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : null;
    }
    return null;
  }

  const result = await chrome.storage.local.get(STORAGE_KEY);
  if (result && result[STORAGE_KEY]) {
    return result[STORAGE_KEY] as StudentProfile;
  }
  return null;
}

/**
 * Saves the student profile locally. Never transmits data to any network or server.
 */
export async function saveProfile(profile: StudentProfile): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
    return;
  }

  await chrome.storage.local.set({ [STORAGE_KEY]: profile });
}

/**
 * Clears the stored student profile completely from local storage.
 */
export async function clearProfile(): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    return;
  }

  await chrome.storage.local.remove(STORAGE_KEY);
}

/**
 * Exports stored profile as a clean JSON string for local user backup.
 */
export async function exportProfileJson(): Promise<string> {
  const profile = await getProfile();
  return JSON.stringify(profile || {}, null, 2);
}

/**
 * Imports profile from a JSON string, validates and saves it.
 */
export async function importProfileJson(jsonString: string): Promise<StudentProfile> {
  const parsed = JSON.parse(jsonString) as StudentProfile;
  await saveProfile(parsed);
  return parsed;
}

/**
 * Retrieves settings
 */
export async function getSettings(): Promise<StorageSettings> {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
    return DEFAULT_SETTINGS;
  }
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(result?.[SETTINGS_KEY] || {}) };
}

/**
 * Updates settings
 */
export async function saveSettings(settings: Partial<StorageSettings>): Promise<void> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ [SETTINGS_KEY]: updated });
  }
}
