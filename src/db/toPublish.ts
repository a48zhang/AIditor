// Database operations for To-Publish Pool (待发池)

import type {
  ToPublish,
  CreateToPublishInput,
  UpdateToPublishInput,
  ToPublishFilters,
} from '../types';
import { generateId, getCurrentTimestamp } from '../utils';

export async function createToPublish(
  db: D1Database,
  input: CreateToPublishInput
): Promise<ToPublish> {
  const id = generateId();
  const now = getCurrentTimestamp();
  const review_status = input.review_status || 'pending';

  const toPublish: ToPublish = {
    id,
    final_title: input.final_title,
    final_body: input.final_body,
    platform: input.platform,
    review_status,
    material_id: input.material_id || '',
    created_at: now,
    updated_at: now,
  };

  await db
    .prepare(
      `INSERT INTO to_publish (id, final_title, final_body, platform, review_status, material_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      toPublish.id,
      toPublish.final_title,
      toPublish.final_body,
      toPublish.platform,
      toPublish.review_status,
      toPublish.material_id,
      toPublish.created_at,
      toPublish.updated_at
    )
    .run();

  return toPublish;
}

export async function getToPublish(
  db: D1Database,
  id: string
): Promise<ToPublish | null> {
  const result = await db
    .prepare('SELECT * FROM to_publish WHERE id = ?')
    .bind(id)
    .first<ToPublish>();

  return result;
}

export async function listToPublish(
  db: D1Database,
  filters: ToPublishFilters = {}
): Promise<ToPublish[]> {
  let query = 'SELECT * FROM to_publish WHERE 1=1';
  const bindings: any[] = [];

  if (filters.review_status) {
    query += ' AND review_status = ?';
    bindings.push(filters.review_status);
  }

  if (filters.platform) {
    query += ' AND platform = ?';
    bindings.push(filters.platform);
  }

  query += ' ORDER BY created_at DESC';

  if (filters.limit) {
    query += ' LIMIT ?';
    bindings.push(filters.limit);
  }

  if (filters.offset) {
    query += ' OFFSET ?';
    bindings.push(filters.offset);
  }

  const result = await db.prepare(query).bind(...bindings).all<ToPublish>();

  return result.results || [];
}

export async function updateToPublish(
  db: D1Database,
  id: string,
  input: UpdateToPublishInput
): Promise<ToPublish | null> {
  const existing = await getToPublish(db, id);
  if (!existing) {
    return null;
  }

  const updates: string[] = [];
  const bindings: any[] = [];

  if (input.final_title !== undefined) {
    updates.push('final_title = ?');
    bindings.push(input.final_title);
  }

  if (input.final_body !== undefined) {
    updates.push('final_body = ?');
    bindings.push(input.final_body);
  }

  if (input.platform !== undefined) {
    updates.push('platform = ?');
    bindings.push(input.platform);
  }

  if (input.review_status !== undefined) {
    updates.push('review_status = ?');
    bindings.push(input.review_status);
  }

  if (updates.length === 0) {
    return existing;
  }

  updates.push('updated_at = ?');
  bindings.push(getCurrentTimestamp());

  bindings.push(id);

  await db
    .prepare(`UPDATE to_publish SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...bindings)
    .run();

  return getToPublish(db, id);
}
