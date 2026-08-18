import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateAIR,
  calculateCR,
  calculateMCP,
  calculateRCR,
  type MetricObservation,
} from '../src/index.js';

const base = (overrides: Partial<MetricObservation>): MetricObservation => ({
  id: 'obs-1',
  observationCode: 'OBS-1',
  executionId: 'exec-1',
  executionCode: 'EXEC-1',
  executionLifecycle: 'completed',
  observationLifecycle: 'validated',
  reviewStatus: 'accepted',
  targetType: 'domain',
  targetValue: 'gslhub.com',
  mentioned: false,
  cited: false,
  citationPosition: null,
  baselineObservationId: null,
  variationLevel: 'not-assessed',
  ...overrides,
});

const metricInput = (observations: MetricObservation[]) => ({
  observations,
  targetType: 'domain',
  targetValue: 'https://www.gslhub.com/',
});

test('AIR reproduces the public synthetic fixture: 3/4 = 0.75', () => {
  const observations = [
    base({ id: 'air-1', executionId: 'air-exec-1', mentioned: true }),
    base({ id: 'air-2', executionId: 'air-exec-2', mentioned: true }),
    base({ id: 'air-3', executionId: 'air-exec-3', mentioned: true }),
    base({ id: 'air-4', executionId: 'air-exec-4', mentioned: false }),
  ];

  const result = calculateAIR(metricInput(observations));
  assert.equal(result.metricCode, 'AIR');
  assert.equal(result.numerator, 3);
  assert.equal(result.denominator, 4);
  assert.equal(result.numericValue, 0.75);
  assert.equal(result.excludedCount, 0);
  assert.equal(result.inputChecksum.length, 64);
  assert.equal(result.outputChecksum.length, 64);
});

test('CR reproduces the public synthetic fixture: 2/4 = 0.50', () => {
  const observations = [
    base({ id: 'cr-1', executionId: 'cr-exec-1', cited: true }),
    base({ id: 'cr-2', executionId: 'cr-exec-2', cited: true }),
    base({ id: 'cr-3', executionId: 'cr-exec-3', cited: false }),
    base({ id: 'cr-4', executionId: 'cr-exec-4', cited: false }),
  ];

  const result = calculateCR(metricInput(observations));
  assert.equal(result.metricCode, 'CR');
  assert.equal(result.numerator, 2);
  assert.equal(result.denominator, 4);
  assert.equal(result.numericValue, 0.5);
});

test('MCP reproduces the public synthetic fixture: mean([1,2,3]) = 2.00', () => {
  const observations = [
    base({ id: 'mcp-1', executionId: 'mcp-exec-1', cited: true, citationPosition: 1 }),
    base({ id: 'mcp-2', executionId: 'mcp-exec-2', cited: true, citationPosition: 2 }),
    base({ id: 'mcp-3', executionId: 'mcp-exec-3', cited: true, citationPosition: 3 }),
  ];

  const result = calculateMCP(metricInput(observations));
  assert.equal(result.metricCode, 'MCP');
  assert.equal(result.positionSum, 6);
  assert.equal(result.denominator, 3);
  assert.equal(result.numericValue, 2);
  assert.deepEqual(result.eligiblePositions, [1, 2, 3]);
});

test('RCR reproduces the public synthetic fixture: 3/4 = 0.75', () => {
  const observations = [
    base({ id: 'rcr-base', executionId: 'rcr-exec-1', variationLevel: 'not-assessed' }),
    base({ id: 'rcr-2', executionId: 'rcr-exec-2', baselineObservationId: 'rcr-base', variationLevel: 'none' }),
    base({ id: 'rcr-3', executionId: 'rcr-exec-3', baselineObservationId: 'rcr-base', variationLevel: 'low' }),
    base({ id: 'rcr-4', executionId: 'rcr-exec-4', baselineObservationId: 'rcr-base', variationLevel: 'low' }),
    base({ id: 'rcr-5', executionId: 'rcr-exec-5', baselineObservationId: 'rcr-base', variationLevel: 'high' }),
  ];

  const result = calculateRCR(metricInput(observations));
  assert.equal(result.metricCode, 'RCR');
  assert.equal(result.baselineObservationId, 'rcr-base');
  assert.equal(result.numerator, 3);
  assert.equal(result.denominator, 4);
  assert.equal(result.numericValue, 0.75);
  assert.deepEqual(result.assessedVariationLevels, ['none', 'low', 'low', 'high']);
});

test('target normalization keeps equivalent domain forms comparable', () => {
  const result = calculateAIR({
    observations: [base({ mentioned: true, targetValue: 'WWW.GSLHUB.COM/' })],
    targetType: 'DOMAIN',
    targetValue: 'https://gslhub.com',
  });
  assert.equal(result.numericValue, 1);
});

test('ineligible records are excluded and reported rather than silently discarded', () => {
  const result = calculateAIR(metricInput([
    base({ id: 'valid', executionId: 'exec-valid', mentioned: true }),
    base({ id: 'excluded', executionId: 'exec-excluded', mentioned: true, reviewStatus: 'under-review' }),
  ]));

  assert.equal(result.numericValue, 1);
  assert.equal(result.denominator, 1);
  assert.equal(result.excludedCount, 1);
  assert.match(result.excludedCandidates[0]?.reason ?? '', /not accepted/);
});

test('duplicate eligible observations for one execution are rejected', () => {
  const duplicate = base({ id: 'obs-duplicate', observationCode: 'OBS-DUP', mentioned: true });
  assert.throws(
    () => calculateAIR({ observations: [base({ mentioned: true }), duplicate], targetType: 'domain', targetValue: 'gslhub.com' }),
    /cannot use more than one accepted observation/,
  );
});
