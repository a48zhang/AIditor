// Material Pool API routes (素材池)

import { Hono } from 'hono';
import type { Env } from '../types';
import {
  createMaterial,
  getMaterial,
  listMaterials,
  updateMaterial,
} from '../db/materials';
import { errorResponse, successResponse } from '../utils';

const materials = new Hono<{ Bindings: Env }>();

// POST /api/materials - Create a new material
materials.post('/', async (c) => {
  try {
    const body = await c.req.json();

    if (!body.title || !body.body) {
      return errorResponse('Title and body are required', 400);
    }

    const material = await createMaterial(c.env.DB, body);
    return successResponse(material, 'Material created successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
});

// GET /api/materials - List materials with optional filters
materials.get('/', async (c) => {
  try {
    const status = c.req.query('status');
    const start_time = c.req.query('start_time');
    const end_time = c.req.query('end_time');
    const limit = c.req.query('limit');
    const offset = c.req.query('offset');

    const filters: any = {};
    if (status) filters.status = status;
    if (start_time) filters.start_time = parseInt(start_time);
    if (end_time) filters.end_time = parseInt(end_time);
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);

    const materialsList = await listMaterials(c.env.DB, filters);
    return successResponse(materialsList);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
});

// GET /api/materials/:id - Get a specific material
materials.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const material = await getMaterial(c.env.DB, id);

    if (!material) {
      return errorResponse('Material not found', 404);
    }

    return successResponse(material);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
});

// PUT /api/materials/:id - Update a material
materials.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const material = await updateMaterial(c.env.DB, id, body);

    if (!material) {
      return errorResponse('Material not found', 404);
    }

    return successResponse(material, 'Material updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
});

export default materials;
