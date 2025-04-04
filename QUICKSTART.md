# Quick Start Guide

## Prerequisites

- Docker installed
- pnpm installed
- Node.js installed

## Setup Steps

1. Follow the setup instructions in [SETUP.md](SETUP.md)

2. Start the Oxigraph server: (Or use OriginTrail's DKG)

```bash
docker run --rm -v $PWD/oxigraph:/data -p 7878:7878 ghcr.io/oxigraph/oxigraph serve --location /data --bind 0.0.0.0:7878
```

Now your local oxigraph instance is ready to load the processed scientific papers from the `sampleJsonLds` folder. More info [here](src/bioagentPlugin/services/gdrive/extract/README.md).

3. Load JSON-LD data into Oxigraph/OriginTrail's DKG:

```bash
pnpm run script scripts/jsonldToTriple.ts
```

Now your oxigraph has the triples loaded!

4. (Optional) Start PostgreSQL with vector support:

```bash
docker run --name BioAgents-db -e POSTGRES_PASSWORD=123 -p 5432:5432 -d ankane/pgvector
```

Alternatively, you can use pglite instead of PostgreSQL (Eliza will give you that option when starting for the 1st time)

5. Start the development server:

```bash
pnpm run dev
```

6. Enable the hypothesis generation service:

- Uncomment line 26 and 85 in [index.ts](src/bioagentPlugin/services/index.ts)
