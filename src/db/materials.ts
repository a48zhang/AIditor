// Database operations for Material Pool (素材池)

import type {
  Material,
  CreateMaterialInput,
  UpdateMaterialInput,
  MaterialFilters,
} from '../types';
import { generateId, getCurrentTimestamp } from '../utils';

export async function createMaterial(
  db: D1Database,
  input: CreateMaterialInput
): Promise<Material> {
  const id = generateId();
  const now = getCurrentTimestamp();
  const collection_time = input.collection_time || now;
  const status = input.status || 'pending';

  const material: Material = {
    id,
    title: input.title,
    body: input.body,
    source: input.source || '',
    tags: input.tags || '',
    collection_time,
    status,
    created_at: now,
    updated_at: now,
  };

  await db
    .prepare(
      `INSERT INTO materials (id, title, body, source, tags, collection_time, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      material.id,
      material.title,
      material.body,
      material.source,
      material.tags,
      material.collection_time,
      material.status,
      material.created_at,
      material.updated_at
    )
    .run();

  return material;
}

export async function getMaterial(
  db: D1Database,
  id: string
): Promise<Material | null> {
  const result = await db
    .prepare('SELECT * FROM materials WHERE id = ?')
    .bind(id)
    .first<Material>();

  return result;
}

export async function listMaterials(
  db: D1Database,
  filters: MaterialFilters = {}
): Promise<Material[]> {
  let query = 'SELECT * FROM materials WHERE 1=1';
  const bindings: any[] = [];

  if (filters.status) {
    query += ' AND status = ?';
    bindings.push(filters.status);
  }

  if (filters.start_time) {
    query += ' AND collection_time >= ?';
    bindings.push(filters.start_time);
  }

  if (filters.end_time) {
    query += ' AND collection_time <= ?';
    bindings.push(filters.end_time);
  }

  query += ' ORDER BY collection_time DESC';

  if (filters.limit) {
    query += ' LIMIT ?';
    bindings.push(filters.limit);
  }

  if (filters.offset) {
    query += ' OFFSET ?';
    bindings.push(filters.offset);
  }

  const result = await db.prepare(query).bind(...bindings).all<Material>();

  return result.results || [];
}

export async function updateMaterial(
  db: D1Database,
  id: string,
  input: UpdateMaterialInput
): Promise<Material | null> {
  const existing = await getMaterial(db, id);
  if (!existing) {
    return null;
  }

  const updates: string[] = [];
  const bindings: any[] = [];

  if (input.title !== undefined) {
    updates.push('title = ?');
    bindings.push(input.title);
  }

  if (input.body !== undefined) {
    updates.push('body = ?');
    bindings.push(input.body);
  }

  if (input.source !== undefined) {
    updates.push('source = ?');
    bindings.push(input.source);
  }

  if (input.tags !== undefined) {
    updates.push('tags = ?');
    bindings.push(input.tags);
  }

  if (input.status !== undefined) {
    updates.push('status = ?');
    bindings.push(input.status);
  }

  if (updates.length === 0) {
    return existing;
  }

  updates.push('updated_at = ?');
  bindings.push(getCurrentTimestamp());

  bindings.push(id);

  await db
    .prepare(`UPDATE materials SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...bindings)
    .run();

  return getMaterial(db, id);
}
