# Engineering Decision Log

This log records real architectural and implementation decisions made while building
this project, in chronological order. Each entry includes the context, the decision,
alternatives considered, and — where applicable — actual evidence (query plans, test
output, benchmarks) rather than assumptions. This file exists so that any technical
decision in this project can be explained with reasoning and proof, not just recall.


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

---

## Decision: Indexing strategy based on EXPLAIN ANALYZE evidence

### Context
Needed to determine which columns actually benefit from indexing for our real query patterns (brand filter, RAM+price combined filter/sort, category search, price sort), rather than indexing speculatively.

### Decision
Added four indexes: `idx_products_brand` (equality filter), `idx_products_category` (category lookups), `idx_products_price` (sort-heavy queries), and a composite `idx_products_ram_price` (ram_gb, price) intended for our combined filter+sort pattern.

### Evidence (real EXPLAIN ANALYZE output, 5000-row table)
- `brand = 'Dell'`: planner chose `Bitmap Heap Scan` via `idx_products_brand` on its own (604/5000 rows matched — selective enough). Execution time 1.888ms.
- `ram_gb >= 16 ORDER BY price ASC LIMIT 20`: planner used `idx_products_price` alone, NOT the composite `idx_products_ram_price` — because with `LIMIT 20`, walking the price index in order and filtering `ram_gb` as it goes was cheaper than using the composite index. Execution time 0.806ms.
- `category ILIKE '%gaming%'`: still `Seq Scan`, 5.868ms — confirmed a plain B-tree index cannot support a leading-wildcard ILIKE. This is a structural limitation, not a missing index; fixing it would require `pg_trgm` (trigram) indexing or full-text search, which we deliberately did not add — out of scope for this project's stated goals, and noted here as an explicit, known limitation rather than an oversight.
- `ORDER BY price DESC LIMIT 20`: `Index Scan Backward` via `idx_products_price`, 0.408ms — fastest of all four.
- Forcing `enable_seqscan = off` on the brand query changed almost nothing (1.334ms vs 1.888ms), confirming the planner's default choice was already optimal — not evidence the index made a dramatic difference on this small table, just confirmation it was already being used correctly.

### Why we chose this
Indexes were added based on real query shapes from `productService.js`, not guessed. The composite index not being used is a genuine, useful finding (documented instead of hidden) — it demonstrates the planner picks execution paths dynamically based on `LIMIT`/selectivity, not just "does an index exist."

### Tradeoffs
Every index adds a small write-time cost (index maintenance on INSERT/UPDATE) — acceptable here since this is a read-heavy search app.

### Status
Accepted — with `idx_products_ram_price`'s actual usefulness flagged for further investigation in Phase 23.

---

## Decision: Composite index (ram_gb, price) — when it's actually used

### Context
Phase 22 found idx_products_ram_price wasn't used for `ram_gb >= 16 ORDER BY price ASC LIMIT 20`, since ram_gb >= 16 matches most rows (low selectivity), so the planner preferred walking idx_products_price directly and filtering as it went.

### Decision
Kept the composite index — it IS used for more selective queries: `ram_gb >= 64` (fewer matching rows) and especially `ram_gb = 64` (equality), where the index is stored pre-sorted by (ram_gb, price), letting Postgres avoid a separate sort step entirely.

### Evidence
Confirmed via EXPLAIN ANALYZE: dropping the index for an equality+sort query reintroduced an explicit Sort node; recreating it removed that sort step, using the index directly.

### Why this matters
This demonstrates that composite indexes are chosen based on actual selectivity and query shape, not merely existence. A range filter over a majority of rows won't reliably trigger a composite index; an equality filter combined with a sort on the second column will.

### Status
Accepted

---

## Decision: Redis caching strategy for GET /api/products

### Context
Search/filter/sort queries are read-heavy and often repeated (same popular filters hit again and again). Caching avoids redundant identical database work.

### Decision
Cache-aside pattern: check Redis before querying Postgres; on miss, query Postgres and populate Redis with a 60-second TTL. Cache key is built by sorting all active filter params alphabetically and joining them, so param order never produces a false cache miss. Only GET /api/products (list) is cached — no write endpoints exist in this project, so no invalidation logic was needed beyond TTL expiry.

### Why we chose this
Cache-aside is simple, well-understood, and appropriate for a read-heavy, write-rare workload. A 60-second TTL balances "meaningfully reduces DB load under repeated searches" against "stale data risk," which is low here since our dataset is static/synthetic.

### Evidence
Verified via Jest: repeated identical requests return identical data, and a `pool.query` spy confirms the second identical request does NOT re-query Postgres (see tests/cache.test.js). Different filter combinations were confirmed to produce different cache keys (no false hits).

### Tradeoffs
No cache invalidation beyond TTL — acceptable only because there are no write endpoints. If this project added product updates later, this caching layer would need explicit invalidation on write, which is a real limitation we're flagging now rather than over-engineering for a feature that doesn't exist yet. Redis read/write failures are caught and logged rather than crashing requests — caching is an optimization, not a hard dependency.

### Status
Accepted

---

## Decision: Code review pass

### Context
Before final documentation and submission, reviewed the full codebase for dead code, inconsistent error handling, and accidentally committed secrets.

### Findings
Ran ESLint with --fix across the frontend; checked for stray console.log statements; confirmed .env files were never committed to git history (only .env.example); confirmed .gitignore correctly excludes node_modules and .env in both client/ and server/.

### Status
Accepted
