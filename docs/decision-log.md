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

---

## Decision: Use a synthetically generated dataset instead of real product data

### Context
Search, filtering, sorting, pagination, and indexing experiments all need enough rows to be meaningful. Most publicly available laptop datasets are too small (a few hundred rows) and carry licensing/attribution complexity.

### Decision
Generate ~5,000 synthetic laptop product records using a Node.js script (`database/generate-seed.js`), using real brand names and real processor families, with prices and specs correlated realistically (higher tier → more RAM/storage → higher price). This data is explicitly labeled as synthetic everywhere it appears (file header comment, this log, and later the README).

### Alternatives considered
1. Use a real public dataset as-is (too small for meaningful performance experiments).
2. Use a real dataset "topped up" with synthetic rows (rejected — blurs the line between real and fabricated data, which we want to avoid entirely).

### Why we chose this
Full control over dataset size and distribution, no licensing concerns, and no risk of ever misrepresenting synthetic data as real, since none of it is claimed to be real in the first place.

### Tradeoffs
This is not real market data. Any performance or business conclusions drawn from it apply only to this synthetic dataset's characteristics, not real-world laptop pricing/demand.

### Evidence
Generator run on 2026-09-11 produced exactly 5,000 rows, verified via `SELECT COUNT(*) FROM products;` → 5000. Spot-checked sample rows show plausible brand/spec/price correlation and expected NULLs on optional fields (gpu, screen_size, resolution, etc.).

### Status
Accepted
---

## Decision: API response structure for GET /api/products

### Context
The products listing endpoint needs to return both product data and pagination metadata in a predictable shape.

### Decision
Response has two top-level keys: `data` (array of products) and `pagination` (page, limit, total, totalPages).

### Why we chose this
Clear separation between actual payload and request/response metadata; predictable for the frontend to destructure.

### Evidence
Implemented in server/src/services/productService.js and productController.js; verified via curl against the live seeded database (5000 products) on 2026-09-11.

### Status
Accepted

---

## Decision: Query parameter validation strategy

### Context
API accepts several optional query params that must never be trusted blindly.

### Decision
All query params validated server-side before touching the database; `sort` values matched against a whitelist rather than ever interpolated directly into SQL.

### Why we chose this
Frontend validation alone isn't trustworthy; whitelisting sort values closes off SQL injection risk through that parameter.

### Status
Accepted

---

## Decision: Backend testing strategy

### Context
The API needs automated tests instead of relying on manual curl checks, to prevent regressions as the project grows.

### Decision
Use Jest as the test runner and Supertest to send in-memory HTTP requests directly to the exported Express app (no separate running server needed for tests). Export `app` from app.js, guarding `app.listen()` behind `if (require.main === module)` so tests don't accidentally start a real server on a real port.

### Why we chose this
Supertest against an in-memory app is faster and more reliable than spinning up a real server for tests, and avoids port conflicts during test runs.

### Evidence
9 tests written covering success cases, filtering, sorting, and validation errors; all passing as of 2026-09-11 (see tests/products.test.js).

### Status
Accepted
