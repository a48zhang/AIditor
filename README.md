# AIditor

AI-based news editor backend API built on Cloudflare Workers

## Overview

AIditor is an automated new media article creation system with a scalable backend infrastructure. The system consists of two core data pools and three functional layers:

### Core Data Pools

1. **Material Pool (素材池)**: Stores raw materials collected from external sources
   - Contains: title, body text, source information, tags, collection time, status
   - Provides CRUD operations for material management

2. **To-Publish Pool (待发池)**: Stores processed articles ready for publication
   - Contains: final title, final body text, target platform, review status, material reference
   - Provides CRUD operations for publication management

### Functional Layers

1. **Material Layer**: Collects information from external sources and writes to material pool
2. **Production Layer**: Reads from material pool, processes with AI, writes to to-publish pool
3. **Publishing Layer**: Reads from to-publish pool, conducts manual review, publishes to platforms

## Architecture

- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Framework**: Hono (lightweight web framework)
- **Language**: TypeScript

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Cloudflare account
- Wrangler CLI

### Installation

```bash
# Install dependencies
npm install

# Create .dev.vars file with your API key for local development
echo "API_KEY=your-local-dev-key" > .dev.vars

# Run database migrations locally
npm run db:migrate

# Start development server
npm run dev
```

### Deployment

```bash
# Create D1 database
wrangler d1 create aiditor-db

# Update wrangler.toml with the database ID from above command

# Set API key secret
wrangler secret put API_KEY

# Run migrations on production
npm run db:migrate:prod

# Deploy to Cloudflare Workers
npm run deploy
```

## Authentication

All API endpoints (except the root `/` health check) require authentication via the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-api-key" https://your-api.workers.dev/api/materials
```

## API Documentation

See [API.md](./API.md) for complete API documentation.

### Quick API Reference

**Material Pool**:
- `POST /api/materials` - Create material
- `GET /api/materials` - List materials (supports filtering)
- `GET /api/materials/:id` - Get material by ID
- `PUT /api/materials/:id` - Update material

**To-Publish Pool**:
- `POST /api/to-publish` - Create to-publish record
- `GET /api/to-publish` - List to-publish records (supports filtering)
- `GET /api/to-publish/:id` - Get record by ID
- `PUT /api/to-publish/:id` - Update record

## Project Structure

```
.
├── src/
│   ├── index.ts           # Main application entry
│   ├── types/             # TypeScript type definitions
│   ├── db/                # Database operations
│   │   ├── materials.ts   # Material pool operations
│   │   └── toPublish.ts   # To-publish pool operations
│   ├── routes/            # API route handlers
│   │   ├── materials.ts   # Material routes
│   │   └── toPublish.ts   # To-publish routes
│   └── utils/             # Utility functions
├── migrations/            # Database migrations
│   └── 0001_init.sql     # Initial schema
├── wrangler.toml         # Cloudflare Workers config
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## Development

```bash
# Start local development server
npm run dev

# Deploy to production
npm run deploy

# Run tests (if available)
npm test
```

## License

MIT
