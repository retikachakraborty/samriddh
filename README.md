# ✦ SAMRIDDH — Executive Business Intelligence & Analytics

**Samriddh** is an enterprise-grade executive analytics platform powering retail velocity metrics, RFM customer segmentation, spatial Voice-of-Customer sentiment synthesis, and autonomous **SAM AI Intelligence**.

The platform maintains strict statistical integrity by keeping **UCI Retail transaction analytics** and **E-Commerce Voice of Customer review analytics** separate without artificial data joining.

---

## 🏗️ Architecture & Tech Stack

```
                               ┌───────────────────────────┐
                               │   React 18 + Vite SPA     │
                               │   (TypeScript, Tailwind)  │
                               └─────────────┬─────────────┘
                                             │ HTTP / JWT
                                             ▼
                               ┌───────────────────────────┐
                               │    FastAPI Gateway        │
                               │  (Python 3.12, Uvicorn)   │
                               └──────┬─────────────┬──────┘
                                      │             │
                    PostgREST / Auth │             │ Gemini LLM API
                                      ▼             ▼
                        ┌──────────────────┐   ┌──────────────────┐
                        │ Remote Supabase  │   │  SAM AI Engine   │
                        │ (PostgreSQL+RLS) │   │ (Google Gemini)  │
                        └──────────────────┘   └──────────────────┘
```

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts
* **Backend**: Python 3.12, FastAPI, Uvicorn, Pydantic v2, HTTPX
* **Database & Auth**: Supabase PostgreSQL, Row Level Security (RLS), PostgREST, Supabase Auth
* **AI Intelligence**: Google Gemini (via `google-genai` SDK)

---

## 📁 Project Structure

```
Samriddh/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── api/              # Endpoints (/auth, /dashboard, /priorities, /sam)
│   │   ├── core/             # Settings & Supabase PostgREST client
│   │   ├── dependencies/     # JWT authentication & user dependencies
│   │   ├── schemas/          # Pydantic data schemas
│   │   └── services/         # SAM AI service (Gemini integration & query handling)
│   ├── main.py               # FastAPI application entry point
│   └── requirements.txt      # Backend Python dependencies
├── frontend/                 # React + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── api/              # Frontend API services
│   │   ├── components/       # UI cards, charts, drawers, protected routes
│   │   ├── context/          # AuthContext for session & role management
│   │   ├── layouts/          # Main AppLayout (Sidebar, Topbar, Viewport)
│   │   ├── pages/            # Dashboard views (Overview, Customers, Products, Reviews, Countries, Priorities, SAM)
│   │   └── types/            # TypeScript interfaces
│   ├── index.html
│   └── package.json
├── data/                     # Local Dataset Storage & ETL Outputs
│   ├── raw/                  # Read-only source datasets (UCI Online Retail.xlsx, reviews.csv)
│   ├── processed/            # Cleaned CSV outputs (transactions_cleaned.csv, customers.csv, etc.)
│   └── quality/              # Data quality audit report (data_quality.json)
├── scripts/                  # Data Pipeline & Management Tools
│   ├── data_pipeline.py      # Idempotent Python ETL & RFM scoring pipeline
│   ├── import_to_supabase.py # Seeds cleaned CSVs into Supabase PostgreSQL
│   └── start.sh              # Single-command startup runner for FastAPI + Vite
└── supabase/                 # Database Schema & Migrations
    └── migrations/           # SQL migration files (Tables, RLS policies, RPC functions)
```

---

## 🚀 Quick Start Guide

### Option 1: Unified Single-Command Startup (Recommended)

Run the unified runner script from the root directory:

```bash
bash scripts/start.sh
```

This command automatically:
1. Validates Python and Node/npm environments.
2. Checks `.env` configuration.
3. Launches FastAPI Backend on `http://127.0.0.1:8000`.
4. Launches Vite Frontend on `http://localhost:5173`.

---

### Option 2: Manual Development Setup

#### 1. Configure Environment
Ensure `.env` exists in the project root:

```bash
cp .env.example .env
```

#### 2. Start Backend (FastAPI)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 3. Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Authentication & Account Roles

The platform supports two account profiles:

| Account Type | Credentials | Access Level | Description |
| :--- | :--- | :--- | :--- |
| **Demo Account** | `executive@samriddh.com` / `SamriddhPassword2026!` | **Read-Only** | Instant 1-Click access via **"Launch Samriddh Demo"**. Allows full dashboard evaluation; mutation endpoints (creating/editing priorities) are restricted. |
| **Analyst Account** | Register via [Create Account](http://127.0.0.1:5173/signup) | **Full Access** | Registered via Supabase Auth. Grants full read/write privileges, allowing users to create, update, complete, and delete strategic priorities. |

---

## 📊 Data Pipeline & Integrity Audit

Run the idempotent ETL pipeline anytime:

```bash
python3 scripts/data_pipeline.py
```

### Verified Dataset Metrics (`data/quality/data_quality.json`)

#### 1. Retail Transactions (UCI Online Retail)
* **Raw Input Rows**: `541,909`
* **Clean Output Rows**: `536,641` (**99.03% data retention rate**)
* **Duplicates Removed**: `5,268` exact duplicate rows
* **Customer Analytics Cohort**: `401,604` rows linked to `4,372` distinct customer profiles
* **General Analytics Cohort**: `135,037` guest transaction rows preserved for global revenue and product sales velocity
* **Breakdown**: `526,051` Sales | `9,251` Cancellations | `1,336` Returns

#### 2. E-Commerce Customer Reviews (Voice of Customer)
* **Total Reviews**: `100,000` (100% retained)
* **Products Covered**: `5,000` products
* **Sellers Covered**: `500` sellers
* **Sentiment Analysis**: `100,000` sentiment & aspect records across 60 monthly trend periods

---

## 🛠️ Data Import to Supabase

To re-seed or sync local processed data with remote Supabase tables:

```bash
python3 scripts/import_to_supabase.py
```

---

## 📜 API Documentation

When the backend is running, interactive API docs are available at:
* **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### Primary Endpoints Overview
* `POST /api/auth/signin` & `POST /api/auth/signup` — Supabase Auth authentication
* `GET /api/dashboard/overview` — Executive summary KPIs, revenue trends & top products
* `GET /api/dashboard/customers` — Paginated RFM customer segmentation table
* `GET /api/dashboard/products` — Product velocity and return rate analytics
* `GET /api/dashboard/reviews` & `/reviews/summary` — Voice of Customer sentiment streams
* `GET/POST/PATCH/DELETE /api/priorities` — Authenticated user priority management
* `POST /api/sam/chat` — Conversational natural language queries to SAM AI
