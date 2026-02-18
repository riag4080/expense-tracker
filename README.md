# 💰 ExpenseTracker — Full-Stack Personal Finance Tool

A personal finance tool built with **Node.js/Express** (backend) and **React** (frontend) to track daily expenses.

---

## 🔗 Live Demo

| | Link |
|---|---|
| **Frontend** | https://expense-tracker-pink-sigma.vercel.app/ |
| **Backend API** | https://expense-tracker-8drj.onrender.com/ |

> ⚠️ Backend is hosted on Render's free tier — first request may take ~50 seconds to wake up.

---

## 🚀 Quick Start (Local)

```bash
# 1. Clone the repo
git clone https://github.com/riag4080/expense-tracker.git
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

## 🏗️ Key Design Decisions

### 💵 Money Handling — Integer Storage (Paise)
Amounts are stored as **integers in paise** (1 INR = 100 paise). For example, ₹123.45 is stored as `12345`. This avoids floating-point precision issues that come up with REAL/FLOAT types. Conversion back to rupees happens only at the API boundary before sending the response.

### 🔁 Idempotency for Safe Retries
The `POST /expenses` endpoint accepts an optional **`Idempotency-Key`** header (UUID). If the client retries the same request due to network failure, double-click, or page reload, the API returns the original response **without creating a duplicate**. The frontend generates a new key per form session and reuses it until submission succeeds.

### 🗄️ Persistence — SQLite via `better-sqlite3`
SQLite made sense here because:
- **Data survives server restarts** — unlike in-memory stores
- **No separate DB server needed** — runs as a file alongside the app
- **WAL mode enabled** for better read performance
- Right fit for a single-user personal tool

> PostgreSQL would make more sense if this scales to multiple users.

### ✅ Amount Validation
- **DB-level:** `INTEGER NOT NULL CHECK(amount > 0)` as a safety net
- **Both frontend and backend** validate before any write happens

---

## 📡 API Reference

### `POST /expenses`

**Request Headers**
```
Idempotency-Key: <uuid>   // optional but recommended
```

**Request Body**
```json
{
  "amount": 150.50,
  "category": "Food",
  "description": "Lunch at office",
  "date": "2024-02-15"
}
```

**Response — 201 Created**
```json
{
  "id": "uuid",
  "amount": "150.50",
  "category": "Food",
  "description": "Lunch at office",
  "date": "2024-02-15",
  "created_at": "2024-02-15T08:30:00.000Z"
}
```

---

### `GET /expenses`

```
GET /expenses?category=Food&sort=date_desc
```

**Response**
```json
{
  "expenses": [...],
  "total": "1234.50",
  "count": 12
}
```

---

### `GET /expenses/categories`

Returns list of all categories (defaults + any added by user).

---

## ⚖️ Trade-offs (due to timebox)

| Skipped | Reason |
|---|---|
| Authentication | Out of scope for single-user tool |
| Edit / Delete expenses | Not in acceptance criteria |
| Pagination | Dataset small enough to load at once |
| Rate limiting | Would add for a multi-user production app |
| Full OpenAPI spec | Would add for team use |

---

## 🚫 What I Intentionally Did Not Do

- **No user accounts** — single-user tool as specified
- **No currency conversion** — INR only, per spec
- **No real-time sync** — refreshing on action is sufficient here
- **No Docker Compose** — SQLite needs no container, kept it simple

---

## 🧪 Automated Tests

```bash
cd backend
npm test
```

**Tests cover:**
- ✅ Creating a valid expense
- ✅ Rejecting negative amounts and missing fields
- ✅ Idempotency (same key returns same result)
- ✅ Filtering by category
- ✅ Sorting by date (newest first)
