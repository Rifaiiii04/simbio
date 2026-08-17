import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateSkillIntersection, SkillItem } from './skill-intersection.js';

test('Skill Intersection Case A: Speaker teaches Programming & Guitar, Partner wants Programming & UI/UX', () => {
  const speakerTeach: SkillItem[] = [
    { name: 'Programming', slug: 'programming' },
    { name: 'Guitar', slug: 'guitar' },
  ];
  const partnerLearn: SkillItem[] = [
    { name: 'Programming', slug: 'programming' },
    { name: 'UI/UX', slug: 'ui-ux' },
  ];

  const result = calculateSkillIntersection(speakerTeach, partnerLearn);
  assert.equal(result.length, 1);
  assert.equal(result[0].name, 'Programming');
});

test('Skill Intersection Case B: Speaker teaches UI/UX & Painting, Partner wants Programming', () => {
  const speakerTeach: SkillItem[] = [
    { name: 'UI/UX', slug: 'ui-ux' },
    { name: 'Painting', slug: 'painting' },
  ];
  const partnerLearn: SkillItem[] = [
    { name: 'Programming', slug: 'programming' },
  ];

  const result = calculateSkillIntersection(speakerTeach, partnerLearn);
  assert.equal(result.length, 0);
});

test('Skill Intersection Case C: Speaker teaches Programming & Guitar, Partner wants Guitar', () => {
  const speakerTeach: SkillItem[] = [
    { name: 'Programming', slug: 'programming' },
    { name: 'Guitar', slug: 'guitar' },
  ];
  const partnerLearn: SkillItem[] = [
    { name: 'Guitar', slug: 'guitar' },
  ];

  const result = calculateSkillIntersection(speakerTeach, partnerLearn);
  assert.equal(result.length, 1);
  assert.equal(result[0].name, 'Guitar');
});
