# GSLHub Software Release Policy

A tool belongs in `gslhub/software` when it is independently understandable and reusable outside the main application repository.

## Release gate

Before a tool is treated as released software, confirm:

1. scope and supported behavior are documented;
2. source code is present and reviewable;
3. secrets and environment-specific credentials are absent;
4. dependencies and their licenses are known;
5. installation and usage instructions work from a clean environment;
6. deterministic tests or validation fixtures exist where appropriate;
7. failure behavior and limitations are documented;
8. versioning is defined;
9. the tool has an explicit license;
10. research-facing outputs identify their algorithm/version when reproducibility depends on it.

## Versioning

Material behavior changes require a new version. Research results should retain the exact calculator/tool version used to produce them.

## Platform extraction

When a utility originates in `gslhub/website`, its extraction into this repository must not erase the historical implementation used by earlier GSLHub releases. Platform releases and research records must remain traceable to the code version that actually produced them.
