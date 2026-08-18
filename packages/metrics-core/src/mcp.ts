import type { MeanCitationPositionResult, MetricInput } from './types.js';
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

export const calculateMCP = ({
  observations,
  targetType,
  targetValue,
  precision = 2,
}: MetricInput): MeanCitationPositionResult => {
  if (observations.length === 0) throw new Error('MCP requires at least one candidate observation.');

  const expectedTargetType = normalizeTargetType(targetType);
  const expectedTargetValue = normalizeTargetValue(targetValue);
  const validObservationIds: string[] = [];
  const validExecutionIds: string[] = [];
  const eligiblePositions: number[] = [];
  const excludedCandidates: MeanCitationPositionResult['excludedCandidates'] = [];
  const usedExecutions = new Set<string>();
  const inputRows: Array<Record<string, unknown>> = [];

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
      citationPosition: observation.citationPosition ?? null,
    });

    const commonReason = commonEligibilityReason(observation, expectedTargetType, expectedTargetValue);
    if (commonReason) {
      excludedCandidates.push(exclusion(observation, commonReason));
      continue;
    }

    if (usedExecutions.has(observation.executionId)) {
      throw new Error(`MCP cannot use more than one accepted target-matched observation for execution ${observation.executionCode || observation.executionId}.`);
    }
    usedExecutions.add(observation.executionId);

    if (observation.cited !== true) {
      excludedCandidates.push(exclusion(observation, 'The evaluated target is not cited in this valid observation.'));
      continue;
    }

    const position = observation.citationPosition;
    if (typeof position !== 'number' || !Number.isInteger(position) || position < 1) {
      excludedCandidates.push(exclusion(observation, 'The evaluated target is cited, but no valid one-based citation position was recorded.'));
      continue;
    }

    validObservationIds.push(observation.id);
    validExecutionIds.push(observation.executionId);
    eligiblePositions.push(position);
  }

  const denominator = eligiblePositions.length;
  if (denominator === 0) {
    throw new Error('MCP is undefined because no validated, accepted and target-matched cited observation has a valid citation position.');
  }

  const positionSum = eligiblePositions.reduce((total, position) => total + position, 0);
  const numericValue = roundMetric(positionSum / denominator, precision);
  const normalizedInputRows = sortedInputRows(inputRows);
  const outputPayload = {
    metricCode: 'MCP' as const,
    metricVersion: '0.1.0' as const,
    targetType: expectedTargetType,
    targetValue: expectedTargetValue,
    positionSum,
    denominator,
    candidateCount: observations.length,
    excludedCount: excludedCandidates.length,
    numericValue,
    eligiblePositions,
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
      requiredCitationOutcome: true,
      requiredCitationPosition: 'integer >= 1',
      missingDataPolicy: 'exclude-and-report',
      candidateObservationIds: observations.map(({ id }) => id),
      eligiblePositions,
      excludedCandidates,
    }, null, 2),
  };
};
