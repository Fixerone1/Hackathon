import test from 'node:test';
import assert from 'node:assert/strict';
import { hasVisiblePassportContent, normalizePassportData, passportFromProfile } from '../src/lib/skills-passport.ts';

test('passport drafts copy only portfolio-relevant profile data and default to private', () => {
  const passport = passportFromProfile({
    display_name: 'Learner Name',
    target_role: 'Junior designer',
    about_me: 'I enjoy solving visual communication problems.',
    target_income_monthly: 25000,
    work_authorization: 'citizen',
    skill_ratings: [{ name: 'Layout', level: 3, evidence_note: 'Designed a community flyer.' }],
    experience_by_area: [{ area: 'Community volunteering', months: 4 }],
    certifications: ['First aid'],
    highest_qualification: 'Matric',
  });

  assert.equal(passport.display_name, 'Learner Name');
  assert.equal(passport.headline, 'Junior designer');
  assert.equal(passport.skills[0].evidence_note, 'Designed a community flyer.');
  assert.equal(passport.experience[0].months, 4);
  assert.equal(passport.education[0].qualification, 'Matric');
  assert.deepEqual(passport.projects, []);
  assert.equal(passport.email, '');
  assert.equal(Object.values(passport.visibility).some(Boolean), false);
  assert.equal('target_income_monthly' in passport, false);
  assert.equal('work_authorization' in passport, false);
});

test('normalizes saved passport data and defaults unknown visibility flags to private', () => {
  const passport = normalizePassportData({
    summary: `  ${'a'.repeat(800)}  `,
    skills: [{ name: 'Spreadsheets', level: 8, evidence_note: '  Example  ', private_note: 'hidden' }],
    projects: [{ title: 'Portfolio', url: 'javascript:alert(1)', private_note: 'hidden' }],
    visibility: { summary: true, skills: true, email: 'true', unexpected: true },
  });

  assert.equal(passport.summary.length, 700);
  assert.equal(passport.skills[0].level, null);
  assert.equal(passport.skills[0].evidence_note, 'Example');
  assert.equal(passport.projects[0].url, 'javascript:alert(1)');
  assert.equal(passport.visibility.summary, true);
  assert.equal(passport.visibility.email, false);
  assert.equal('private_note' in passport.skills[0], false);
  assert.equal('unexpected' in passport.visibility, false);
});

test('publication requires at least one selected non-contact section with content', () => {
  const passport = passportFromProfile({ email: 'private@example.test' });
  passport.visibility.email = true;
  assert.equal(hasVisiblePassportContent(passport), false);

  passport.headline = 'Junior designer';
  passport.visibility.headline = true;
  assert.equal(hasVisiblePassportContent(passport), true);
});
