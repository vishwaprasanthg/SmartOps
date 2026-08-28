# SmartOps — Operational Intelligence Platform

> **Predict. Optimize. Act.**  
> A high-performance, digital-twin-powered operational intelligence platform built for package logistics, hub management, and supply chain workload orchestration.

---

## 🚀 Key Modules

### 1. 📈 Chronos-2 Volume Forecasting
- **Engine**: Zero-shot probabilistic time-series forecasting powered by **Chronos-2**.
- **Capabilities**:
  - Predicts Inbound, Outbound, and Internal Inventory demand across customizable forecast horizons.
  - CSV historical data ingestion with robust validation (gap detection, column alias recognition, date integrity).
  - Supabase PostgreSQL persistence for forecast tracking and historical comparisons.

### 2. 👥 Smart Workforce Planning
- **Engine**: Deterministic operational workload-to-staffing calculator.
- **Capabilities**:
  - Computes required worker headcounts from package volumes, productivity rates (pkgs/hr), and working shifts.
  - Dynamic buffer adjustments (e.g. 10% safety margin).
  - Automatic status classification: `ADEQUATELY STAFFED`, `UNDERSTAFFED`, `EXCESS CAPACITY`.

### 3. ⚙️ Resource Optimization Engine & What-if Simulator
- **Resource Capacity Matrix**:
  - Evaluates facility resources (Dock Doors, Sortation Conveyors, Yard Tractors, Forklifts).
  - Shortage and surplus calculations with bottleneck priority ranking.
- **SMARTOPS What-if Operational Simulator**:
  - **Deterministic Natural-Language Parser**: Extracts inbound volume shifts, outbound volume spikes, and worker attendance drop-offs from natural queries.
  - **SimPy-Equivalent Digital Twin**: Simulates discrete arrival distributions, processing queues, utilization, and on-time service reliability.
  - **One Action Rule**: Delivers a single, actionable operational dispatch recommendation with expandable zone-level routing and safety constraint checks.

### 4. 📊 Operations Efficiency Dashboard
- **KPI Monitoring**:
  - Capacity Utilization, On-Time Processing Rate, Exception / Reroute Rate, and Labor Productivity.
  - Dynamic status threshold tags (`HEALTHY`, `WARNING`, `CRITICAL`).
- **Trend Intelligence**:
  - Multi-day historical operational trend lines.
  - Directional trend evaluation (`IMPROVING`, `DECLINING`, `STABLE`).

---

## 🛠️ Architecture & Tech Stack

```
React (Vite) Frontend
       │
       │ HTTP / REST
       ▼
Express.js API Backend (Node.js)
       ├── Chronos-2 Forecasting Worker (Python / PyTorch)
       ├── Discrete Event Simulation Engine (Digital Twin)
       └── Supabase PostgreSQL Database (Persistence & Analytics)
```

- **Frontend**: React 18, Vite, Lucide Icons, Recharts, UPS-inspired Design System (Vanilla CSS).
- **Backend**: Node.js, Express, REST APIs, SimPy-equivalent discrete event simulator.
- **Database**: Supabase PostgreSQL.
- **Forecasting Model**: Chronos-2 (Amazon Time-Series Foundation Model).

---

## 📦 Getting Started

### 1. Prerequisites
- **Node.js**: v18 or higher
- **Python**: v3.9+ (for Chronos-2 local worker, optional if running synthetic mode)
- **Supabase**: PostgreSQL database account

### 2. Clone the Repository
```bash
git clone https://github.com/vishwaprasanthg/SmartOps.git
cd SmartOps
```

### 3. Backend Setup
```bash
cd backend
npm install

# Create .env from the example template
cp .env.example .env
```

Configure your `backend/.env`:
```ini
PORT=5001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Run the backend server:
```bash
node server.js
# Backend runs on http://localhost:5001
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
# Frontend runs on http://localhost:3001
```

### 5. Supabase Schema Setup (Optional)
Run the SQL script located at `supabase/schema.sql` in your Supabase SQL Editor to provision:
- `facilities`
- `operational_daily_data`
- `forecast_uploads`
- `forecast_runs`
- `volume_forecasts`
- `workforce_plans`
- `resource_optimizations`
- `kpi_snapshots`

---

## 🧪 Testing

Run the full automated test suite (98 tests across 6 suites):
```bash
cd backend
npm test
```

Test coverage includes:
- `test/forecast.test.js`: 21 tests (CSV validation, Chronos-2 forecast formats)
- `test/workforce.test.js`: 19 tests (workforce gap formulas, boundary conditions)
- `test/resource.test.js`: 15 tests (resource shortages, tie-breaks, priority ranking)
- `test/operations.test.js`: 15 tests (KPI calculations, trend directions, zero-safe ratios)
- `test/supabase.test.js`: 13 tests (PostgreSQL schema CRUD, persistence layer)
- `test/whatIf.test.js`: 15 tests (NLP parsing, SimPy simulation, single action rules)

---

## 📄 License
MIT License. Developed for logistics operations management.
