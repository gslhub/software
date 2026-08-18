export type VariationLevel = 'not-assessed' | 'none' | 'low' | 'medium' | 'high';

export type MetricObservation = {
  id: string;
  observationCode?: string;
  executionId: string;
  executionCode?: string;
  executionLifecycle: string;
  observationLifecycle: string;
  reviewStatus: string;
  targetType: string;
  targetValue: string;
  mentioned?: boolean | null;
  cited?: boolean | null;
  citationPosition?: number | null;
  baselineObservationId?: string | null;
  variationLevel?: VariationLevel | null;
};

export type ExcludedCandidate = {
  observationId: string;
  observationCode: string;
  executionId: string;
  executionCode: string;
  reason: string;
};

export type CommonMetricResult = {
  targetType: string;
  targetValue: string;
  candidateCount: number;
  excludedCount: number;
  numericValue: number;
  validObservationIds: string[];
  validExecutionIds: string[];
  excludedCandidates: ExcludedCandidate[];
  inputChecksum: string;
  outputChecksum: string;
  querySnapshot: string;
};

export type AnswerInclusionRateResult = CommonMetricResult & {
  metricCode: 'AIR';
  metricVersion: '0.1.0';
  numerator: number;
  denominator: number;
};

export type CitationRateResult = CommonMetricResult & {
  metricCode: 'CR';
  metricVersion: '0.1.0';
  numerator: number;
  denominator: number;
};

export type MeanCitationPositionResult = CommonMetricResult & {
  metricCode: 'MCP';
  metricVersion: '0.1.0';
  positionSum: number;
  denominator: number;
  eligiblePositions: number[];
};

export type ResponseConsistencyRateResult = CommonMetricResult & {
  metricCode: 'RCR';
  metricVersion: '0.1.0';
  numerator: number;
  denominator: number;
  baselineObservationId: string;
  assessedVariationLevels: Array<'none' | 'low' | 'medium' | 'high'>;
};

export type MetricInput = {
  observations: MetricObservation[];
  targetType: string;
  targetValue: string;
  precision?: number;
};
