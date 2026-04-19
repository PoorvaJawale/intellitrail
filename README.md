# 📈 IntelliTrail

> An **AI-powered trading bot platform** that deploys intelligent Buy & Sell bots with dynamic trailing stop-loss logic — built with Python, FastAPI, React, Vite, Tailwind CSS, and Supabase.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%2FDB-3ECF8E?style=flat&logo=supabase&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-F7931E?style=flat&logo=scikit-learn&logoColor=white)

---

## 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [AI Engine](#-ai-engine)
- [Bot Strategies](#-bot-strategies)
- [API Reference](#-api-reference)
- [Data Pipeline](#-data-pipeline)
- [Portfolio Manager](#-portfolio-manager)
- [Frontend](#-frontend)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## ✨ Features

### Core

- 🤖 **AI Bot Deployment** — Deploy Buy and Sell bots with a single click using ML-driven predictions
- 📊 **Dynamic Trailing Stop-Loss** — AI adjusts the stop-loss multiplier in real time based on predicted price direction
- 🧠 **ML Prediction Engine** — Linear Regression model trained on SMA, RSI, and ATR features to predict close prices
- 📈 **Technical Indicators** — Auto-computed ATR, SMA-20, SMA-50, RSI via `pandas-ta`
- 💼 **Portfolio Management** — Run multiple bots simultaneously across different tickers
- 🔄 **Backtest Mode** — Simulate bot performance on historical minute/daily data
- 📉 **Strategy Comparison** — Compare Static 2% trailing stop vs IntelliTrail AI side-by-side
- 🗃️ **Order Management** — Track and store all bot executions with entry price, exit price, and P&L

### Frontend Dashboard

- 📊 **Stats Tab** — Fleet overview: active bots, total shares, total P&L, system status
- 📈 **Analytics Tab** — Candlestick charts, Bollinger Bands, SMA overlays, RSI, AI prediction panel
- 💼 **Portfolio Tab** — Deploy bots, monitor positions, view P&L charts, terminate bots
- 🔐 **Supabase Auth** — Secure user authentication with environment-based credentials

---

## 🧰 Tech Stack

| Layer              | Technology                         |
| ------------------ | ---------------------------------- |
| Backend Runtime    | Python 3.10+                       |
| API Framework      | FastAPI                            |
| ML / AI            | scikit-learn (Linear Regression)   |
| Indicators         | pandas-ta                          |
| Data Handling      | pandas, numpy                      |
| Data Source        | yfinance                           |
| Model Persistence  | joblib                             |
| Frontend Framework | React 19 + Vite                    |
| Styling            | Tailwind CSS 3                     |
| Charts             | Recharts + lightweight-charts      |
| Icons              | Lucide React                       |
| Auth / DB          | Supabase                           |
| HTTP Client        | Axios                              |
| Dev Server         | uvicorn (backend), Vite (frontend) |

---

## 📁 Project Structure

```
intellitrail/
├── api/
│   ├── main.py                     # FastAPI entry point + CORS config
│   ├── routes.py                   # Main API route definitions
│   └── __init__.py
│
├── routes/
│   ├── bot_routes.py               # /deploy-bot endpoint (Flask blueprint — legacy)
│   └── __init__.py
│
├── ai_engine/
│   ├── bot_executor.py             # Core bot logic — entry/exit price + P&L
│   ├── prediction_engine.py        # Loads CSV data and returns predicted prices
│   ├── order_manager.py            # Save and retrieve executed orders
│   └── __init__.py
│
├── core/
│   ├── engine.py                   # Simulation engines (static, AI sell, buy bot)
│   ├── indicators.py               # Applies ATR, SMA, RSI via pandas-ta
│   ├── data_loader.py              # Loads and standardizes CSV stock data
│   ├── comparison.py               # Calculates Final Profit, Peak Profit, Retention %
│   ├── portfolio_manager.py        # PortfolioManager class — multi-bot runner
│   ├── manager_logic.py            # process_portfolio() for real-time multi-asset sim
│   └── __init__.py
│
├── models/
│   ├── train_model.py              # Trains LinearRegression on SMA/RSI/ATR features
│   └── trained_models/
│       └── nifty_model.pkl         # Pre-trained model artifact
│
├── data/
│   └── raw/                        # Downloaded CSV files (daily + minute)
│       ├── NIFTY 50_daily.csv
│       ├── NIFTY 50_minute.csv
│       └── ...
│
├── scripts/
│   ├── download_data.py            # Downloads daily + minute data via yfinance
│   └── main.py                     # CLI entry — train model + run simulation
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.local                  # Supabase credentials (never commit)
│   ├── .env.local.example
│   └── src/
│       └── main.jsx                # React app entry point
│
├── requirements.txt
├── .gitignore
├── .env                            # Backend env variables (never commit)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Python](https://python.org) 3.10+
- [Node.js](https://nodejs.org/) 18+
- [Supabase](https://supabase.com) project (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/Om-Ingale/Intellitrail.git
cd Intellitrail
```

### 2. Set up Python environment

```bash
python -m venv .venv
source .venv/bin/activate        # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Download stock data

```bash
python scripts/download_data.py
```

This downloads 2 years of daily data and 5 days of minute-level data for NIFTY 50, RELIANCE, TCS, and HDFCBANK into `data/raw/`.

### 4. Train the AI model

```bash
python scripts/main.py
```

This trains a Linear Regression model and saves it to `models/trained_models/nifty_model.pkl`.

### 5. Start the backend

```bash
source .venv/bin/activate
uvicorn api.main:app --reload
```

Backend runs at `http://localhost:8000`.

### 6. Set up the frontend

```bash
cd frontend
cp .env.local.example .env.local
# Fill in your Supabase credentials (see below)
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 🔐 Environment Variables

### Backend (`.env` in root)

```env
# Add any backend secrets here
```

### Frontend (`frontend/.env.local`)

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ Never commit `.env` or `.env.local`. Both are in `.gitignore`. Share keys via a password manager, not in chat or git.
> Never use the Supabase service role key in frontend code.

---

## 🧠 AI Engine

The AI engine uses a **Linear Regression** model trained on four technical features to predict the next close price.

**Training Features:**

| Feature  | Description                       |
| -------- | --------------------------------- |
| `sma_20` | 20-period Simple Moving Average   |
| `sma_50` | 50-period Simple Moving Average   |
| `rsi`    | 14-period Relative Strength Index |
| `atr`    | 14-period Average True Range      |

**Target:** `close` (next closing price)

**Training split:** 80% train / 20% test (no shuffle — time-series safe)

The trained model is saved via `joblib` and loaded at runtime by the simulation engine.

---

## 🤖 Bot Strategies

### 1. AI Sell Bot — Protect Profits (Dynamic TSLO)

Uses the AI model to dynamically tighten or loosen the trailing stop-loss:

```
Bearish prediction (predicted < current)  →  Tight stop  (1.2× ATR)
Bullish prediction (predicted > current)  →  Loose stop  (2.0× ATR)
```

The stop-loss only moves **up** (ratchets), never down — locking in gains as price rises.

### 2. Static Sell Bot — Baseline Comparison

A fixed `2.0× ATR` trailing stop-loss with no AI adjustment. Used as a benchmark against the AI strategy.

### 3. Buy Bot — Optimized Entry

Targets the daily low minus a small offset (`1% buy_offset`) to achieve a better-than-market entry price.

### Strategy Comparison Output

```
--- BATTLE OF THE STRATEGIES ---
Static 2% Strategy: {'Final Profit': ..., 'Peak Profit': ..., 'Retention %': ...}
IntelliTrail AI:    {'Final Profit': ..., 'Peak Profit': ..., 'Retention %': ...}
```

---

## 📡 API Reference

Base URL: `http://localhost:8000/api`

| Method | Endpoint      | Description                  |
| ------ | ------------- | ---------------------------- |
| GET    | `/`           | Health check — system status |
| POST   | `/deploy-bot` | Deploy a new AI bot          |
| GET    | `/orders`     | Fetch all executed orders    |

### POST `/deploy-bot` — Request Body

```json
{
  "stock": "NIFTY 50",
  "quantity": 10,
  "sim_days": 30,
  "order_type": "buy",
  "strategy": "Auto-Scout Buy"
}
```

### POST `/deploy-bot` — Response

```json
{
  "stock": "NIFTY 50",
  "quantity": 10,
  "price": 22150.5,
  "exit_price": 22480.75,
  "pnl": 3302.5,
  "type": "buy",
  "strategy": "Auto-Scout Buy",
  "sim_days": 30,
  "status": "executed"
}
```

---

## 📥 Data Pipeline

Data is downloaded using `yfinance` via `scripts/download_data.py`.

**Supported Tickers:**

| Name     | Yahoo Finance Symbol |
| -------- | -------------------- |
| NIFTY 50 | `^NSEI`              |
| RELIANCE | `RELIANCE.NS`        |
| TCS      | `TCS.NS`             |
| HDFCBANK | `HDFCBANK.NS`        |

**Files generated:**

- `data/raw/{NAME}_daily.csv` — 2 years of daily OHLCV data
- `data/raw/{NAME}_minute.csv` — 5 days of 1-minute OHLCV data

The `data_loader.py` standardizes column names to lowercase and automatically detects and sets the date/timestamp column as the index.

---

## 💼 Portfolio Manager

`PortfolioManager` (`core/portfolio_manager.py`) manages multiple simultaneous bots:

```python
pm = PortfolioManager()
pm.add_bot("RELIANCE", strategy_type="SELL", target_price=2950.00)
pm.add_bot("TCS", strategy_type="BUY", target_price=3800.00)
results = pm.run_all(data_dict, ai_model)
```

`process_portfolio()` in `manager_logic.py` handles real-time multi-asset simulation by loading each ticker's minute CSV, applying indicators, and routing to the correct bot strategy.

---

## 🖥️ Frontend

The React frontend (Vite + Tailwind) mirrors the original Streamlit dashboard with three main tabs:

### 📊 Stats Tab — Fleet Overview

- Total active bots, total shares, total P&L
- Full fleet summary table with ticker, quantity, strategy, entry price, status, P&L

### 📈 Analytics Tab — Deep AI Insights

- Candlestick chart with SMA-20, SMA-50, Bollinger Bands overlays
- Technical indicators: Trend (Bullish/Bearish), Volatility (ATR%), RSI status, BB position
- Performance metrics: Total Return %, 20-Day Volatility, Sharpe Ratio
- AI Prediction panel: next close price + confidence score
- Fundamental proxies: 10-day momentum, volume trend, support & resistance levels

### 💼 Portfolio Tab — Command Center

- Deploy bot form: stock selector, strategy (Buy/Sell), quantity, simulation days
- Active positions: execution summary, live P&L chart, execution log, terminate button

---

## 🔮 Roadmap

- [x] 🧠 Linear Regression AI model (SMA + RSI + ATR features)
- [x] 🤖 AI Sell Bot with Dynamic Trailing Stop-Loss
- [x] 🛒 Buy Bot with optimized entry logic
- [x] 📉 Static vs AI strategy comparison engine
- [x] 📥 yfinance data downloader (daily + minute)
- [x] 🔧 Technical indicators (ATR, SMA, RSI) via pandas-ta
- [x] ⚡ FastAPI backend with CORS
- [x] ⚛️ React + Vite + Tailwind frontend
- [x] 🔐 Supabase authentication
- [x] 💼 Portfolio manager (multi-bot support)
- [ ] 🗄️ Supabase DB integration for persistent order storage
- [ ] 📡 Live market data feed (WebSocket)
- [ ] 🔔 Price alert notifications
- [ ] 📊 Advanced ML models (Random Forest, LSTM)
- [ ] 🌐 Deploy to cloud (Railway / Vercel)
- [ ] 📲 Mobile-responsive dashboard
- [ ] 👤 User profile with bot history

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<p align="center">Built with ❤️ for smarter trading · All Rights Reserved By IntelliTrail © 2025</p>
