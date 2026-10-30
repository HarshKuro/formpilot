import { describe, it, expect } from 'vitest';
import { isGoogleFormsPage } from '../../src/forms/formDetector';

describe('Google Forms Detector', () => {
  it('detects standard Google Form viewform URL', () => {
    expect(isGoogleFormsPage('https://docs.google.com/forms/d/e/1FAIpQLSdnJWq-yXoCrlPTB47t4-Aw_zeGKFXeub3z4hhx23EjOmhd2w/viewform')).toBe(true);
  });

  it('detects Google Form formResponse URL', () => {
    expect(isGoogleFormsPage('https://docs.google.com/forms/d/e/1FAIpQLSdnJWq-yXoCrlPTB47t4-Aw_zeGKFXeub3z4hhx23EjOmhd2w/formResponse')).toBe(true);
  });

  it('detects Google Forms edit URLs', () => {
    expect(isGoogleFormsPage('https://docs.google.com/forms/d/12345/edit')).toBe(true);
  });

  it('rejects unrelated Google Docs or Sheets URLs', () => {
    expect(isGoogleFormsPage('https://docs.google.com/document/d/12345/edit')).toBe(false);
    expect(isGoogleFormsPage('https://docs.google.com/spreadsheets/d/12345/edit')).toBe(false);
  });

  it('rejects external websites', () => {
    expect(isGoogleFormsPage('https://example.com/form')).toBe(false);
    expect(isGoogleFormsPage('https://google.com')).toBe(false);
  });
});
