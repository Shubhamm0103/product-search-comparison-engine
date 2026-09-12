# Product Search & Comparison Engine

A full-stack product search and comparison platform — search, filter, sort, paginate, and compare products side by side. Built to demonstrate backend data-engineering and API design skills, not just CRUD.

## What this project demonstrates

- Server-side search, filtering, sorting, and pagination implemented as real, parameterized SQL queries against PostgreSQL — not client-side array filtering
- Query performance decisions backed by actual `EXPLAIN ANALYZE` output, including an honest account of where a composite index was *not* chosen by the planner and why (see `docs/decision-log.md`)
- Redis caching using the cache-aside pattern, with a test that proves a cache hit by spying on the database query function — not just measuring response time
- SQL-injection resistance verified with an automated test that actually attempts an injection string and confirms the table survives
- A bulk comparison endpoint (`/api/products/compare?ids=...`) instead of one request per compared product
- Deterministic sort ordering (a secondary `id` tie-breaker on every sort) so offset pagination never skips or duplicates rows
- Backend and frontend test suites covering success paths, validation, security, and pagination edge cases

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), react-router-dom |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Cache | Redis |
| Testing | Jest, Supertest (backend); Vitest, React Testing Library (frontend) |

Deliberately excluded: Docker, TypeScript, authentication, GraphQL, microservices, CI/CD — not because they're bad, but because they weren't needed to demonstrate the skills this project targets. See `docs/decision-log.md` for the reasoning behind each major decision.

## Search implementation

Search is implemented with PostgreSQL's `ILIKE` for case-insensitive substring matching across brand, model, and category. This is **not** a full-text search engine and does not provide fuzzy or typo-tolerant matching. A standard B-tree index cannot accelerate a leading-wildcard `ILIKE '%term%'` query — this is a documented, structural limitation, not an oversight (see the indexing entries in `docs/decision-log.md`). A `pg_trgm` trigram index would be the correct next step to address it, and was deliberately not added in this iteration to keep scope focused on the core demonstrated skills.

## Dataset

~5,000 synthetically generated laptop product records (real brand names and processor families; prices correlated realistically with specs). This is explicitly **not** real market data. Performance and indexing findings in this project apply to this ~5,000-row dataset and should not be read as claims about production-scale (millions-of-rows) performance.

## Project structure

    product-search-comparison-engine/
    |-- client/          React frontend (Vite)
    |-- server/          Express backend
    |   |-- src/
    |   |   |-- db/            PostgreSQL pool + Redis client
    |   |   |-- services/      Query-building business logic
    |   |   |-- controllers/   Request validation + response handling
    |   |   |-- routes/
    |   |-- tests/       Jest/Supertest tests
    |-- database/
    |   |-- schema.sql          Table definition + indexes
    |   |-- generate-seed.js    Synthetic data generator
    |-- docs/
        |-- decision-log.md     Engineering decisions, with evidence

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- Redis 7+

### Database

    createdb product_search_db
    psql product_search_db -f database/schema.sql
    node database/generate-seed.js
    psql product_search_db -f database/seed.sql

### Backend

    cd server
    npm install
    cp .env.example .env
    node src/app.js

The backend listens on the port set in `.env` (`PORT`, default `5000`). Once running, it is reachable **only on your own machine** at `http://localhost:5000` — this address is not a public link and will not open from GitHub or any other computer.

### Frontend

    cd client
    npm install
    npm run dev

Vite will print the local URL it's running on (typically `http://localhost:5173`, but it may pick a different port if that one is in use — check your terminal output for the actual address). Like the backend, this only works while `npm run dev` is running on your machine.

## Running tests

    cd server && npm test
    cd client && npm test

## API

`GET /api/products` — search/filter/sort/paginate.
Query params: `q`, `brand`, `category`, `minPrice`, `maxPrice`, `minRam`, `sort` (`newest`|`price_asc`|`price_desc`|`rating_desc`), `page`, `limit`.

`GET /api/products/:id` — single product.

`GET /api/products/compare?ids=1,2,3,4` — bulk fetch for the comparison feature (up to 4 ids), backed by a single parameterized query.

Response shape for the list endpoint:

    {
      "data": [ ... ],
      "pagination": { "page": 1, "limit": 20, "total": 5000, "totalPages": 250 }
    }

## Engineering decisions

Every non-trivial technical choice in this project — schema design, synthetic data strategy, API response shape, indexing decisions backed by real `EXPLAIN ANALYZE` output, caching strategy, and test coverage rationale — is documented with evidence in [`docs/decision-log.md`](docs/decision-log.md).
