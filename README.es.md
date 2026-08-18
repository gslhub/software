<div align="center">

# GSLHub Software

### Software reutilizable para Búsqueda Generativa, GEO e investigación reproducible con IA

**Herramientas independientes de framework extraídas de la infraestructura de investigación de GSLHub**

[English](./README.md) · **Español**

[Plataforma](https://github.com/gslhub/website) · [Investigación](https://github.com/gslhub/research) · [Benchmarks](https://github.com/gslhub/benchmarks) · [Docs](https://github.com/gslhub/docs)

</div>

---

## Propósito

`gslhub/software` es el repositorio de **software de investigación reutilizable de forma independiente** desarrollado alrededor de **GSLHub — Generative Search Lab Hub**.

La plataforma productiva de investigación permanece en [`gslhub/website`](https://github.com/gslhub/website). Este repositorio contiene herramientas y librerías focalizadas que pueden instalarse, probarse y reutilizarse sin requerir toda la aplicación Next.js/Payload.

## Primer paquete — `@gslhub/metrics-core`

[`packages/metrics-core`](packages/metrics-core) contiene implementaciones deterministas de las primeras cuatro métricas gobernadas de visibilidad de GSLHub:

| Código | Métrica | Cálculo principal |
|---|---|---|
| **AIR** | Answer Inclusion Rate | ejecuciones con target incluido / ejecuciones elegibles |
| **CR** | Citation Rate | ejecuciones con target citado / ejecuciones elegibles |
| **MCP** | Mean Citation Position | media de la primera posición válida de cita del target |
| **RCR** | Response Consistency Rate | comparaciones consistentes / comparaciones de baseline elegibles |

El paquete está escrito en **TypeScript**, no depende de ningún framework de aplicación ni base de datos y conserva outputs de cálculo auditables, incluyendo exclusiones, numeradores/denominadores y checksums SHA-256 de entrada/salida.

Sus definiciones métricas normativas viven en [`gslhub/benchmarks`](https://github.com/gslhub/benchmarks); los protocolos y reglas de codificación viven en [`gslhub/research`](https://github.com/gslhub/research).

### Validación

Los tests del paquete reproducen el fixture sintético público del benchmark:

```text
AIR = 0.75
CR  = 0.50
MCP = 2.00
RCR = 0.75
```

Estos son **valores sintéticos de validación de software**, no hallazgos empíricos de investigación.

Consulta [`packages/metrics-core/README.md`](packages/metrics-core/README.md) para la API, alcance y ejemplos de uso.

## Estructura del repositorio

```text
software/
├── packages/
│   └── metrics-core/   # Librería de cálculo AIR, CR, MCP y RCR
├── tools/              # Futuras utilidades independientes de investigación
├── templates/          # Plantillas de documentación para nuevas herramientas
├── .github/workflows/  # Validación automatizada
├── RELEASE-POLICY.md
└── README.md
```

## Relación con el ecosistema GSLHub

- **[`website`](https://github.com/gslhub/website)** — plataforma productiva de investigación y lógica gobernada de aplicación;
- **[`research`](https://github.com/gslhub/research)** — metodología científica, protocolos y codebooks;
- **[`benchmarks`](https://github.com/gslhub/benchmarks)** — especificaciones de benchmarks y métricas;
- **`software`** — implementaciones y utilidades reutilizables de forma independiente;
- **`datasets`** — releases revisados de datos de investigación cuando estén listos para publicación.

Separar metodología, software e integración de aplicación permite probar los cálculos de forma independiente mientras se preserva la trazabilidad de la versión de plataforma que los utilizó.

## Requisitos de release

Una herramienta reutilizable debe incluir:

- una definición clara del problema;
- inputs y outputs soportados explícitamente;
- comportamiento versionado;
- tests deterministas o validación cuando proceda;
- instrucciones de instalación y uso;
- limitaciones y comportamiento fuera de alcance;
- licencia explícita;
- consideraciones de seguridad cuando sean relevantes;
- trazabilidad hacia la especificación metodológica que implementa.

Consulta [`RELEASE-POLICY.md`](RELEASE-POLICY.md).

## Desarrollo

Requisitos:

- Node.js `>=20.9.0`
- npm `10.x`

```bash
npm install
npm run typecheck
npm test
npm run build
```

El repositorio utiliza npm workspaces para poder añadir paquetes independientes bajo `packages/` sin acoplarlos a la plataforma principal de GSLHub.

## Familias de herramientas previstas

Futuros releases pueden incluir:

- normalización de citas/fuentes;
- hashing de artefactos de investigación y generación de manifests;
- comprobaciones de reproducibilidad;
- exportación/validación de datasets;
- validación de schemas;
- comparación controlada de outputs de benchmarks.

Las herramientas se añaden únicamente cuando son suficientemente independientes, documentadas, testeadas y seguras para reutilizar.

## Licencias

El software original de GSLHub en este repositorio se distribuye bajo **GNU AGPL-3.0-only**, salvo que un paquete específico indique otra licencia.

Las dependencias de terceros mantienen sus propias licencias. Los activos de marca y trademarks de GSLHub se gestionan por separado.

---

© 2026 GSLHub / Eduardo Yauri
