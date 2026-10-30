import { describe, it, expect, beforeEach } from 'vitest';
import {
  getProfile,
  saveProfile,
  clearProfile,
  exportProfileJson,
  importProfileJson
} from '../../src/storage/profileStorage';
import { StudentProfile } from '../../src/domain/profile';

describe('Profile Storage Layer', () => {
  beforeEach(async () => {
    await clearProfile();
  });

  it('returns null when no profile has been saved', async () => {
    const profile = await getProfile();
    expect(profile).toBeNull();
  });

  it('saves and retrieves student profile', async () => {
    const sample: StudentProfile = {
      uid: '21BCS10100',
      name: 'Harsh Partap Jain',
      gender: 'Male',
      email: 'harsh@example.com',
      mobile: '9876543210'
    };
    await saveProfile(sample);
    const loaded = await getProfile();
    expect(loaded).toEqual(sample);
  });

  it('clears stored profile', async () => {
    await saveProfile({ uid: 'TEST1234' });
    await clearProfile();
    const loaded = await getProfile();
    expect(loaded).toBeNull();
  });

  it('exports profile as JSON string', async () => {
    await saveProfile({ uid: 'TEST_EXPORT', name: 'Student' });
    const jsonStr = await exportProfileJson();
    const parsed = JSON.parse(jsonStr);
    expect(parsed.uid).toBe('TEST_EXPORT');
  });

  it('imports profile from valid JSON string', async () => {
    const json = JSON.stringify({ uid: 'IMPORTED_UID', name: 'Imported' });
    const profile = await importProfileJson(json);
    expect(profile.uid).toBe('IMPORTED_UID');
    const stored = await getProfile();
    expect(stored?.uid).toBe('IMPORTED_UID');
  });
});
