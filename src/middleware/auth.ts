// Authentication middleware

import type { Context, Next } from 'hono';
import type { Env } from '../types';

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  // Skip auth check for root health check endpoint
  if (c.req.path === '/') {
    return next();
  }

  const authHeader = c.req.header('X-API-Key');
  const apiKey = c.env.API_KEY;

  if (!authHeader || authHeader !== apiKey) {
    return c.json({
      success: false,
      error: 'Unauthorized - Invalid or missing API key',
    }, 401);
  }

  return next();
}
