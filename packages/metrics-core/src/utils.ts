import { createHash } from 'node:crypto';

import type { ExcludedCandidate, MetricObservation } from './types.js';

export const normalizeTargetValue = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');

export const normalizeTargetType = (value: string): string => value.trim().toLowerCase();

export const roundMetric = (value: number, precision: number): number => {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

export const stableHash = (value: unknown): string =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');

export const observationCode = (observation: MetricObservation): string =>
  observation.observationCode?.trim() || observation.id;

export const executionCode = (observation: MetricObservation): string =>
  observation.executionCode?.trim() || observation.executionId;

export const commonEligibilityReason = (
  observation: MetricObservation,
  expectedTargetType: string,
  expectedTargetValue: string,
): string | null => {
  if (observation.executionLifecycle !== 'completed') {
    return `Execution lifecycle is ${observation.executionLifecycle || 'missing'}, not completed.`;
  }
  if (observation.observationLifecycle !== 'validated') {
    return `Observation lifecycle is ${observation.observationLifecycle || 'missing'}, not validated.`;
  }
  if (observation.reviewStatus !== 'accepted') {
    return `Observation review status is ${observation.reviewStatus || 'missing'}, not accepted.`;
  }
  if (normalizeTargetType(observation.targetType) !== expectedTargetType) {
    return `Target type ${observation.targetType || 'missing'} does not match ${expectedTargetType}.`;
  }
  if (normalizeTargetValue(observation.targetValue) !== expectedTargetValue) {
    return `Target value ${observation.targetValue || 'missing'} does not match ${expectedTargetValue}.`;
  }
  return null;
};

export const exclusion = (
  observation: MetricObservation,
  reason: string,
): ExcludedCandidate => ({
  observationId: observation.id,
  observationCode: observationCode(observation),
  executionId: observation.executionId,
  executionCode: executionCode(observation),
  reason,
});

export const sortedInputRows = (rows: Array<Record<string, unknown>>): Array<Record<string, unknown>> =>
  [...rows].sort((left, right) =>
    String(left.observationCode).localeCompare(String(right.observationCode)),
  );
