# Product Search & Comparison Engine

A full-stack product search and comparison platform — search, filter, sort, paginate, and compare products side by side — built to demonstrate backend data/performance engineering, not just CRUD.

## What this project demonstrates

- Search/filter/sort/pagination implemented as real, indexed SQL queries — not client-side array filtering
- Query performance backed by actual EXPLAIN ANALYZE evidence, not assumptions (see docs/decision-log.md)
- Redis caching (cache-aside pattern) with a proven cache-hit test, not just "it feels faster"
- SQL-injection resistance proven by actually attempting an injection in a test, not just trusting parameterized queries
- 20+ backend tests (Jest/Supertest) and frontend tests (Vitest/RTL) covering success paths, validation, security, and edge cases
- Every non-trivial decision documented with context, alternatives considered, and evidence

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), react-router-dom |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Cache | Redis |
| Testing | Jest, Supertest (backend); Vitest, React Testing Library (frontend) |

Deliberately excluded: Docker, TypeScript, auth, GraphQL, microservices, CI/CD — not because they're bad, but because they weren't needed to demonstrate the skills this project targets. See docs/decision-log.md for the full reasoning trail.

## Dataset

~5,000 synthetically generated laptop product records (real brand names and processor families, prices correlated realistically with specs). This is explicitly not real market data — see the decision log for why synthetic data was chosen over a small real dataset.

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
        |-- decision-log.md     Every real engineering decision, with evidence

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

Runs on http://localhost:5000.

### Frontend

    cd client
    npm install
    npm run dev

Runs on http://localhost:5173.

## Running tests

    cd server && npm test
    cd client && npm test

## API

GET /api/products — search/filter/sort/paginate. Query params: q, brand, category, minPrice, maxPrice, minRam, sort (newest|price_asc|price_desc|rating_desc), page, limit.

GET /api/products/:id — single product.

Response shape:

    {
      "data": [ ... ],
      "pagination": { "page": 1, "limit": 20, "total": 5000, "totalPages": 250 }
    }

## Engineering decisions

Every non-trivial choice made in this project is documented with evidence in docs/decision-log.md.
