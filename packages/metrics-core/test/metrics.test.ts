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

const observations: MetricObservation[] = [
  base({
    id: 'obs-1', observationCode: 'OBS-1', executionId: 'exec-1', executionCode: 'EXEC-1',
    mentioned: true, cited: true, citationPosition: 1,
  }),
  base({
    id: 'obs-2', observationCode: 'OBS-2', executionId: 'exec-2', executionCode: 'EXEC-2',
    mentioned: true, cited: false, baselineObservationId: 'obs-1', variationLevel: 'low',
  }),
  base({
    id: 'obs-3', observationCode: 'OBS-3', executionId: 'exec-3', executionCode: 'EXEC-3',
    mentioned: true, cited: true, citationPosition: 3, baselineObservationId: 'obs-1', variationLevel: 'medium',
  }),
  base({
    id: 'obs-4', observationCode: 'OBS-4', executionId: 'exec-4', executionCode: 'EXEC-4',
    mentioned: false, cited: false, baselineObservationId: 'obs-1', variationLevel: 'none',
  }),
  base({
    id: 'obs-5', observationCode: 'OBS-5', executionId: 'exec-5', executionCode: 'EXEC-5',
    mentioned: false, cited: false, baselineObservationId: 'obs-1', variationLevel: 'high',
  }),
];

const input = { observations, targetType: 'domain', targetValue: 'https://www.gslhub.com/' };

test('AIR computes answer inclusion proportion', () => {
  const result = calculateAIR(input);
  assert.equal(result.metricCode, 'AIR');
  assert.equal(result.numerator, 3);
  assert.equal(result.denominator, 5);
  assert.equal(result.numericValue, 0.6);
  assert.equal(result.excludedCount, 0);
  assert.equal(result.inputChecksum.length, 64);
  assert.equal(result.outputChecksum.length, 64);
});

test('CR computes target citation proportion', () => {
  const result = calculateCR(input);
  assert.equal(result.metricCode, 'CR');
  assert.equal(result.numerator, 2);
  assert.equal(result.denominator, 5);
  assert.equal(result.numericValue, 0.4);
});

test('MCP uses only cited observations with valid one-based positions', () => {
  const result = calculateMCP(input);
  assert.equal(result.metricCode, 'MCP');
  assert.equal(result.positionSum, 4);
  assert.equal(result.denominator, 2);
  assert.equal(result.numericValue, 2);
  assert.deepEqual(result.eligiblePositions, [1, 3]);
  assert.equal(result.excludedCount, 3);
});

test('RCR excludes the frozen baseline and scores none/low as consistent', () => {
  const result = calculateRCR(input);
  assert.equal(result.metricCode, 'RCR');
  assert.equal(result.baselineObservationId, 'obs-1');
  assert.equal(result.numerator, 2);
  assert.equal(result.denominator, 4);
  assert.equal(result.numericValue, 0.5);
  assert.deepEqual(result.assessedVariationLevels, ['low', 'medium', 'none', 'high']);
});

test('target normalization keeps equivalent domain forms comparable', () => {
  const result = calculateAIR({
    observations: [base({ mentioned: true, targetValue: 'WWW.GSLHUB.COM/' })],
    targetType: 'DOMAIN',
    targetValue: 'https://gslhub.com',
  });
  assert.equal(result.numericValue, 1);
});

test('duplicate eligible observations for one execution are rejected', () => {
  const duplicate = base({ id: 'obs-duplicate', observationCode: 'OBS-DUP', mentioned: true });
  assert.throws(
    () => calculateAIR({ observations: [base({ mentioned: true }), duplicate], targetType: 'domain', targetValue: 'gslhub.com' }),
    /cannot use more than one accepted observation/,
  );
});
