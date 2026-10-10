# RetailIQ — Full-Stack Retail Consulting & Intelligence Platform

**Product Tagline:** *Understand performance. Predict what comes next. Make better retail decisions.*

**Authors:** Madhvan Aggarwal, Harshit Jain  
**Dataset & Foundation:** Rossmann Store Sales ML Consulting Project (1,115 stores, Jan 2013 – Jul 2015)

---

## 1. Executive Overview

RetailIQ transforms raw retail transaction records and trained machine learning models into an enterprise-grade consulting intelligence platform. It bridges the gap between machine learning engineers and non-technical retail stakeholders (business owners, store managers, regional directors, C-suite executives, and retail strategy consultants).

### Key Business Insights
- **The Core Traffic Disparity:** Top-tier stores sell **2.22× more** revenue per day than bottom-tier stores. Crucially, this gap is driven almost entirely by **customer footfall (2.21×)** rather than spend per customer (**only 1.04×**, €9.60 vs €9.20).
- **Revenue at Risk:** The deployed XGBoost risk classifier flags **306 stores** facing comp underperformance in Q3 2015, representing **€10.0M** in probability-weighted quarterly revenue at risk.
- **Model A (Forecaster):** Trained XGBoost v2 achieves **8.03% MAPE**, **€840 RMSE**, and **0.924 R²** on the 6-week holdout evaluation (20 Jun – 31 Jul 2015, 40,282 store-days), outperforming the baseline average by 24%.
- **Model B (Risk Classifier):** XGBoost classifier achieves **ROC-AUC 0.896**, **83.6% Accuracy**, **64.2% Precision**, and **77.8% Recall** on held-out quarterly comp performance.
- **Format Expansion Proxy:** Store Type `d` with Extended Assortment `c` in low-competition zones is the chain's #1 performing format (**+1.16 composite z-score**).

---

## 2. Platform Architecture

RetailIQ uses a decoupled, modular full-stack architecture:

```
retailiq/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app with static mount & CORS
│   │   ├── config.py            # Centralized paths and settings
│   │   ├── db/
│   │   │   ├── database.py      # SQLite connection & schema initialization
│   │   │   └── crud.py          # Persistent Action Tracker CRUD
│   │   ├── services/
│   │   │   ├── data_loader.py   # In-memory singleton loader for ML outputs
│   │   │   ├── overview_service.py
│   │   │   ├── store_service.py
│   │   │   ├── forecast_service.py
│   │   │   ├── diagnosis_service.py
│   │   │   ├── recommendation_service.py
│   │   │   ├── simulator_service.py
│   │   │   ├── consultant_service.py
│   │   │   ├── reports_service.py
│   │   │   └── quality_service.py
│   │   └── routers/             # Clean REST route handlers (/api/...)
│   ├── test_app.py              # Automated 12-suite verification test script
│   ├── requirements.txt         # Python dependencies
│   └── run.py                   # One-click backend launcher
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Collapsible Sidebar, Header, Layout
│   │   │   └── common/          # MetricCard, StatusBadge, Modal
│   │   ├── modules/             # All 10 interactive domain modules
│   │   ├── services/api.ts      # Type-safe API client
│   │   ├── types/index.ts       # Domain TypeScript interfaces
│   │   ├── App.tsx              # Module coordinator & deep-linking
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── data/                        # Safely preserved copies of models & outputs
    ├── models/                  # sales_forecaster_xgb.ubj, lookup tables, test sets
    ├── outputs/                 # summary.json, deck_data.json, store_risk_q3_2015.csv
    ├── raw/                     # store.csv, train.csv
    └── figures/                 # Consulting deck visuals & SHAP plots
```

---

## 3. Main Navigation & Modules

RetailIQ delivers all 10 modules:

1. **Executive Overview:** Answers the 5 core business questions; displays headline KPIs, 6-week daily sales vs forecast trends, performance tier cards, top revenue-at-risk stores, and prioritized recommendations.
2. **Store Performance:** Fully searchable, sortable, and filterable table across all 1,115 stores. Clicking any store opens a comprehensive audit modal with daily forecast backtests, peer benchmarks, SHAP diagnostic risk factors, and tailored operational recommendations.
3. **Sales Forecast:** Interactive model explorer with benchmark evaluation comparisons (Baseline vs v1 vs v2), store-level daily/weekly forecast curves with promo overlays, top 10 gainers and decliners, and CSV exports.
4. **Business Diagnosis:** Transparent empirical root-cause engine covering 5 deep-dive case studies (Traffic vs Basket Gap, Assortment Depth, Promo2 Inefficiency, Competitor Proximity vs Recency Paradox, Base Effects).
5. **Consulting Recommendations:** Structured strategic directives categorized by urgency (Act Now, Investigate, Opportunity, Test First, Monitor) with defensible impacts, trade-offs, implementation phases, owners, and direct "Save to Action Tracker" integration.
6. **What-If Simulator:** Interactive sensitivity interface to stress-test store cohorts under varying footfall growth (-20% to +20%), basket spend shifts, and promotional scheduling policies with net revenue delta modeling.
7. **Action Tracker:** Persistent SQLite-backed milestone governance table supporting full CRUD (Create, Edit status/outcomes, Delete) with filtering by status and priority.
8. **Reports:** Business-ready executive deliverable formatted for C-suite presentation, with instant PDF/Print layout and CSV exports.
9. **Ask Your Retail Consultant:** Deterministic NLP assistant answering natural-language queries (e.g. "What is our revenue at risk?", "Tell me about Store 817") with factual data retrieval, executive takeaways, and module deep links.
10. **Methodology and Data Quality:** Complete technical audit of dataset completeness, missing value imputation, XGBoost hyperparameters, SHAP drivers, and honest limitation disclosures.

---

## 4. How to Run Locally (Windows PowerShell)

### Prerequisites
- Python 3.10+ (with `pip`)
- Node.js v18+ (with `npm`)

### Option A: Unified Launcher (Serves Frontend & Backend on Port 8000)
The backend automatically serves the pre-built React frontend at `http://localhost:8000`:

```powershell
# Navigate to the project backend
cd "C:\Users\Madhvan Aggarwal\.gemini\antigravity\scratch\retailiq\backend"

# Run the backend server
python run.py
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

---

### Option B: Separate Development Mode (Hot Reloading)

**Terminal 1 — Backend API (Port 8000):**
```powershell
cd "C:\Users\Madhvan Aggarwal\.gemini\antigravity\scratch\retailiq\backend"
python run.py
```

**Terminal 2 — Frontend Dev Server (Port 3000):**
```powershell
cd "C:\Users\Madhvan Aggarwal\.gemini\antigravity\scratch\retailiq\frontend"
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
& "C:\Program Files\nodejs\npm.cmd" run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser. (API requests are automatically proxied to port 8000).

---

## 5. Running Automated Verification Tests

A comprehensive 12-suite automated test script validates every database operation, calculation, model accuracy, and API endpoint:

```powershell
cd "C:\Users\Madhvan Aggarwal\.gemini\antigravity\scratch\retailiq\backend"
python test_app.py
```

### Actual Test Results
```text
============================================================
RUNNING RETAILIQ VERIFICATION TEST SUITE
============================================================
[PASS] DB & DataLoader initialized (1,115 stores loaded)
[PASS] Executive Overview verified (1,115 stores, EUR 9.98M risk, 42 daily holdout points)
[PASS] Store Directory & Filters verified (306 At-Risk stores, 279 Top Tier stores)
[PASS] Store Detail Audits verified (Store 1 & Store 817 deep-dives with SHAP factors)
[PASS] Sales Forecast verified (Model A XGBoost v2: RMSE EUR 840, MAPE 8.03%, Movers identified)
[PASS] Business Diagnosis verified (5 empirical studies: Footfall gap, Assortment, Promo2, Competitor, Base effect)
[PASS] Consulting Recommendations verified (5 structured executive initiatives with phased plans)
[PASS] What-If Simulator verified (279 bottom-tier stores modeled with promo & footfall lift)
[PASS] Persistent Action Tracker CRUD verified (Create, Read, Update, Delete)
[PASS] Executive Strategy Report verified (C-Suite brief dataset generated)
[PASS] Ask Your Retail Consultant verified (Deterministic NLP queries with factual retrieval)
[PASS] Methodology & Data Quality verified (Audits, XGBoost architectures, caveats)
============================================================
ALL 12 TEST SUITES PASSED PERFECTLY (100% SUCCESS)!
============================================================
```

---

## 6. Cloud Deployment Instructions

### Frontend Deployment (Vercel)
1. Push the repository to GitHub.
2. In Vercel, import the repository and set the **Root Directory** to `frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure environment variable `VITE_API_BASE` pointing to your deployed backend URL.

### Backend Deployment (Render / Railway)
1. In Render or Railway, create a new Web Service pointing to `backend/`.
2. Start Command: `python run.py` or `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Install Command: `pip install -r requirements.txt`
4. Persistent Disk: Mount `/data` or `/app/db` to persist SQLite records, or specify a PostgreSQL `DATABASE_URL`.
#   r e a t i l i q  
 