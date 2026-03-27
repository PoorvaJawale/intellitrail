# Old Frontend Analysis: IntelliTrail AI Terminal

This document outlines the structure, features, and functionalities of the original Streamlit frontend (`dashboard/app.py`). This will serve as a blueprint for building the new professional React + FastAPI frontend.

## 1. Overall Structure & Navigation
The application is a single-page dashboard with a sidebar and three main tabs:
- **Sidebar**: Global controls and system status.
- **Tab 1: 📊 Stats**: High-level overview of the entire AI bot fleet.
- **Tab 2: 📈 Analytics**: Deep-dive technical analysis and AI predictions for specific stocks.
- **Tab 3: 💼 Portfolio**: The command center for deploying and managing active AI bots.

## 2. Core Features by Section

### Sidebar (Global Controls)
- **AI Engine Status**: Displays whether the market is open (LIVE Mode) or closed (Backtest Mode) based on the current hour (9 AM - 3 PM).
- **Available Stocks**: Shows the total count of available stock datasets.
- **Refresh Data Button**: A button to clear the cache and reload the application data.

### Tab 1: Stats (Fleet Overview)
Provides a high-level summary of all active AI bots.
- **Global Metrics Panel**:
  - Total Active Bots
  - Total Shares (sum of quantities across all bots)
  - Total P&L (sum of P&L across all bots)
  - System Status (always shows "AI LIVE" when bots are active)
- **Fleet Summary Table**: Displays a grid of all active bots with columns:
  - Stock Ticker
  - Quantity
  - Strategy (Buy/Sell)
  - Entry Date
  - AI Execution Price
  - Status
  - P&L

### Tab 2: Analytics (Deep AI Insights)
Provides detailed charts and metrics for a selected stock.
- **Stock Selector**: Dropdown to choose which stock to analyze.
- **Advanced Technical Chart (Plotly)**:
  - Candlestick chart of recent minute data (last 120 minutes/periods).
  - Overlays: SMA 20, SMA 50.
  - Overlays: Bollinger Bands (Upper, Lower, Middle).
- **Technical Indicators Summary**:
  - Trend: Bullish/Bearish based on SMA 20 vs SMA 50.
  - Volatility: ATR %.
  - RSI Status: Overbought, Oversold, or Neutral.
  - Bollinger Band Position: Buy Zone, Sell Zone, or Middle.
- **Performance Metrics**:
  - Total Return (%).
  - 20-Day Volatility (Annualized).
  - Sharpe Ratio (Simplified).
- **AI Prediction Panel**:
  - Predicts the next close price using the trained Machine Learning model.
  - Displays Confidence metric based on the predicted vs current price.
- **Fundamental Proxies**:
  - 10-Day Price Momentum (%).
  - Volume Trend (+/- %).
  - Support & Resistance Levels (calculated from recent highs/lows).

### Tab 3: Portfolio (Command Center)
The interface for deploying new bots and monitoring active positions.
- **Deploy New Bot Form**:
  - Stock Dropdown selector.
  - Strategy Radio Button (Auto-Scout Buy / Auto-Protect Sell).
  - Quantity Number Input.
  - Simulation Days Slider (5 to 60 days).
  - "Deploy AI Bot" Action Button.
  - *Action*: When clicked, the backend `execute_bot` function runs, the order is saved (`save_order`), and the bot is added to the active session state.
- **Active Positions List**:
  - Displays a list of expandable cards/rows for each active bot.
  - **Execution Summary**: Shows AI Execution Price, Entry Date, and Status.
  - **P&L Chart**: A line chart showing the simulated P&L sequence over time for that specific bot entry.
  - **Current P&L Metric**: Shows the absolute profit/loss and percentage.
  - **Execution Log**: A list of log messages detailing what the bot did.
  - **Terminate Button**: A button to close the position and remove the bot from the active list.

## 3. Data Flow & Integration Points
The new frontend will need API endpoints to replicate this behavior:
- **Data Loading**: Needs to fetch available stock tickers and raw CSV data.
- **Bot Execution**: Needs an endpoint to trigger `bot_executor.execute_bot()`.
- **Order Management**: Needs endpoints to fetch order history and active positions (`order_manager.get_orders()`).
- **AI Prediction**: Needs an endpoint to pass current features (SMA, RSI, ATR) to the trained scikit-learn model and return a prediction.
- **State Management**: The original app used Streamlit's `st.session_state.active_bots` to track running bots. The new system will either need a database or a persistent backend state dictionary to track active bots across API calls.
