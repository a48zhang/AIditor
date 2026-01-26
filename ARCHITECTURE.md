# System Architecture

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AIditor System                               │
│                   (Cloudflare Workers + D1)                          │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────┐         ┌────────────────┐         ┌────────────────┐
│  Material      │         │  Production    │         │  Publishing    │
│  Layer         │────────▶│  Layer         │────────▶│  Layer         │
│                │         │                │         │                │
│ • RSS Feeds    │         │ • AI Process   │         │ • Manual       │
│ • Web Scraping │         │ • Rewrite      │         │   Review       │
│ • APIs         │         │ • Optimize     │         │ • Platform     │
│ • Manual Input │         │                │         │   Publish      │
└────────┬───────┘         └────────┬───────┘         └────────┬───────┘
         │                          │                          │
         │ Write                    │ Read/Write               │ Read/Write
         ▼                          ▼                          ▼
┌─────────────────┐         ┌─────────────────┐
│  Material Pool  │         │ To-Publish Pool │
│    (素材池)      │────────▶│    (待发池)      │
│                 │ Link    │                 │
│ • Raw Content   │         │ • Processed     │
│ • Metadata      │         │ • Ready to      │
│ • Status        │         │   Publish       │
│ • Timestamps    │         │ • Review Status │
└─────────────────┘         └─────────────────┘
         │                          │
         └──────────┬───────────────┘
                    ▼
         ┌──────────────────────┐
         │  Cloudflare D1       │
         │  (SQLite Database)   │
         │                      │
         │ • materials table    │
         │ • to_publish table   │
         │ • Indexed queries    │
         │ • Foreign keys       │
         └──────────────────────┘
```

## Data Flow

### 1. Material Collection Flow
```
External Source
      │
      │ HTTP Request
      ▼
POST /api/materials
      │
      │ Validate & Store
      ▼
Material Pool (素材池)
      │
      └─ Status: pending
```

### 2. Production Flow
```
GET /api/materials?status=pending
      │
      │ Fetch pending materials
      ▼
Production Service
      │
      ├─ PUT /api/materials/:id (status=processing)
      │
      ├─ AI Processing (external)
      │
      ├─ POST /api/to-publish (create processed content)
      │
      └─ PUT /api/materials/:id (status=processed)
      │
      ▼
To-Publish Pool (待发池)
      │
      └─ Status: pending review
```

### 3. Publishing Flow
```
GET /api/to-publish?review_status=pending
      │
      │ Fetch pending reviews
      ▼
Manual Review
      │
      ├─ Approve: PUT /api/to-publish/:id (status=approved)
      │
      └─ Reject: PUT /api/to-publish/:id (status=rejected)
      │
      ▼
Platform Publishing
      │
      └─ PUT /api/to-publish/:id (status=published)
```

## API Endpoint Map

```
Cloudflare Workers (Edge Runtime)
      │
      ├─ / (Health Check)
      │
      ├─ /api/materials
      │     ├─ POST /              → Create material
      │     ├─ GET /               → List materials
      │     ├─ GET /:id            → Get specific material
      │     └─ PUT /:id            → Update material
      │
      └─ /api/to-publish
            ├─ POST /              → Create to-publish
            ├─ GET /               → List to-publish
            ├─ GET /:id            → Get specific record
            └─ PUT /:id            → Update record
```

## Database Schema

```sql
┌──────────────────────────────┐
│      materials               │
├──────────────────────────────┤
│ id (PK)                      │
│ title                        │
│ body                         │
│ source                       │
│ tags                         │
│ collection_time              │
│ status                       │
│ created_at                   │
│ updated_at                   │
└──────────────────────────────┘
              │
              │ 1:N (material_id FK)
              ▼
┌──────────────────────────────┐
│      to_publish              │
├──────────────────────────────┤
│ id (PK)                      │
│ final_title                  │
│ final_body                   │
│ platform                     │
│ review_status                │
│ material_id (FK)             │
│ created_at                   │
│ updated_at                   │
└──────────────────────────────┘
```

## Status State Machine

### Material Status States
```
   ┌─────────┐
   │ pending │ ◄─── Initial state
   └────┬────┘
        │
        ▼
   ┌────────────┐
   │ processing │ ◄─── AI is working
   └────┬───┬───┘
        │   │
        │   └───────┐
        ▼           ▼
   ┌───────────┐ ┌────────┐
   │ processed │ │ failed │
   └───────────┘ └────────┘
        │
        ▼
   ┌──────────┐
   │ archived │ ◄─── Optional
   └──────────┘
```

### To-Publish Review Status States
```
   ┌─────────┐
   │ pending │ ◄─── Awaiting review
   └────┬────┘
        │
        ├───────┐
        │       │
        ▼       ▼
   ┌──────────┐ ┌──────────┐
   │ approved │ │ rejected │
   └────┬─────┘ └──────────┘
        │
        ▼
   ┌───────────┐
   │ published │ ◄─── Final state
   └───────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────┐
│         Frontend/Client Layer           │
│  (RSS Readers, Scrapers, Admin Panel)   │
└────────────────┬────────────────────────┘
                 │ HTTP/JSON
                 ▼
┌─────────────────────────────────────────┐
│       API Layer (Hono Framework)        │
│  • Routing                              │
│  • Request validation                   │
│  • Response formatting                  │
│  • Error handling                       │
│  • CORS                                 │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      Business Logic Layer               │
│  • src/db/materials.ts                  │
│  • src/db/toPublish.ts                  │
│  • Data validation                      │
│  • State management                     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      Data Layer (Cloudflare D1)         │
│  • SQLite database                      │
│  • Global distribution                  │
│  • Automatic replication                │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      Runtime (Cloudflare Workers)       │
│  • Edge computing                       │
│  • Global distribution                  │
│  • Auto-scaling                         │
│  • Pay-per-request                      │
└─────────────────────────────────────────┘
```

## Deployment Architecture

```
                    ┌─────────────────┐
                    │   Developer     │
                    └────────┬────────┘
                             │
                             │ npm run deploy
                             ▼
                    ┌─────────────────┐
                    │  Wrangler CLI   │
                    └────────┬────────┘
                             │
                             │ Build & Deploy
                             ▼
         ┌───────────────────────────────────┐
         │    Cloudflare Global Network      │
         │         (200+ Locations)          │
         └───────────────────────────────────┘
                  │         │         │
        ┌─────────┴────┬────┴────┬────┴─────────┐
        ▼              ▼         ▼              ▼
   ┌────────┐    ┌────────┐ ┌────────┐    ┌────────┐
   │ Edge 1 │    │ Edge 2 │ │ Edge 3 │    │ Edge N │
   │Worker  │    │Worker  │ │Worker  │ ...│Worker  │
   └────┬───┘    └────┬───┘ └────┬───┘    └────┬───┘
        │             │          │             │
        └─────────────┴──────────┴─────────────┘
                      │
                      │ D1 Database
                      ▼
            ┌──────────────────┐
            │   Primary + Read │
            │     Replicas     │
            └──────────────────┘
```

## Scaling Characteristics

- **Automatic Scaling**: Cloudflare Workers scale automatically based on traffic
- **Global Distribution**: Code runs at 200+ edge locations worldwide
- **Low Latency**: Requests are handled at the nearest edge location
- **High Availability**: Built-in redundancy and fault tolerance
- **Cost Effective**: Pay only for actual usage (requests and compute time)

## Security Considerations

1. **CORS**: Currently open to all origins (customize for production)
2. **Authentication**: Not implemented (add based on your needs)
3. **Rate Limiting**: Consider implementing for production
4. **Input Validation**: Basic validation in place
5. **SQL Injection**: Protected by prepared statements
6. **HTTPS**: Automatic with Cloudflare Workers
