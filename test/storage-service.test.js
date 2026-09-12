import { test, describe } from 'node:test';
import assert from 'node:assert';
import { StorageService } from '../js/services/storage-service.js';

describe('StorageService Repository', () => {
  test('initializes default profile when storage is empty', () => {
    const service = new StorageService(null); // In-memory
    const profiles = service.getProfiles();
    assert.strictEqual(profiles.length, 1);
    assert.strictEqual(profiles[0].id, 'prof_default');
    assert.ok(profiles[0].resumeText.length > 0);
  });

  test('creates, updates, and retrieves multi-resume profiles', () => {
    const service = new StorageService(null);
    const created = service.saveProfile({
      title: 'Cloud Infrastructure Architect',
      targetRole: 'Staff Infrastructure Engineer',
      resumeText: 'Kubernetes, Terraform, AWS, Golang.',
      targetJd: 'Senior Staff SRE wanted.'
    });

    assert.ok(created.id);
    assert.strictEqual(created.title, 'Cloud Infrastructure Architect');

    const all = service.getProfiles();
    assert.strictEqual(all.length, 2);

    // Update profile
    service.saveProfile({
      id: created.id,
      title: 'Principal Cloud Architect'
    });

    const updated = service.getProfiles().find(p => p.id === created.id);
    assert.strictEqual(updated.title, 'Principal Cloud Architect');
  });

  test('switching active profile works correctly', () => {
    const service = new StorageService(null);
    const created = service.saveProfile({
      title: 'Mobile Engineer',
      targetRole: 'iOS Dev'
    });

    service.setActiveProfileId(created.id);
    assert.strictEqual(service.getActiveProfileId(), created.id);
    assert.strictEqual(service.getActiveProfile().title, 'Mobile Engineer');
  });

  test('prevents deleting the only remaining profile', () => {
    const service = new StorageService(null);
    const defaultProfile = service.getProfiles()[0];
    assert.throws(() => {
      service.deleteProfile(defaultProfile.id);
    }, /Cannot delete the only remaining profile/);
  });

  test('records and queries audit comparison history', () => {
    const service = new StorageService(null);
    service.saveAuditRecord({
      targetCompany: 'Google',
      targetRole: 'Software Engineer L5',
      score: 84,
      statusTier: 'Strong ATS Match',
      matchedSkills: [{ canonical: 'TypeScript' }, { canonical: 'Go' }],
      missingSkills: [{ canonical: 'Kubernetes' }]
    });

    const history = service.getAuditHistory();
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].targetCompany, 'Google');
    assert.strictEqual(history[0].score, 84);
  });

  test('full backup export and import works reliably', () => {
    const service = new StorageService(null);
    service.saveProfile({ title: 'Export Test Profile' });
    const backupJson = service.exportBackupJson();

    assert.ok(backupJson.includes('Export Test Profile'));

    // New service instance
    const service2 = new StorageService(null);
    const result = service2.importBackupJson(backupJson);
    assert.strictEqual(result.success, true);
    assert.ok(service2.getProfiles().some(p => p.title === 'Export Test Profile'));
  });
});
