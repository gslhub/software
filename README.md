<div align="center">

# GSLHub Software

### Reusable tools for Generative Search, GEO and reproducible AI research

**Research utilities and independently reusable components developed around GSLHub**

[Platform](https://github.com/gslhub/website) · [Research](https://github.com/gslhub/research) · [Benchmarks](https://github.com/gslhub/benchmarks)

</div>

---

## Purpose

`gslhub/software` is the public-facing home for **reusable research software** that does not need to live inside the main GSLHub platform repository.

The main application remains in [`gslhub/website`](https://github.com/gslhub/website). This repository is intended for focused tools that can be installed, tested or reused independently.

## Candidate tool families

Future releases may include utilities for:

- benchmark validation;
- metric calculation;
- citation/source normalization;
- research-artifact hashing and manifest generation;
- reproducibility checks;
- dataset export/validation;
- schema validation;
- controlled comparison of benchmark outputs.

Only tools that are sufficiently independent, documented and safe to reuse should be moved here.

## Planned structure

```text
software/
├── packages/        # Reusable libraries
├── tools/           # Standalone research utilities
├── examples/        # Minimal usage examples
├── templates/       # New-tool documentation templates
├── SECURITY.md      # Repository-specific security notes if needed
└── README.md
```

## Relationship to the platform

The repositories serve different purposes:

- **`website`** — production research platform and governed application logic;
- **`software`** — small independently reusable tools and libraries;
- **`research`** — methodology and protocols;
- **`benchmarks`** — evaluation specifications;
- **`datasets`** — reviewed data releases.

Moving a utility here should not break the audit trail of the platform version that originally used it.

## Release requirements

A reusable tool should include:

- a clear problem statement;
- supported inputs and outputs;
- versioned behavior;
- tests or deterministic validation where applicable;
- installation/usage instructions;
- limitations;
- explicit license;
- security considerations when it handles files, URLs or external services.

## Licensing

The intended default for original GSLHub research software is **GNU AGPL-3.0-only**, unless a specific package states otherwise.

Third-party dependencies retain their own licenses.

## Current status

This repository currently defines the publication structure only. No standalone tool is presented as released software until its code, tests and documentation are migrated here deliberately.

---

© 2026 GSLHub / Eduardo Yauri
