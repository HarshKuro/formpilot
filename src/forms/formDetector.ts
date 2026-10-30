/**
 * Detects if a given URL or current window location belongs to Google Forms.
 */
export function isGoogleFormsPage(url: string = typeof window !== 'undefined' ? window.location.href : ''): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'docs.google.com') {
      return false;
    }
    // Check path for /forms/
    return parsed.pathname.startsWith('/forms/');
  } catch {
    return false;
  }
}
