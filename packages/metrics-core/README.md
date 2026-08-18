# @gslhub/metrics-core

Deterministic, framework-independent implementations of the first four governed GSLHub visibility metrics:

- **AIR** — Answer Inclusion Rate
- **CR** — Citation Rate
- **MCP** — Mean Citation Position
- **RCR** — Response Consistency Rate

`@gslhub/metrics-core` extracts the calculation layer from the GSLHub research platform so the same metric rules can be reused from scripts, notebooks, validation pipelines or other applications without depending on Payload CMS, MongoDB or Next.js.

> **Status:** `0.1.0` — initial public-review implementation.

## Methodology

The normative metric specifications are maintained in [`gslhub/benchmarks`](https://github.com/gslhub/benchmarks):

- [`AIR v0.1.0`](https://github.com/gslhub/benchmarks/blob/main/metrics/AIR-v0.1.0.md)
- [`CR v0.1.0`](https://github.com/gslhub/benchmarks/blob/main/metrics/CR-v0.1.0.md)
- [`MCP v0.1.0`](https://github.com/gslhub/benchmarks/blob/main/metrics/MCP-v0.1.0.md)
- [`RCR v0.1.0`](https://github.com/gslhub/benchmarks/blob/main/metrics/RCR-v0.1.0.md)

Scientific protocols and coding rules live in [`gslhub/research`](https://github.com/gslhub/research).

The software implementation does **not** replace those methodological documents. A versioned result should identify both the metric-definition version and the calculator version used.

## What this package does

The package accepts already-structured observations and:

- applies the GSLHub `0.1.0` eligibility rules;
- normalizes target type and common domain/URL forms;
- rejects duplicate eligible observations for the same execution;
- reports excluded candidates and their reasons;
- computes numerator/denominator or eligible positions;
- applies the metric-specific rounding rule;
- generates deterministic SHA-256 checksums for normalized inputs and outputs;
- returns an auditable JSON query snapshot describing the calculation conditions.

## What this package does not do

It does **not**:

- execute prompts against AI systems;
- interpret raw generated text;
- decide whether a mention, citation or recommendation exists;
- validate source quality or factual support;
- fetch Payload or database records;
- replace evidence preservation, codebooks or human review.

Those responsibilities belong to the research protocol and data-governance layers.

## Installation

The package is currently developed inside the `gslhub/software` workspace and has not yet been published to the npm registry.

From a clone of this repository:

```bash
npm install
npm run build
npm test
```

## Basic usage

```ts
import { calculateAIR } from '@gslhub/metrics-core'

const result = calculateAIR({
  targetType: 'domain',
  targetValue: 'https://www.gslhub.com/',
  observations: [
    {
      id: 'obs-1',
      executionId: 'exec-1',
      executionLifecycle: 'completed',
      observationLifecycle: 'validated',
      reviewStatus: 'accepted',
      targetType: 'domain',
      targetValue: 'gslhub.com',
      mentioned: true,
    },
  ],
})

console.log(result.numericValue) // 1
console.log(result.numerator)    // 1
console.log(result.denominator)  // 1
```

The same observation shape can carry `cited`, `citationPosition`, `baselineObservationId` and `variationLevel` for CR, MCP and RCR.

## Public API

```ts
calculateAIR(input)
calculateCR(input)
calculateMCP(input)
calculateRCR(input)
normalizeTargetType(value)
normalizeTargetValue(value)
```

All four calculators are synchronous and have no runtime dependencies outside Node.js built-ins.

## Metric behavior

| Metric | Primary outcome | Default precision | Undefined when |
|---|---|---:|---|
| AIR | mentioned executions / eligible executions | 4 | no eligible observations |
| CR | cited executions / eligible executions | 4 | no eligible observations |
| MCP | mean first valid citation position | 2 | no eligible cited position |
| RCR | `none` + `low` comparisons / eligible comparisons | 4 | no eligible comparisons |

For RCR, the baseline is preserved in the candidate set but does not enter the denominator.

## Validation fixture

The automated tests reproduce the public synthetic calculator fixture in [`gslhub/benchmarks`](https://github.com/gslhub/benchmarks/blob/main/fixtures/synthetic-validation.json):

```text
AIR = 3 / 4 = 0.75
CR  = 2 / 4 = 0.50
MCP = mean(1, 2, 3) = 2.00
RCR = 3 / 4 = 0.75
```

These values are **synthetic software-validation data only**. They do not describe any AI system and must not be presented as empirical research findings.

## Lineage

The initial implementation was extracted from the governed calculators used by [`gslhub/website`](https://github.com/gslhub/website/tree/main/cms/metrics) and refactored to remove application/database dependencies while preserving the calculation rules.

The platform remains responsible for retrieving and validating governed records. `metrics-core` is responsible only for deterministic calculation over an explicit input snapshot.

## Versioning

Metric behavior is versioned independently from the package release. The initial package implements metric definitions `0.1.0`.

A change that alters eligibility, numerator/denominator construction, position rules, consistency classification or output semantics requires explicit methodological version review rather than a silent implementation change.

## License

GNU Affero General Public License v3.0 only (`AGPL-3.0-only`).

© 2026 GSLHub / Eduardo Yauri
