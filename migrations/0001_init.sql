-- Migration: Create materials and to_publish tables
-- Created at: 2024-01-01

-- Material Pool (素材池)
CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    source TEXT,
    tags TEXT,
    collection_time INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE INDEX idx_materials_status ON materials(status);
CREATE INDEX idx_materials_collection_time ON materials(collection_time);

-- To-Publish Pool (待发池)
CREATE TABLE IF NOT EXISTS to_publish (
    id TEXT PRIMARY KEY,
    final_title TEXT NOT NULL,
    final_body TEXT NOT NULL,
    platform TEXT NOT NULL,
    review_status TEXT DEFAULT 'pending',
    material_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (material_id) REFERENCES materials(id)
);

CREATE INDEX idx_to_publish_review_status ON to_publish(review_status);
CREATE INDEX idx_to_publish_platform ON to_publish(platform);
CREATE INDEX idx_to_publish_material_id ON to_publish(material_id);
