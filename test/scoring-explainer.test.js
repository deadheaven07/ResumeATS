import test, { describe } from 'node:test';
import assert from 'node:assert';
import { calculateConfidenceScore, decomposeAtsScore } from '../js/services/scoring-explainer.js';

describe('Scoring Explainer & Confidence Engine', () => {
  test('calculateConfidenceScore returns High confidence for comprehensive inputs', () => {
    const result = calculateConfidenceScore({
      jdText: 'A '.repeat(260),
      resumeText: 'B '.repeat(320),
      jdSkillsCount: 12,
      resumeLength: 2000
    });

    assert.strictEqual(result.level, 'High');
    assert.ok(result.score >= 82);
    assert.ok(result.explanation.includes('High statistical confidence'));
  });

  test('calculateConfidenceScore returns Low confidence for thin or brief inputs', () => {
    const result = calculateConfidenceScore({
      jdText: 'Short job description seeking engineer',
      resumeText: 'Brief resume summary',
      jdSkillsCount: 2,
      resumeLength: 50
    });

    assert.strictEqual(result.level, 'Low');
    assert.ok(result.score < 60);
    assert.ok(result.explanation.includes('Low confidence'));
  });

  test('decomposeAtsScore accurately separates pillars and computes slop penalty', () => {
    const result = decomposeAtsScore({
      matchedSkills: [{ canonical: 'Python' }, { canonical: 'Docker' }, { canonical: 'AWS' }],
      missingSkills: [{ canonical: 'Kubernetes' }],
      slopCount: 2,
      hasMetrics: true,
      metricsCount: 3,
      actionVerbCount: 5,
      strictness: 'standard'
    });

    assert.strictEqual(result.pillars.length, 4);
    assert.strictEqual(result.slopPenalty, 6); // 2 * 3
    assert.ok(result.finalScore > 0 && result.finalScore <= 100);
    assert.ok(result.summaryExplanation.includes('AI slop penalty'));
    assert.ok(result.recommendations.length > 0);
  });

  test('decomposeAtsScore gives clean human tone when slop count is zero', () => {
    const result = decomposeAtsScore({
      matchedSkills: [{ canonical: 'Go' }, { canonical: 'Kafka' }],
      missingSkills: [],
      slopCount: 0,
      hasMetrics: true,
      metricsCount: 4,
      actionVerbCount: 6,
      strictness: 'faang'
    });

    const slopPillar = result.pillars.find(p => p.id === 'ai_slop_penalty');
    assert.strictEqual(slopPillar.status, 'Clean Human Tone');
    assert.strictEqual(result.slopPenalty, 0);
    assert.strictEqual(slopPillar.earned, 0);
  });
});
