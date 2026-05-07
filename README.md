<div align="center">

<br/>


<img src="./assets/icon.png" width="140"/>

# IntelliTrail

### Smarter AI Trading With Dynamic Risk Management

<p align="center">
  IntelliTrail is an AI-powered autonomous trading platform that combines
  machine learning, technical indicators, and dynamic trailing stop-loss strategies
  to help traders protect profits and reduce emotional decision-making.
</p>

<br/>

<p>
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/TailwindCSS-UI-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
  <img src="https://img.shields.io/badge/Machine%20Learning-scikit--learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white"/>
  <img src="https://img.shields.io/badge/Supabase-Authentication-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white"/>
</p>
<br/>


<a href="#-getting-started">Get Started</a> · <a href="#-api-reference">API Docs</a> · <a href="#-bot-strategies">Strategies</a> · <a href="#-roadmap">Roadmap</a>

<br/>

</div>

---

<p align="left">

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
- [Contributing](#-contributing)
- [License](#-license)

</p>
---

##  Features

### Core Trading Engine

| Feature                           | Description                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| 🤖 **AI Bot Deployment**          | Deploy Buy and Sell bots with a single click using ML-driven price predictions        |
| 📊 **Dynamic Trailing Stop-Loss** | AI adjusts the stop-loss multiplier in real time based on predicted price direction   |
| 🧠 **ML Prediction Engine**       | Linear Regression model trained on SMA, RSI, and ATR features to predict close prices |
| 📈 **Technical Indicators**       | Auto-computed ATR, SMA-20, SMA-50, and RSI via `pandas-ta`                            |
| 💼 **Portfolio Management**       | Run multiple bots simultaneously across different tickers                             |
| 🔄 **Backtest Mode**              | Simulate bot performance on historical minute or daily OHLCV data                     |
| 📉 **Strategy Comparison**        | Compare Static 2% trailing stop vs IntelliTrail AI side-by-side                       |
| 🗃️ **Order Management**           | Track all bot executions with entry price, exit price, and P&L                        |

### Frontend Dashboard

| Tab              | Description                                                                         |
| ---------------- | ----------------------------------------------------------------------------------- |
| 📊 **Stats**     | Fleet overview — active bots, total shares, total P&L, system status                |
| 📈 **Analytics** | Candlestick charts with Bollinger Bands, SMA overlays, RSI panel, and AI prediction |
| 💼 **Portfolio** | Deploy bots, monitor live positions, view P&L charts, terminate bots                |
| 🔐 **Auth**      | Secure user authentication powered by Supabase                                      |

---

##  Tech Stack

| Layer                | Technology                          |
| -------------------- | ----------------------------------- |
| Backend Runtime      | Python 3.10+                        |
| API Framework        | FastAPI                             |
| ML / AI              | scikit-learn (Linear Regression)    |
| Technical Indicators | pandas-ta                           |
| Data Handling        | pandas, numpy                       |
| Market Data Source   | yfinance                            |
| Model Persistence    | joblib                              |
| Frontend Framework   | React 19 + Vite                     |
| Styling              | Tailwind CSS 3                      |
| Charts               | Recharts + lightweight-charts       |
| Icons                | Lucide React                        |
| Auth & Database      | Supabase                            |
| HTTP Client          | Axios                               |
| Dev Servers          | uvicorn (backend) · Vite (frontend) |

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

##  Getting Started

### Prerequisites

Before you begin, make sure you have the following installed:

- [Python](https://python.org) 3.10+
- [Node.js](https://nodejs.org/) 18+
- A [Supabase](https://supabase.com) project (free tier works)

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/Om-Ingale/Intellitrail.git
cd Intellitrail
```

### Step 2 — Set up the Python environment

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Step 3 — Download stock data

```bash
python scripts/download_data.py
```

This downloads **2 years of daily OHLCV data** and **5 days of 1-minute data** for NIFTY 50, RELIANCE, TCS, and HDFCBANK into `data/raw/`.

### Step 4 — Train the AI model

```bash
python scripts/main.py
```

Trains a Linear Regression model on the downloaded data and saves it to `models/trained_models/nifty_model.pkl`.

### Step 5 — Start the backend

```bash
source .venv/bin/activate
uvicorn api.main:app --reload
```

Backend runs at **`http://localhost:8000`**

### Step 6 — Set up and start the frontend

```bash
cd frontend
cp .env.local.example .env.local
# Fill in your Supabase credentials (see Environment Variables below)
npm install
npm run dev
```

Frontend runs at **`http://localhost:5173`**

---

## 🔐 Environment Variables

### Backend — `.env` (project root)

```env
# Add any backend secrets here
```

### Frontend — `frontend/.env.local`

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ **Security Notice:** Never commit `.env` or `.env.local` to version control. Both files are listed in `.gitignore`. Share credentials via a password manager, not over chat or git. Never use the Supabase **service role key** in frontend code.

---

## 🧠 AI Engine

IntelliTrail's prediction engine uses a **Linear Regression** model trained on four technical indicators to forecast the next closing price.

### Training Features

| Feature  | Description                       |
| -------- | --------------------------------- |
| `sma_20` | 20-period Simple Moving Average   |
| `sma_50` | 50-period Simple Moving Average   |
| `rsi`    | 14-period Relative Strength Index |
| `atr`    | 14-period Average True Range      |

- **Target variable:** `close` (next closing price)
- **Train/test split:** 80% / 20% — no shuffle applied (time-series safe)
- **Model persistence:** saved and loaded via `joblib`

---

## 🤖 Bot Strategies

### Strategy 1 — AI Sell Bot (Dynamic Trailing Stop-Loss)

Uses the ML model's price prediction to dynamically tighten or loosen the trailing stop:

```
Bearish signal  (predicted < current price)  →  Tight stop  (1.2× ATR)
Bullish signal  (predicted > current price)  →  Loose stop  (2.0× ATR)
```

The stop-loss **ratchets upward only** — it never moves down — locking in gains as price rises.

### Strategy 2 — Static Sell Bot (Baseline)

A fixed `2.0× ATR` trailing stop-loss with no AI adjustment. Used as a benchmark to measure the AI strategy's edge.

### Strategy 3 — Buy Bot (Optimized Entry)

Targets the **daily low minus a 1% offset** (`buy_offset`) to achieve a better-than-market entry price.

### Comparison Output

```
--- BATTLE OF THE STRATEGIES ---
Static 2% Strategy:  { Final Profit: ...,  Peak Profit: ...,  Retention %: ... }
IntelliTrail AI:     { Final Profit: ...,  Peak Profit: ...,  Retention %: ... }
```

---

##  API Reference

**Base URL:** `http://localhost:8000/api`

| Method | Endpoint      | Description                          |
| ------ | ------------- | ------------------------------------ |
| `GET`  | `/`           | Health check — returns system status |
| `POST` | `/deploy-bot` | Deploy a new AI trading bot          |
| `GET`  | `/orders`     | Fetch all executed orders            |

---

### `POST /deploy-bot`

**Request Body**

```json
{
  "stock": "NIFTY 50",
  "quantity": 10,
  "sim_days": 30,
  "order_type": "buy",
  "strategy": "Auto-Scout Buy"
}
```

**Response**

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

Market data is downloaded via `yfinance` using `scripts/download_data.py`.

### Supported Tickers

| Name     | Yahoo Finance Symbol |
| -------- | -------------------- |
| NIFTY 50 | `^NSEI`              |
| RELIANCE | `RELIANCE.NS`        |
| TCS      | `TCS.NS`             |
| HDFCBANK | `HDFCBANK.NS`        |

### Output Files

| File                         | Content                       |
| ---------------------------- | ----------------------------- |
| `data/raw/{NAME}_daily.csv`  | 2 years of daily OHLCV data   |
| `data/raw/{NAME}_minute.csv` | 5 days of 1-minute OHLCV data |

`data_loader.py` standardizes all column names to lowercase and automatically detects and sets the date/timestamp column as the DataFrame index.

---

## 💼 Portfolio Manager

`PortfolioManager` (`core/portfolio_manager.py`) lets you run multiple bots across different assets simultaneously.

```python
pm = PortfolioManager()
pm.add_bot("RELIANCE", strategy_type="SELL", target_price=2950.00)
pm.add_bot("TCS",      strategy_type="BUY",  target_price=3800.00)
results = pm.run_all(data_dict, ai_model)
```

`process_portfolio()` in `manager_logic.py` handles real-time multi-asset simulation by loading each ticker's minute CSV, applying technical indicators, and routing each bot to the correct strategy engine.

---

##  Frontend

The React + Vite + Tailwind frontend provides a three-tab dashboard:

###  Stats Tab — Fleet Overview

- Total active bots, total shares held, aggregate P&L
- Full fleet table: ticker, quantity, strategy, entry price, status, individual P&L

###  Analytics Tab — Deep AI Insights

- Candlestick chart with SMA-20, SMA-50, and Bollinger Bands overlays
- Technical indicators: Trend (Bullish/Bearish), Volatility (ATR%), RSI status, Bollinger Band position
- Performance metrics: Total Return %, 20-Day Volatility, Sharpe Ratio
- AI Prediction panel: next close price + confidence score
- Fundamental proxies: 10-day momentum, volume trend, support & resistance levels

###  Portfolio Tab — Command Center

- Deploy bot form: stock selector, strategy (Buy/Sell), quantity, simulation days
- Active positions: execution summary, live P&L chart, execution log, terminate button

---

##  Roadmap

### ✅ Completed

- [x] Linear Regression AI model (SMA + RSI + ATR features)
- [x] AI Sell Bot with Dynamic Trailing Stop-Loss
- [x] Buy Bot with optimized entry logic
- [x] Static vs AI strategy comparison engine
- [x] yfinance data downloader (daily + minute)
- [x] Technical indicators (ATR, SMA, RSI) via pandas-ta
- [x] FastAPI backend with CORS
- [x] React + Vite + Tailwind frontend
- [x] Supabase authentication
- [x] Portfolio manager (multi-bot support)

### 🔜 Coming Soon

- [ ] Supabase DB integration for persistent order storage
- [ ] Live market data feed via WebSocket
- [ ] Price alert notifications
- [ ] Advanced ML models (Random Forest, LSTM)
- [ ] Cloud deployment (Railway / Vercel)
- [ ] Mobile-responsive dashboard
- [ ] User profile with full bot history

---

## 🤝 Contributing

Contributions are welcome! For major changes, please open an issue first to discuss what you'd like to change. For smaller fixes and improvements, feel free to open a pull request directly.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License** — free to use, modify, and distribute.

---

<div align="center">
  <sub>Built with ❤️ for Smarter Trading · All Rights Reserved By IntelliTrail © 2025</sub>
</div>
