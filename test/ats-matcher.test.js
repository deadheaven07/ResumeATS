import { test, describe } from 'node:test';
import assert from 'node:assert';
import { analyzeAtsMatch, buildStarBullet, calculateResumePageBudget } from '../js/ats-matcher.js';

describe('ATS Matcher Engine', () => {
  test('returns 0 and empty stats when inputs are empty', () => {
    const result = analyzeAtsMatch('', '');
    assert.strictEqual(result.score, 0);
    assert.strictEqual(result.matchedSkills.length, 0);
    assert.strictEqual(result.missingSkills.length, 0);
  });

  test('correctly extracts canonical skills and matches synonyms', () => {
    const resume = 'Experienced software engineer skilled in TypeScript, React, and AWS (ec2, s3).';
    const jd = 'Looking for an engineer proficient in TypeScript, React, Docker, and Amazon Web Services (AWS).';
    
    const result = analyzeAtsMatch(resume, jd);
    assert.ok(result.score > 0, 'Score should be positive');
    
    const matchedCanonicals = result.matchedSkills.map(s => s.canonical);
    assert.ok(matchedCanonicals.includes('TypeScript'));
    assert.ok(matchedCanonicals.includes('React'));
    assert.ok(matchedCanonicals.includes('Amazon Web Services (AWS)'));
    
    const missingCanonicals = result.missingSkills.map(s => s.canonical);
    assert.ok(missingCanonicals.includes('Docker & Containerization'));
  });

  test('provides confidence indicator and breakdown pillars', () => {
    const resume = 'Senior Fullstack Engineer with 5+ years experience. Built microservices with Node.js, TypeScript, PostgreSQL, and AWS ECS. Decreased latency by 35% and saved $40,000 annually.';
    const jd = 'We are hiring a Senior Fullstack Engineer. Requirements: TypeScript, Node.js, PostgreSQL, Docker, Kubernetes, Terraform, and CI/CD pipelines.';

    const result = analyzeAtsMatch(resume, jd);
    assert.ok(result.confidence, 'Confidence object should exist');
    assert.ok(['High', 'Moderate', 'Low'].includes(result.confidence.level));
    assert.ok(result.breakdown, 'Breakdown object should exist');
    assert.strictEqual(result.breakdown.pillars.length, 4);
    assert.ok(result.breakdown.finalScore >= 0 && result.breakdown.finalScore <= 100);
  });

  test('buildStarBullet properly structures bullet point with punctuation', () => {
    const bullet = buildStarBullet({
      actionVerb: 'Architected',
      contextProblem: 'distributed microservices to handle burst traffic',
      quantifiableOutcome: 'reducing p99 latency by 45%'
    });
    assert.strictEqual(bullet, 'Architected distributed microservices to handle burst traffic, reducing p99 latency by 45%.');
  });

  test('calculateResumePageBudget calculates line counts accurately', () => {
    const text = 'Line 1\nLine 2\nLine 3\nLine 4';
    const budget = calculateResumePageBudget(text);
    assert.ok(budget.totalLines >= 4);
    assert.ok(budget.badgeText);
  });
});
