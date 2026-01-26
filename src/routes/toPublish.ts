// To-Publish Pool API routes (待发池)

import { Hono } from 'hono';
import type { Env } from '../types';
import {
  createToPublish,
  getToPublish,
  listToPublish,
  updateToPublish,
} from '../db/toPublish';
import { errorResponse, successResponse } from '../utils';

const toPublish = new Hono<{ Bindings: Env }>();

// POST /api/to-publish - Create a new to-publish record
toPublish.post('/', async (c) => {
  try {
    const body = await c.req.json();

    if (!body.final_title || !body.final_body || !body.platform) {
      return errorResponse('Final title, final body, and platform are required', 400);
    }

    const record = await createToPublish(c.env.DB, body);
    return successResponse(record, 'To-publish record created successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
});

// GET /api/to-publish - List to-publish records with optional filters
toPublish.get('/', async (c) => {
  try {
    const review_status = c.req.query('review_status');
    const platform = c.req.query('platform');
    const limit = c.req.query('limit');
    const offset = c.req.query('offset');

    const filters: any = {};
    if (review_status) filters.review_status = review_status;
    if (platform) filters.platform = platform;
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);

    const records = await listToPublish(c.env.DB, filters);
    return successResponse(records);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
});

// GET /api/to-publish/:id - Get a specific to-publish record
toPublish.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const record = await getToPublish(c.env.DB, id);

    if (!record) {
      return errorResponse('To-publish record not found', 404);
    }

    return successResponse(record);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
});

// PUT /api/to-publish/:id - Update a to-publish record
toPublish.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const record = await updateToPublish(c.env.DB, id, body);

    if (!record) {
      return errorResponse('To-publish record not found', 404);
    }

    return successResponse(record, 'To-publish record updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
});

export default toPublish;
