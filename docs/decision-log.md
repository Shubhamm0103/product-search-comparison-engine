# Engineering Decision Log

## Decision: Nullable vs NOT NULL columns in the products schema

### Context
The `products` table needs columns for both core specs (brand, price, RAM, storage, processor) and secondary specs (GPU, screen size, resolution, OS, battery life, weight). Real product listings are not always complete for every spec.

### Decision
Core identifying/pricing/performance fields (brand, model, category, price, processor, ram_gb, storage_gb, storage_type) are `NOT NULL`. Secondary specs (gpu, screen_size, resolution, operating_system, battery_life_hours, weight_kg) are nullable.

### Alternatives considered
Making all columns `NOT NULL` with placeholder defaults (e.g. GPU defaulting to `'Integrated'`).

### Why we chose this
Forcing defaults on unknown secondary specs would misrepresent real data — we'd be inventing values instead of recording what's actually known. Making these fields nullable is honest about incomplete data and matches how real e-commerce catalogs behave.

### Tradeoffs
Application code (comparison view, filters, product cards) must explicitly handle `NULL` values for these fields rather than assuming every field is populated. This adds a small amount of defensive logic later but avoids fabricated data.

### Evidence
Schema created and verified via `\d products` on 2026-09-11 — all NOT NULL/nullable columns and CHECK constraints confirmed matching the design.

### Status
Accepted