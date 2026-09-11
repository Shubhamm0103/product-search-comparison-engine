CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    processor TEXT NOT NULL,
    ram_gb INTEGER NOT NULL CHECK (ram_gb > 0),
    storage_gb INTEGER NOT NULL CHECK (storage_gb > 0),
    storage_type TEXT NOT NULL,
    gpu TEXT,
    screen_size NUMERIC(3,1),
    resolution TEXT,
    operating_system TEXT,
    battery_life_hours NUMERIC(4,1),
    weight_kg NUMERIC(4,2),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- Indexes added in Phase 22 based on EXPLAIN ANALYZE findings against real query patterns
CREATE INDEX idx_products_brand ON products (brand);
CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_products_price ON products (price);
CREATE INDEX idx_products_ram_price ON products (ram_gb, price);
