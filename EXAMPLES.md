# Usage Examples

This document provides practical examples of using the AIditor API for the automated new media article creation workflow.

## Table of Contents

1. [Material Collection Layer](#material-collection-layer)
2. [Production Layer](#production-layer)
3. [Publishing Layer](#publishing-layer)
4. [Complete Workflow Example](#complete-workflow-example)

## Material Collection Layer

The Material Collection Layer is responsible for gathering raw materials from external sources.

### Example 1: Collecting an Article from RSS Feed

```javascript
// Collect an article from an RSS feed
const response = await fetch('https://your-api.workers.dev/api/materials', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Breaking News: Tech Company Announces New Product',
    body: 'Full article content here...',
    source: 'https://techcrunch.com/article-url',
    tags: 'tech,product-launch,ai',
    status: 'pending'
  })
});

const result = await response.json();
console.log('Material created:', result.data.id);
```

### Example 2: Batch Importing Multiple Articles

```javascript
async function importArticles(articles) {
  const results = [];
  
  for (const article of articles) {
    const response = await fetch('https://your-api.workers.dev/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article.title,
        body: article.content,
        source: article.url,
        tags: article.categories.join(','),
        collection_time: Date.parse(article.publishedDate)
      })
    });
    
    const result = await response.json();
    results.push(result.data);
  }
  
  return results;
}
```

### Example 3: Querying Recent Materials

```javascript
// Get materials collected in the last 24 hours
const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

const response = await fetch(
  `https://your-api.workers.dev/api/materials?start_time=${oneDayAgo}&status=pending&limit=50`
);

const materials = await response.json();
console.log(`Found ${materials.data.length} pending materials`);
```

## Production Layer

The Production Layer processes raw materials using AI and creates final content.

### Example 4: Processing a Material with AI

```javascript
async function processMaterial(materialId) {
  // 1. Fetch the material
  const materialResponse = await fetch(
    `https://your-api.workers.dev/api/materials/${materialId}`
  );
  const material = await materialResponse.json();
  
  // 2. Mark as processing
  await fetch(`https://your-api.workers.dev/api/materials/${materialId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'processing' })
  });
  
  // 3. Process with AI (pseudo-code - use your AI service)
  const processed = await aiService.rewrite({
    title: material.data.title,
    content: material.data.body
  });
  
  // 4. Create to-publish record
  const toPublishResponse = await fetch(
    'https://your-api.workers.dev/api/to-publish',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        final_title: processed.title,
        final_body: processed.content,
        platform: 'wechat',
        material_id: materialId,
        review_status: 'pending'
      })
    }
  );
  
  const toPublish = await toPublishResponse.json();
  
  // 5. Mark material as processed
  await fetch(`https://your-api.workers.dev/api/materials/${materialId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'processed' })
  });
  
  return toPublish.data;
}
```

### Example 5: Batch Processing Workflow

```javascript
async function processPendingMaterials(limit = 10) {
  // Get pending materials
  const response = await fetch(
    `https://your-api.workers.dev/api/materials?status=pending&limit=${limit}`
  );
  const materials = await response.json();
  
  // Process each material
  const results = [];
  for (const material of materials.data) {
    try {
      const result = await processMaterial(material.id);
      results.push({ success: true, id: material.id, result });
    } catch (error) {
      results.push({ success: false, id: material.id, error: error.message });
      
      // Mark as failed
      await fetch(`https://your-api.workers.dev/api/materials/${material.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'failed' })
      });
    }
  }
  
  return results;
}
```

## Publishing Layer

The Publishing Layer handles manual review and publishing to target platforms.

### Example 6: Reviewing Pending Content

```javascript
// Get all pending content for review
async function getPendingReviews(platform = null) {
  let url = 'https://your-api.workers.dev/api/to-publish?review_status=pending';
  
  if (platform) {
    url += `&platform=${platform}`;
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  return data.data;
}

// Example usage
const pendingWechat = await getPendingReviews('wechat');
console.log(`${pendingWechat.length} articles pending review for WeChat`);
```

### Example 7: Approving Content for Publication

```javascript
async function approveContent(toPublishId, reviewer) {
  const response = await fetch(
    `https://your-api.workers.dev/api/to-publish/${toPublishId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        review_status: 'approved'
      })
    }
  );
  
  const result = await response.json();
  console.log(`Content approved by ${reviewer}:`, result.data.id);
  
  return result.data;
}
```

### Example 8: Publishing to Platform

```javascript
async function publishApprovedContent() {
  // Get approved content
  const response = await fetch(
    'https://your-api.workers.dev/api/to-publish?review_status=approved&limit=10'
  );
  const approved = await response.json();
  
  for (const content of approved.data) {
    try {
      // Publish to the platform (pseudo-code)
      await platformAPI.publish({
        platform: content.platform,
        title: content.final_title,
        body: content.final_body
      });
      
      // Update status to published
      await fetch(
        `https://your-api.workers.dev/api/to-publish/${content.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            review_status: 'published'
          })
        }
      );
      
      console.log(`Published: ${content.final_title}`);
    } catch (error) {
      console.error(`Failed to publish ${content.id}:`, error);
    }
  }
}
```

## Complete Workflow Example

### Example 9: End-to-End Automated Workflow

```javascript
class AIditorWorkflow {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
  }
  
  // Step 1: Collect materials
  async collectMaterials(sources) {
    console.log('Collecting materials from sources...');
    const materials = [];
    
    for (const source of sources) {
      const articles = await source.fetch(); // Your source fetcher
      
      for (const article of articles) {
        const response = await fetch(`${this.apiBaseUrl}/api/materials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: article.title,
            body: article.content,
            source: article.url,
            tags: article.tags
          })
        });
        
        const result = await response.json();
        materials.push(result.data);
      }
    }
    
    console.log(`Collected ${materials.length} materials`);
    return materials;
  }
  
  // Step 2: Process with AI
  async processWithAI(aiService, limit = 10) {
    console.log('Processing materials with AI...');
    
    const response = await fetch(
      `${this.apiBaseUrl}/api/materials?status=pending&limit=${limit}`
    );
    const materials = await response.json();
    
    const processed = [];
    
    for (const material of materials.data) {
      // Mark as processing
      await fetch(`${this.apiBaseUrl}/api/materials/${material.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'processing' })
      });
      
      try {
        // AI processing
        const result = await aiService.process(material);
        
        // Create to-publish record
        const toPublishResponse = await fetch(
          `${this.apiBaseUrl}/api/to-publish`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              final_title: result.title,
              final_body: result.content,
              platform: result.platform || 'wechat',
              material_id: material.id
            })
          }
        );
        
        const toPublish = await toPublishResponse.json();
        processed.push(toPublish.data);
        
        // Mark as processed
        await fetch(`${this.apiBaseUrl}/api/materials/${material.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'processed' })
        });
      } catch (error) {
        // Mark as failed
        await fetch(`${this.apiBaseUrl}/api/materials/${material.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'failed' })
        });
      }
    }
    
    console.log(`Processed ${processed.length} materials`);
    return processed;
  }
  
  // Step 3: Review and publish
  async reviewAndPublish(reviewer) {
    console.log('Reviewing and publishing content...');
    
    // Get pending reviews
    const response = await fetch(
      `${this.apiBaseUrl}/api/to-publish?review_status=pending`
    );
    const pending = await response.json();
    
    const published = [];
    
    for (const content of pending.data) {
      // In real implementation, this would involve manual review
      // For this example, we'll auto-approve based on some criteria
      const shouldApprove = await reviewer.review(content);
      
      if (shouldApprove) {
        // Approve
        await fetch(`${this.apiBaseUrl}/api/to-publish/${content.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ review_status: 'approved' })
        });
        
        // Publish (pseudo-code)
        await this.publishToPlatform(content);
        
        // Mark as published
        await fetch(`${this.apiBaseUrl}/api/to-publish/${content.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ review_status: 'published' })
        });
        
        published.push(content);
      }
    }
    
    console.log(`Published ${published.length} articles`);
    return published;
  }
  
  async publishToPlatform(content) {
    // Your platform publishing logic here
    console.log(`Publishing to ${content.platform}: ${content.final_title}`);
  }
  
  // Run the complete workflow
  async run(sources, aiService, reviewer) {
    console.log('Starting AIditor workflow...\n');
    
    const materials = await this.collectMaterials(sources);
    const processed = await this.processWithAI(aiService);
    const published = await this.reviewAndPublish(reviewer);
    
    console.log('\nWorkflow completed!');
    console.log(`Materials collected: ${materials.length}`);
    console.log(`Materials processed: ${processed.length}`);
    console.log(`Articles published: ${published.length}`);
  }
}

// Usage
const workflow = new AIditorWorkflow('https://your-api.workers.dev');
workflow.run(mySources, myAIService, myReviewer);
```

## Monitoring and Analytics

### Example 10: Getting Workflow Statistics

```javascript
async function getWorkflowStats(apiBaseUrl) {
  // Materials by status
  const pendingMaterials = await fetch(
    `${apiBaseUrl}/api/materials?status=pending`
  ).then(r => r.json());
  
  const processedMaterials = await fetch(
    `${apiBaseUrl}/api/materials?status=processed`
  ).then(r => r.json());
  
  const failedMaterials = await fetch(
    `${apiBaseUrl}/api/materials?status=failed`
  ).then(r => r.json());
  
  // To-publish by review status
  const pendingReviews = await fetch(
    `${apiBaseUrl}/api/to-publish?review_status=pending`
  ).then(r => r.json());
  
  const approved = await fetch(
    `${apiBaseUrl}/api/to-publish?review_status=approved`
  ).then(r => r.json());
  
  const published = await fetch(
    `${apiBaseUrl}/api/to-publish?review_status=published`
  ).then(r => r.json());
  
  return {
    materials: {
      pending: pendingMaterials.data.length,
      processed: processedMaterials.data.length,
      failed: failedMaterials.data.length
    },
    toPublish: {
      pendingReview: pendingReviews.data.length,
      approved: approved.data.length,
      published: published.data.length
    }
  };
}

// Usage
const stats = await getWorkflowStats('https://your-api.workers.dev');
console.log('Workflow Statistics:', stats);
```

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Rate Limiting**: Implement delays between batch operations
3. **Logging**: Log all operations for debugging and monitoring
4. **Status Updates**: Update status fields to track workflow progress
5. **Idempotency**: Use unique IDs to avoid duplicate processing
6. **Pagination**: Use limit and offset for large datasets
7. **Filtering**: Use status and time filters to optimize queries
