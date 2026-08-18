import type { MetricInput, ResponseConsistencyRateResult, VariationLevel } from './types.js';
import {
  commonEligibilityReason,
  exclusion,
  normalizeTargetType,
  normalizeTargetValue,
  observationCode,
  roundMetric,
  sortedInputRows,
  stableHash,
} from './utils.js';

const assessedLevels = new Set<VariationLevel>(['none', 'low', 'medium', 'high']);
const consistentLevels = new Set<VariationLevel>(['none', 'low']);

export const calculateRCR = ({
  observations,
  targetType,
  targetValue,
  precision = 4,
}: MetricInput): ResponseConsistencyRateResult => {
  if (observations.length < 2) {
    throw new Error('RCR requires one baseline observation and at least one comparison observation.');
  }

  const expectedTargetType = normalizeTargetType(targetType);
  const expectedTargetValue = normalizeTargetValue(targetValue);
  const byId = new Map(observations.map((observation) => [observation.id, observation]));
  const validObservationIds: string[] = [];
  const validExecutionIds: string[] = [];
  const assessedVariationLevels: Array<'none' | 'low' | 'medium' | 'high'> = [];
  const excludedCandidates: ResponseConsistencyRateResult['excludedCandidates'] = [];
  const usedExecutions = new Set<string>();
  const baselineIds = new Set<string>();
  const inputRows: Array<Record<string, unknown>> = [];
  let numerator = 0;

  for (const observation of observations) {
    inputRows.push({
      observationId: observation.id,
      observationCode: observationCode(observation),
      executionId: observation.executionId,
      executionLifecycle: observation.executionLifecycle,
      observationLifecycle: observation.observationLifecycle,
      reviewStatus: observation.reviewStatus,
      targetType: normalizeTargetType(observation.targetType),
      targetValue: normalizeTargetValue(observation.targetValue),
      baselineObservationId: observation.baselineObservationId ?? null,
      variationLevel: observation.variationLevel ?? null,
    });

    const commonReason = commonEligibilityReason(observation, expectedTargetType, expectedTargetValue);
    if (commonReason) {
      excludedCandidates.push(exclusion(observation, commonReason));
      continue;
    }

    if (!observation.baselineObservationId || observation.variationLevel === 'not-assessed') {
      excludedCandidates.push(exclusion(observation, 'Frozen baseline observation; it is not part of the assessed-comparison denominator.'));
      continue;
    }

    if (!observation.variationLevel || !assessedLevels.has(observation.variationLevel)) {
      excludedCandidates.push(exclusion(observation, `Variation level ${observation.variationLevel || 'missing'} is not an assessed RCR category.`));
      continue;
    }

    if (observation.baselineObservationId === observation.id) {
      throw new Error(`RCR comparison ${observationCode(observation)} cannot reference itself as baseline.`);
    }

    if (usedExecutions.has(observation.executionId)) {
      throw new Error(`RCR cannot use more than one accepted comparison observation for execution ${observation.executionCode || observation.executionId}.`);
    }

    usedExecutions.add(observation.executionId);
    baselineIds.add(observation.baselineObservationId);
    validObservationIds.push(observation.id);
    validExecutionIds.push(observation.executionId);
    assessedVariationLevels.push(observation.variationLevel as 'none' | 'low' | 'medium' | 'high');
    if (consistentLevels.has(observation.variationLevel)) numerator += 1;
  }

  if (baselineIds.size !== 1) {
    throw new Error(`RCR requires exactly one frozen baseline across assessed comparisons; found ${baselineIds.size}.`);
  }

  const baselineObservationId = [...baselineIds][0];
  if (!baselineObservationId) throw new Error('RCR could not resolve the frozen baseline observation identifier.');

  const baseline = byId.get(baselineObservationId);
  if (!baseline) {
    throw new Error(`RCR baseline observation ${baselineObservationId} is not included in the candidate observation set.`);
  }

  const baselineReason = commonEligibilityReason(baseline, expectedTargetType, expectedTargetValue);
  if (baselineReason) {
    throw new Error('RCR baseline must be a completed, validated, accepted and target-matched observation.');
  }

  const denominator = validObservationIds.length;
  if (denominator === 0) throw new Error('RCR is undefined because no valid assessed comparisons remain.');

  const numericValue = roundMetric(numerator / denominator, precision);
  const normalizedInputRows = sortedInputRows(inputRows);
  const outputPayload = {
    metricCode: 'RCR' as const,
    metricVersion: '0.1.0' as const,
    targetType: expectedTargetType,
    targetValue: expectedTargetValue,
    numerator,
    denominator,
    candidateCount: observations.length,
    excludedCount: excludedCandidates.length,
    numericValue,
    baselineObservationId,
    assessedVariationLevels,
  };

  return {
    ...outputPayload,
    validObservationIds,
    validExecutionIds,
    excludedCandidates,
    inputChecksum: stableHash(normalizedInputRows),
    outputChecksum: stableHash(outputPayload),
    querySnapshot: JSON.stringify({
      targetType: expectedTargetType,
      targetValue: expectedTargetValue,
      baselineObservationId,
      requiredExecutionLifecycle: 'completed',
      requiredObservationLifecycle: 'validated',
      requiredObservationReviewStatus: 'accepted',
      consistentVariationLevels: ['none', 'low'],
      assessedVariationLevels: ['none', 'low', 'medium', 'high'],
      missingDataPolicy: 'exclude-and-report',
      candidateObservationIds: observations.map(({ id }) => id),
      excludedCandidates,
    }, null, 2),
  };
};
