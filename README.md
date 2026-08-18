<div align="center">

# GSLHub Software

### Reusable software for Generative Search, GEO and reproducible AI research

**Framework-independent tools extracted from the GSLHub research infrastructure**

[Platform](https://github.com/gslhub/website) · [Research](https://github.com/gslhub/research) · [Benchmarks](https://github.com/gslhub/benchmarks) · [Docs](https://github.com/gslhub/docs)

</div>

---

## Purpose

`gslhub/software` is the home for **independently reusable research software** developed around **GSLHub — Generative Search Lab Hub**.

The production research platform remains in [`gslhub/website`](https://github.com/gslhub/website). This repository contains focused tools and libraries that can be installed, tested and reused without requiring the full Next.js/Payload application.

## First package — `@gslhub/metrics-core`

[`packages/metrics-core`](packages/metrics-core) contains deterministic implementations of the first four governed GSLHub visibility metrics:

| Code | Metric | Core calculation |
|---|---|---|
| **AIR** | Answer Inclusion Rate | target-included executions / eligible executions |
| **CR** | Citation Rate | target-cited executions / eligible executions |
| **MCP** | Mean Citation Position | mean first valid target-citation position |
| **RCR** | Response Consistency Rate | consistent comparisons / eligible baseline comparisons |

The package is written in **TypeScript**, has **no application-framework or database dependency**, and preserves auditable calculation outputs including exclusions, numerator/denominator data and SHA-256 input/output checksums.

Its normative metric definitions live in [`gslhub/benchmarks`](https://github.com/gslhub/benchmarks); protocols and coding rules live in [`gslhub/research`](https://github.com/gslhub/research).

### Validation

The package tests reproduce the public synthetic benchmark fixture:

```text
AIR = 0.75
CR  = 0.50
MCP = 2.00
RCR = 0.75
```

These are **synthetic software-validation values**, not empirical research findings.

See [`packages/metrics-core/README.md`](packages/metrics-core/README.md) for the API, scope and usage examples.

## Repository structure

```text
software/
├── packages/
│   └── metrics-core/   # AIR, CR, MCP and RCR calculation library
├── tools/              # Future standalone research utilities
├── templates/          # New-tool documentation templates
├── .github/workflows/  # Automated validation
├── RELEASE-POLICY.md
└── README.md
```

## Relationship to the GSLHub ecosystem

- **[`website`](https://github.com/gslhub/website)** — production research platform and governed application logic;
- **[`research`](https://github.com/gslhub/research)** — scientific methodology, protocols and codebooks;
- **[`benchmarks`](https://github.com/gslhub/benchmarks)** — benchmark and metric specifications;
- **`software`** — independently reusable implementations and utilities;
- **`datasets`** — reviewed research-data releases when they are ready for publication.

Separating methodology, software and application integration makes it possible to test calculations independently while preserving the audit trail of the platform version that used them.

## Release requirements

A reusable tool must include:

- a clear problem statement;
- explicit supported inputs and outputs;
- versioned behavior;
- deterministic tests or validation where applicable;
- installation and usage instructions;
- limitations and out-of-scope behavior;
- explicit license;
- security considerations when relevant;
- traceability to the methodological specification it implements.

See [`RELEASE-POLICY.md`](RELEASE-POLICY.md).

## Development

Requirements:

- Node.js `>=20.9.0`
- npm `10.x`

```bash
npm install
npm run typecheck
npm test
npm run build
```

The repository uses npm workspaces so additional independent packages can be added under `packages/` without coupling them to the main GSLHub platform.

## Planned tool families

Future releases may include:

- citation/source normalization;
- research-artifact hashing and manifest generation;
- reproducibility checks;
- dataset export/validation;
- schema validation;
- controlled benchmark-output comparison.

Tools are added only when they are sufficiently independent, documented, tested and safe to reuse.

## Licensing

Original GSLHub software in this repository is released under **GNU AGPL-3.0-only**, unless a specific package states otherwise.

Third-party dependencies retain their own licenses. GSLHub brand assets and trademarks are governed separately.

---

© 2026 GSLHub / Eduardo Yauri
