// Main application entry point

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import materials from './routes/materials';
import toPublish from './routes/toPublish';
import { authMiddleware } from './middleware/auth';

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('/*', cors());

// Authentication middleware
app.use('/*', authMiddleware);

// Health check
app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'AIditor API - AI-based news editor backend',
    version: '1.0.0',
    endpoints: {
      materials: '/api/materials',
      toPublish: '/api/to-publish',
    },
  });
});

// API routes
app.route('/api/materials', materials);
app.route('/api/to-publish', toPublish);

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint not found',
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({
    success: false,
    error: err.message || 'Internal server error',
  }, 500);
});

export default app;
