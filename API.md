# AIditor API Documentation

## Overview

AIditor is a Cloudflare Workers-based backend API for an automated new media article creation system. The system consists of two core data pools with CRUD operations:

1. **Material Pool (素材池)**: Stores raw materials collected from external sources
2. **To-Publish Pool (待发池)**: Stores processed articles ready for publication

## Base URL

```
https://your-worker.workers.dev
```

## Authentication

All API endpoints (except the root health check) require authentication via an API key.

**Header Required:**
```
X-API-Key: your-api-key-here
```

**Example:**
```bash
curl -H "X-API-Key: your-secret-key" https://your-worker.workers.dev/api/materials
```

If the API key is missing or invalid, you will receive a 401 Unauthorized response:
```json
{
  "success": false,
  "error": "Unauthorized - Invalid or missing API key"
}
```

## API Endpoints

### Material Pool (素材池) API

#### Create Material
Create a new material in the material pool.

**Endpoint:** `POST /api/materials`

**Request Body:**
```json
{
  "title": "Article Title",
  "body": "Article content...",
  "source": "Source URL or name (optional)",
  "tags": "tag1,tag2,tag3 (optional)",
  "collection_time": 1234567890 (optional, defaults to current time),
  "status": "pending (optional, defaults to 'pending')"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1234567890-abc123",
    "title": "Article Title",
    "body": "Article content...",
    "source": "Source URL",
    "tags": "tag1,tag2,tag3",
    "collection_time": 1234567890,
    "status": "pending",
    "created_at": 1234567890,
    "updated_at": 1234567890
  },
  "message": "Material created successfully"
}
```

#### List Materials
List materials with optional filtering.

**Endpoint:** `GET /api/materials`

**Query Parameters:**
- `status` (optional): Filter by status (e.g., "pending", "processed")
- `start_time` (optional): Filter by collection time >= start_time (timestamp)
- `end_time` (optional): Filter by collection time <= end_time (timestamp)
- `limit` (optional): Maximum number of results to return
- `offset` (optional): Number of results to skip

**Example:**
```
GET /api/materials?status=pending&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1234567890-abc123",
      "title": "Article Title",
      "body": "Article content...",
      "source": "Source URL",
      "tags": "tag1,tag2,tag3",
      "collection_time": 1234567890,
      "status": "pending",
      "created_at": 1234567890,
      "updated_at": 1234567890
    }
  ]
}
```

#### Get Material by ID
Get a specific material by its ID.

**Endpoint:** `GET /api/materials/:id`

**Example:**
```
GET /api/materials/1234567890-abc123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1234567890-abc123",
    "title": "Article Title",
    "body": "Article content...",
    "source": "Source URL",
    "tags": "tag1,tag2,tag3",
    "collection_time": 1234567890,
    "status": "pending",
    "created_at": 1234567890,
    "updated_at": 1234567890
  }
}
```

#### Update Material
Update any field of a specific material.

**Endpoint:** `PUT /api/materials/:id`

**Request Body (all fields optional):**
```json
{
  "title": "Updated Title",
  "body": "Updated content...",
  "source": "Updated source",
  "tags": "updated,tags",
  "status": "processed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1234567890-abc123",
    "title": "Updated Title",
    "body": "Updated content...",
    "source": "Updated source",
    "tags": "updated,tags",
    "collection_time": 1234567890,
    "status": "processed",
    "created_at": 1234567890,
    "updated_at": 1234567899
  },
  "message": "Material updated successfully"
}
```

---

### To-Publish Pool (待发池) API

#### Create To-Publish Record
Create a new to-publish record.

**Endpoint:** `POST /api/to-publish`

**Request Body:**
```json
{
  "final_title": "Final Article Title",
  "final_body": "Final article content...",
  "platform": "wechat",
  "review_status": "pending (optional, defaults to 'pending')",
  "material_id": "1234567890-abc123 (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1234567891-def456",
    "final_title": "Final Article Title",
    "final_body": "Final article content...",
    "platform": "wechat",
    "review_status": "pending",
    "material_id": "1234567890-abc123",
    "created_at": 1234567891,
    "updated_at": 1234567891
  },
  "message": "To-publish record created successfully"
}
```

#### List To-Publish Records
List to-publish records with optional filtering.

**Endpoint:** `GET /api/to-publish`

**Query Parameters:**
- `review_status` (optional): Filter by review status (e.g., "pending", "approved", "rejected")
- `platform` (optional): Filter by platform (e.g., "wechat", "weibo", "toutiao")
- `limit` (optional): Maximum number of results to return
- `offset` (optional): Number of results to skip

**Example:**
```
GET /api/to-publish?review_status=pending&platform=wechat
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1234567891-def456",
      "final_title": "Final Article Title",
      "final_body": "Final article content...",
      "platform": "wechat",
      "review_status": "pending",
      "material_id": "1234567890-abc123",
      "created_at": 1234567891,
      "updated_at": 1234567891
    }
  ]
}
```

#### Get To-Publish Record by ID
Get a specific to-publish record by its ID.

**Endpoint:** `GET /api/to-publish/:id`

**Example:**
```
GET /api/to-publish/1234567891-def456
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1234567891-def456",
    "final_title": "Final Article Title",
    "final_body": "Final article content...",
    "platform": "wechat",
    "review_status": "pending",
    "material_id": "1234567890-abc123",
    "created_at": 1234567891,
    "updated_at": 1234567891
  }
}
```

#### Update To-Publish Record
Update the status or other fields of a to-publish record.

**Endpoint:** `PUT /api/to-publish/:id`

**Request Body (all fields optional):**
```json
{
  "final_title": "Updated Final Title",
  "final_body": "Updated final content...",
  "platform": "weibo",
  "review_status": "approved"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1234567891-def456",
    "final_title": "Updated Final Title",
    "final_body": "Updated final content...",
    "platform": "weibo",
    "review_status": "approved",
    "material_id": "1234567890-abc123",
    "created_at": 1234567891,
    "updated_at": 1234567899
  },
  "message": "To-publish record updated successfully"
}
```

---

## Common Response Format

All endpoints return responses in the following format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Status Codes

- `200 OK`: Successful request
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Example Workflow

1. **Collect Material**: External sources post raw materials to `/api/materials`
2. **Query Materials**: Production layer queries materials from `/api/materials?status=pending`
3. **Update Material Status**: After processing, update material status via `PUT /api/materials/:id`
4. **Create To-Publish**: Production layer creates processed content in `/api/to-publish`
5. **Query Pending Reviews**: Publishing layer queries pending reviews from `/api/to-publish?review_status=pending`
6. **Approve Content**: After manual review, update status via `PUT /api/to-publish/:id` with `review_status=approved`

## Development

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Run database migrations (local):
```bash
npm run db:migrate
```

3. Start development server:
```bash
npm run dev
```

### Deployment

1. Create D1 database:
```bash
wrangler d1 create aiditor-db
```

2. Update `wrangler.toml` with the database ID

3. Run migrations on production:
```bash
npm run db:migrate:prod
```

4. Deploy to Cloudflare Workers:
```bash
npm run deploy
```

## License

MIT
