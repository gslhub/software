import type { CitationRateResult, MetricInput } from './types.js';
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

export const calculateCR = ({
  observations,
  targetType,
  targetValue,
  precision = 4,
}: MetricInput): CitationRateResult => {
  if (observations.length === 0) throw new Error('CR requires at least one candidate observation.');

  const expectedTargetType = normalizeTargetType(targetType);
  const expectedTargetValue = normalizeTargetValue(targetValue);
  const validObservationIds: string[] = [];
  const validExecutionIds: string[] = [];
  const excludedCandidates: CitationRateResult['excludedCandidates'] = [];
  const usedExecutions = new Set<string>();
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
      cited: observation.cited ?? null,
    });

    const commonReason = commonEligibilityReason(observation, expectedTargetType, expectedTargetValue);
    if (commonReason) {
      excludedCandidates.push(exclusion(observation, commonReason));
      continue;
    }
    if (typeof observation.cited !== 'boolean') {
      excludedCandidates.push(exclusion(observation, 'The citation outcome is not codable as a boolean value.'));
      continue;
    }
    if (usedExecutions.has(observation.executionId)) {
      throw new Error(`CR cannot use more than one accepted observation for execution ${observation.executionCode || observation.executionId}.`);
    }

    usedExecutions.add(observation.executionId);
    validObservationIds.push(observation.id);
    validExecutionIds.push(observation.executionId);
    if (observation.cited) numerator += 1;
  }

  const denominator = validObservationIds.length;
  if (denominator === 0) {
    throw new Error('CR is undefined because no completed execution has one validated, accepted and target-matched observation.');
  }

  const numericValue = roundMetric(numerator / denominator, precision);
  const normalizedInputRows = sortedInputRows(inputRows);
  const outputPayload = {
    metricCode: 'CR' as const,
    metricVersion: '0.1.0' as const,
    targetType: expectedTargetType,
    targetValue: expectedTargetValue,
    numerator,
    denominator,
    candidateCount: observations.length,
    excludedCount: excludedCandidates.length,
    numericValue,
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
      requiredExecutionLifecycle: 'completed',
      requiredObservationLifecycle: 'validated',
      requiredObservationReviewStatus: 'accepted',
      missingDataPolicy: 'exclude-and-report',
      candidateObservationIds: observations.map(({ id }) => id),
      excludedCandidates,
    }, null, 2),
  };
};
