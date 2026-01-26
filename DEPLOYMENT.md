# Deployment Guide

This guide will help you deploy the AIditor backend API to Cloudflare Workers.

## Prerequisites

- Node.js 18 or later
- npm or yarn
- A Cloudflare account (free tier is sufficient)
- Git

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Login to Cloudflare

```bash
npx wrangler login
```

This will open a browser window for you to authorize Wrangler with your Cloudflare account.

## Step 3: Create D1 Database

```bash
npx wrangler d1 create aiditor-db
```

This command will output something like:

```
✅ Successfully created DB 'aiditor-db'!

[[d1_databases]]
binding = "DB"
database_name = "aiditor-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

## Step 4: Update wrangler.toml

Copy the `database_id` from the previous step and update your `wrangler.toml` file:

```toml
name = "aiditor"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
# API_KEY will be set via wrangler secret put API_KEY for production

[[ d1_databases ]]
binding = "DB"
database_name = "aiditor-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # Replace with your database_id
```

## Step 5: Set API Key Secret

Set your API key as a secret (recommended for production):

```bash
npx wrangler secret put API_KEY
```

When prompted, enter your secure API key. This key will be required in the `X-API-Key` header for all API requests.

For local development, create a `.dev.vars` file:

```bash
echo "API_KEY=your-local-dev-key" > .dev.vars
```

## Step 6: Run Database Migrations

Apply the database migrations to create the necessary tables:

```bash
npx wrangler d1 migrations apply aiditor-db
```

When prompted, confirm with `y` to apply the migration.

## Step 7: Deploy to Cloudflare Workers

```bash
npm run deploy
```

Or using wrangler directly:

```bash
npx wrangler deploy
```

After successful deployment, you'll see output like:

```
✨ Successfully deployed worker!
🌎 https://aiditor.your-subdomain.workers.dev
```

## Step 8: Test Your Deployment

Test your deployed API with curl:

```bash
# Health check (no auth required)
curl https://aiditor.your-subdomain.workers.dev/

# Create a material (with authentication)
curl -X POST https://aiditor.your-subdomain.workers.dev/api/materials \
curl -X POST https://aiditor.your-subdomain.workers.dev/api/materials \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Article",
    "body": "Article content here",
    "source": "https://example.com",
    "tags": "test,demo",
    "status": "pending"
  }'
```

## Local Development

To run the API locally for development:

```bash
# Create .dev.vars file with your API key
echo "API_KEY=your-local-dev-key" > .dev.vars

# Run local database migrations
npm run db:migrate

# Start development server
npm run dev
```

The local server will be available at `http://localhost:8787`

You can then test locally using curl with your API key:

```bash
curl -H "X-API-Key: your-local-dev-key" http://localhost:8787/api/materials
```

## Custom Domain (Optional)

To use a custom domain with your worker:

1. Go to Cloudflare Dashboard → Workers & Pages → Your Worker
2. Click on "Triggers" tab
3. Under "Custom Domains", click "Add Custom Domain"
4. Enter your domain and follow the instructions

## Monitoring and Logs

View your worker logs:

```bash
npx wrangler tail
```

View logs in the Cloudflare dashboard:
1. Go to Workers & Pages → Your Worker
2. Click on "Logs" tab

## Updating the API

When you make changes to the code:

1. Test locally:
   ```bash
   npm run dev
   ```

2. If you've made database schema changes, create a new migration:
   ```bash
   # Create a new migration file in migrations/
   # For example: migrations/0002_add_new_field.sql
   ```

3. Apply the migration to production:
   ```bash
   npx wrangler d1 migrations apply aiditor-db
   ```

4. Deploy the updated code:
   ```bash
   npm run deploy
   ```

## Troubleshooting

### Error: "Database not found"

Make sure you've:
1. Created the D1 database
2. Updated the `database_id` in `wrangler.toml`
3. Applied the migrations

### Error: "Table not found"

Run the migrations:
```bash
npx wrangler d1 migrations apply aiditor-db
```

### Local development database issues

For local development, wrangler creates a local SQLite database. If you encounter issues:

1. Delete the local database:
   ```bash
   rm -rf .wrangler
   ```

2. Run migrations again:
   ```bash
   npm run db:migrate
   ```

## Database Management

### Query the database directly

```bash
# Production database
npx wrangler d1 execute aiditor-db --command "SELECT * FROM materials LIMIT 10"

# Local database
npx wrangler d1 execute aiditor-db --local --command "SELECT * FROM materials LIMIT 10"
```

### Backup the database

```bash
# Export data
npx wrangler d1 execute aiditor-db --command "SELECT * FROM materials" --json > materials_backup.json
npx wrangler d1 execute aiditor-db --command "SELECT * FROM to_publish" --json > to_publish_backup.json
```

## Security Notes

1. **No authentication by default**: This API has no built-in authentication. For production use, consider adding:
   - Cloudflare Access
   - API keys
   - OAuth/JWT authentication

2. **CORS is enabled**: All origins are allowed by default. Consider restricting this in production.

3. **Rate limiting**: Consider implementing rate limiting for production use.

## Cost Considerations

Cloudflare Workers Free Tier includes:
- 100,000 requests per day
- D1: 5GB storage, 5 million reads/day, 100,000 writes/day

For most use cases, the free tier is sufficient. Monitor your usage in the Cloudflare dashboard.

## Support

For issues or questions:
- Check the [API Documentation](./API.md)
- Review the [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- Review the [D1 Database Documentation](https://developers.cloudflare.com/d1/)
