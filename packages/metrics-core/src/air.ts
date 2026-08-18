import type { AnswerInclusionRateResult, MetricInput } from './types.js';
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

export const calculateAIR = ({
  observations,
  targetType,
  targetValue,
  precision = 4,
}: MetricInput): AnswerInclusionRateResult => {
  if (observations.length === 0) throw new Error('AIR requires at least one candidate observation.');

  const expectedTargetType = normalizeTargetType(targetType);
  const expectedTargetValue = normalizeTargetValue(targetValue);
  const validObservationIds: string[] = [];
  const validExecutionIds: string[] = [];
  const excludedCandidates: AnswerInclusionRateResult['excludedCandidates'] = [];
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
      mentioned: observation.mentioned ?? null,
    });

    const commonReason = commonEligibilityReason(observation, expectedTargetType, expectedTargetValue);
    if (commonReason) {
      excludedCandidates.push(exclusion(observation, commonReason));
      continue;
    }
    if (typeof observation.mentioned !== 'boolean') {
      excludedCandidates.push(exclusion(observation, 'The inclusion outcome is not codable as a boolean value.'));
      continue;
    }
    if (usedExecutions.has(observation.executionId)) {
      throw new Error(`AIR cannot use more than one accepted observation for execution ${observation.executionCode || observation.executionId}.`);
    }

    usedExecutions.add(observation.executionId);
    validObservationIds.push(observation.id);
    validExecutionIds.push(observation.executionId);
    if (observation.mentioned) numerator += 1;
  }

  const denominator = validObservationIds.length;
  if (denominator === 0) {
    throw new Error('AIR is undefined because no completed execution has one validated, accepted and target-matched observation.');
  }

  const numericValue = roundMetric(numerator / denominator, precision);
  const normalizedInputRows = sortedInputRows(inputRows);
  const outputPayload = {
    metricCode: 'AIR' as const,
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
