# ExpenseTracker — Full-Stack Personal Finance Tool

A production-quality expense tracking application built with Node.js/Express (backend) and React (frontend).

## Live Demo

- **Frontend**: [Deploy link here after deployment]
- **Backend API**: [Deploy link here after deployment]

---

## Quick Start (Local)

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd expense-tracker

# 2. Start the backend
cd backend
npm install
npm start          # runs on http://localhost:3001

# 3. Start the frontend (new terminal)
cd frontend
npm install
npm start          # runs on http://localhost:3000
```

---

## Key Design Decisions

### Money Handling — Integer Storage (Paise)
Amounts are stored as **integers in paise** (1 INR = 100 paise) in the database. For example, ₹123.45 is stored as `12345`. This completely avoids IEEE 754 floating-point rounding errors that would occur if we stored `123.45` as a REAL/FLOAT. All arithmetic on the backend is done in integers; conversion to display format happens only at the API boundary.

### Idempotency for Safe Retries
The `POST /expenses` endpoint accepts an optional `Idempotency-Key` header (UUID). If the client retries the same request (due to network failure, double-click, or page reload), the API detects the duplicate key and returns the original response without creating a new record. The frontend generates a new key per form session and reuses it until the submission succeeds.

### Persistence — SQLite via `better-sqlite3`
SQLite was chosen over an in-memory store because:
- Data survives server restarts (important for "real-world conditions")
- Zero external dependencies / no separate DB server to run
- WAL journal mode gives concurrent read performance
- Sufficient for the scale of a personal finance tool

A full relational DB (PostgreSQL) would be the natural next step for multi-user or high-concurrency scenarios.

### Amount Validation
- Stored as `INTEGER NOT NULL CHECK(amount > 0)` — the DB enforces non-negative amounts as a second line of defence
- Frontend and backend both validate before any DB write

---

## API Reference

### `POST /expenses`
```json
// Request headers
Idempotency-Key: <uuid>   // optional but recommended

// Request body
{
  "amount": 150.50,
  "category": "Food",
  "description": "Lunch at office",
  "date": "2024-02-15"
}

// 201 Created
{
  "id": "uuid",
  "amount": "150.50",
  "category": "Food",
  "description": "Lunch at office",
  "date": "2024-02-15",
  "created_at": "2024-02-15T08:30:00.000Z"
}
```

### `GET /expenses`
```
GET /expenses?category=Food&sort=date_desc
```
```json
{
  "expenses": [...],
  "total": "1234.50",
  "count": 12
}
```

### `GET /expenses/categories`
Returns list of all categories (defaults + user-created).

---

## Trade-offs (due to timebox)

| Skipped | Reason |
|---|---|
| Authentication | Out of scope for single-user personal tool |
| Edit / Delete expenses | Not in acceptance criteria |
| Pagination | Dataset small enough to load all at once |
| Rate limiting | Would add for production multi-user app |
| Full OpenAPI spec | Would add for team collaboration |

---

## What I Intentionally Did Not Do

- **No user accounts** — single-user tool as specified
- **No currency conversion** — INR only, per spec
- **No real-time sync / WebSockets** — polling on action is sufficient
- **No Docker Compose** — kept setup simple; SQLite needs no container

---

## Automated Tests

```bash
cd backend
npm test
```

Tests cover:
- Creating a valid expense
- Rejecting negative amounts and missing fields
- Idempotency (same key returns same result)
- Filtering by category
- Sorting by date (newest first)
