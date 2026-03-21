import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import joblib
import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from datetime import datetime, timedelta
from ai_engine.bot_executor import execute_bot
from ai_engine.order_manager import save_order, get_orders
import time



# --- 1. SYSTEM PATH SETUP ---
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# --- 2. CORE IMPORTS ---
try:
    from core.data_loader import load_stock_data
    from core.indicators import apply_indicators
    from core.engine import run_simulation_with_ai
except ModuleNotFoundError:
    st.error("CRITICAL: Could not find the 'core' folder. Ensure app.py is inside the 'dashboard' folder.")
    st.stop()

# --- 3. INITIALIZE SESSION STATE ---
# Replace the SESSION STATE INITIALIZATION (around line 25) with:

if 'active_bots' not in st.session_state:
    st.session_state.active_bots = {}

    
    for ticker in list(st.session_state.active_bots.keys()):
        bot = st.session_state.active_bots[ticker]
        if 'ai_exec_price' not in bot:
        # Auto-populate missing data
            bot['ai_exec_price'] = bot.get('price', 2500) * (0.99 if 'Buy' in bot['strat'] else 1.02)
            bot['entry_date'] = bot.get('date', datetime.now().strftime('%Y-%m-%d'))
            bot['status'] = '✅ EXECUTED'

if 'data_loaded' not in st.session_state:
    st.session_state.data_loaded = False
if 'model' not in st.session_state:
    st.session_state.model = None

# --- 4. UI CONFIGURATION ---
st.set_page_config(page_title="IntelliTrail AI Terminal", layout="wide", initial_sidebar_state="collapsed")

st.markdown("""
    <style>
    .main { background-color: #0E1117; }
    .stMetric { background-color: #161A25; border-radius: 10px; padding: 15px; border: 1px solid #30363D; }
    </style>
    """, unsafe_allow_html=True)

st.title("🚀 IntelliTrail: AI Risk Management Engine")

# --- 5. GLOBAL DATA & MODEL LOADING ---
@st.cache_data
def load_global_assets():
    raw_data_path = "data/raw/"
    model_path = 'models/trained_models/nifty_model.pkl'
    
    try:
        all_files = os.listdir(raw_data_path)
        available_stocks = sorted(list(set([
            f.rsplit('_', 1)[0] for f in all_files if "_" in f
        ])))
        model = joblib.load(model_path)
        return available_stocks, model, raw_data_path
    except Exception as e:
        st.error(f"Error loading assets or model: {e}")
        st.stop()
        return [], None, ""

available_stocks, model, raw_data_path = load_global_assets()
st.session_state.model = model
st.session_state.data_loaded = True

# --- 6. MAIN LAYOUT TABS ---
tab_stats, tab_analytics, tab_portfolio = st.tabs(["📊 Stats", "📈 Analytics", "💼 Portfolio"])

# --- TAB 1: STATS (Fleet Overview) ---
# Replace STATS TAB TABLE (around line 127) with:

with tab_stats:
    st.header("Fleet Performance Summary")
    if st.session_state.active_bots:
        total_bots = len(st.session_state.active_bots)
        active_qty = sum(bot['qty'] for bot in st.session_state.active_bots.values())
        total_pnl = sum(bot.get('pnl', 0) for bot in st.session_state.active_bots.values())
        
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Total Active Bots", total_bots)
        c2.metric("Total Shares", active_qty)
        c3.metric("Total P&L", f"₹{total_pnl:,.2f}")
        c4.metric("Status", "AI LIVE")
        
        # FIXED TABLE - Safe column selection
        summary_data = []
        for ticker, bot in st.session_state.active_bots.items():
            summary_data.append({
                'Stock': ticker,
                'Qty': bot['qty'],
                'Strategy': bot['strat'][:15],
                'Entry Date': bot.get('entry_date', bot.get('date', 'N/A')),
                'AI Price': f"₹{bot.get('ai_exec_price', 0):,.0f}",
                'Status': bot['status'],
                'P&L': bot.get('pnl', 0)
            })
        
        df_summary = pd.DataFrame(summary_data)
        st.dataframe(df_summary, use_container_width=True, hide_index=True)
        st.markdown("---")
        
        orders = get_orders()

        if orders:
            df_orders = pd.DataFrame(orders)

    # Ensure columns exist safely
            if 'exit_price' not in df_orders.columns:
                df_orders['exit_price'] = 0

            if 'pnl' not in df_orders.columns:
                df_orders['pnl'] = 0

            
        else:
            st.info("No AI bot executions yet.")
    else:
        st.info("No active bots deployed.")


# --- TAB 2: ANALYTICS (Deep AI Insights) ---
# Replace the entire ANALYTICS TAB (tab_analytics) with this enhanced version:

with tab_analytics:
    st.header("🔬 AI Technical & Fundamental Analysis")
    
    selected_stock = st.selectbox("📈 Select Stock", available_stocks)

# ✅ FIXED TIMEFRAME
    timeframe = "minute"
    
    target_file = f"{selected_stock}_{timeframe}.csv"
    full_path = os.path.join(raw_data_path, target_file)
    
    # Intelligent fallback
    full_path = os.path.join(raw_data_path, f"{selected_stock}_minute.csv")

    if not os.path.exists(full_path):
        st.error(f"❌ No minute data found for {selected_stock}")
        st.stop()
        
    df = load_stock_data(full_path)
    df = apply_indicators(df)
    recent_df = df.tail(120).copy()
    
    # [Rest of your chart + metrics code exactly as before...]

        
        # === 1. ADVANCED TECHNICAL CHART ===
    fig = go.Figure()
        
        # Candlestick
    fig.add_trace(go.Candlestick(
        x=recent_df.index, open=recent_df['open'], high=recent_df['high'], 
        low=recent_df['low'], close=recent_df['close'], name='Price'
    ))
        
        # Moving Averages
    fig.add_trace(go.Scatter(x=recent_df.index, y=recent_df['sma_20'], 
                                name='SMA 20', line=dict(color='orange', width=2)))
    fig.add_trace(go.Scatter(x=recent_df.index, y=recent_df['sma_50'], 
                                name='SMA 50', line=dict(color='blue', width=2)))
        
        # Bollinger Bands (calculate)
    bb_period = 20
    recent_df['bb_middle'] = recent_df['close'].rolling(bb_period).mean()
    recent_df['bb_std'] = recent_df['close'].rolling(bb_period).std()
    recent_df['bb_upper'] = recent_df['bb_middle'] + (recent_df['bb_std'] * 2)
    recent_df['bb_lower'] = recent_df['bb_middle'] - (recent_df['bb_std'] * 2)
        
    fig.add_trace(go.Scatter(x=recent_df.index, y=recent_df['bb_upper'], 
                                name='BB Upper', line=dict(color='gray', dash='dash')))
    fig.add_trace(go.Scatter(x=recent_df.index, y=recent_df['bb_lower'], 
                                name='BB Lower', line=dict(color='gray', dash='dash')))
    fig.add_trace(go.Scatter(x=recent_df.index, y=recent_df['bb_middle'], 
                                name='BB Middle', line=dict(color='gray')))
        
    fig.update_layout(
            template="plotly_dark", title=f"{selected_stock} - Technical Analysis ({timeframe})",
            height=500, showlegend=True
        )
    st.plotly_chart(fig, use_container_width=True)
        
        # === 2. TECHNICAL SUMMARY ===
    st.subheader("📊 Technical Indicators")
    tech_cols = st.columns(4)
        
        # Trend
    current_price = recent_df['close'].iloc[-1]
    sma_trend = "🟢 Bullish" if current_price > recent_df['sma_20'].iloc[-1] > recent_df['sma_50'].iloc[-1] else "🔴 Bearish"
    tech_cols[0].metric("Trend", sma_trend)
        
        # Volatility (ATR)
    atr_pct = (recent_df['atr'].iloc[-1] / current_price) * 100
    tech_cols[1].metric("Volatility (ATR%)", f"{atr_pct:.2f}%")
        
        # RSI Overbought/Oversold
    rsi_status = "🟢 Oversold" if recent_df['rsi'].iloc[-1] < 30 else "🔴 Overbought" if recent_df['rsi'].iloc[-1] > 70 else "🟡 Neutral"
    tech_cols[2].metric("RSI Status", f"{recent_df['rsi'].iloc[-1]:.1f}", delta=rsi_status)
        
        # BB Position
    bb_position = (current_price - recent_df['bb_lower'].iloc[-1]) / (recent_df['bb_upper'].iloc[-1] - recent_df['bb_lower'].iloc[-1])
    bb_signal = "🟢 Buy Zone" if bb_position < 0.2 else "🔴 Sell Zone" if bb_position > 0.8 else "🟡 Middle"
    tech_cols[3].metric("BB Position", f"{bb_position:.1%}", delta=bb_signal)
        
        # === 3. PERFORMANCE METRICS ===
    st.subheader("📈 Performance Analysis")
    perf_cols = st.columns(3)
        
        # Returns
    total_return = ((current_price / recent_df['close'].iloc[0]) - 1) * 100
    perf_cols[0].metric("Total Return", f"{total_return:.2f}%")
        
        # Volatility (20-day)
    vol_20d = recent_df['close'].pct_change().rolling(20).std() * (252**0.5) * 100
    perf_cols[1].metric("20D Volatility", f"{vol_20d.iloc[-1]:.1f}%")
        
        # Sharpe Ratio (simplified)
    returns = recent_df['close'].pct_change().dropna()
    sharpe = (returns.mean() / returns.std()) * (252**0.5)
    perf_cols[2].metric("Sharpe Ratio", f"{sharpe:.2f}")
        
        # === 4. AI PREDICTION ===
    if st.session_state.model is not None:
            st.subheader("🤖 AI Price Prediction")
            features = pd.DataFrame([[recent_df['sma_20'].iloc[-1], recent_df['sma_50'].iloc[-1], 
                                    recent_df['rsi'].iloc[-1], recent_df['atr'].iloc[-1]]], 
                                   columns=['sma_20', 'sma_50', 'rsi', 'atr'])
            predicted = st.session_state.model.predict(features)[0]
            
            pred_cols = st.columns(2)
            pred_cols[0].metric("🎯 AI Next Close", f"₹{predicted:,.2f}")
            pred_cols[1].metric("📊 Confidence", f"{abs(predicted/current_price-1)*100:.1f}% {'↑' if predicted>current_price else '↓'}")
        
        # === 5. FUNDAMENTAL INSIGHTS (from price data) ===
    st.subheader("💹 Fundamental Proxies")
    fund_cols = st.columns(3)
    
        # Price momentum
    momentum_10d = ((current_price / recent_df['close'].iloc[-10]) - 1) * 100
    fund_cols[0].metric("10D Momentum", f"{momentum_10d:.1f}%")
        
        # Volume trend (if available)
    if 'volume' in df.columns:
            vol_trend = ((df['volume'].tail(5).mean() / df['volume'].tail(20).mean()) - 1) * 100
            fund_cols[1].metric("Volume Trend", f"{vol_trend:+.1f}%")
    else:
            fund_cols[1].metric("Volume Trend", "N/A")
        
        # Support/Resistance
    support = recent_df['low'].tail(20).min()
    resistance = recent_df['high'].tail(20).max()
    fund_cols[2].metric("S/R Levels", f"S:₹{support:,.0f} | R:₹{resistance:,.0f}")
        



# --- TAB 3: PORTFOLIO (The Command Center) ---
# Replace the entire PORTFOLIO TAB (tab_portfolio) with this enhanced version:

with tab_portfolio:
    st.subheader("🤖 AI Trading Command Center")
    st.write("ALL BOTS:", st.session_state.active_bots)

    # === DEPLOY NEW BOT ===
    st.markdown("---")
    deploy_col1, deploy_col2, deploy_col3, deploy_col4 = st.columns(4)
    with deploy_col1:
        new_ticker = st.selectbox("Stock", available_stocks, key="deploy_ticker")
    with deploy_col2:
        strategy = st.radio("Strategy", ["Auto-Scout (Buy)", "Auto-Protect (Sell)"], horizontal=True, key="deploy_strategy")
    with deploy_col3:
        quantity = st.number_input("Qty", min_value=1, max_value=1000, value=10, key="deploy_qty")
    with deploy_col4:
        sim_days = st.slider("Sim Days", 5, 60, 30, key="deploy_days")
    
    if st.button("🚀 DEPLOY AI BOT", type="primary", use_container_width=True):
        ticker_file = f"{new_ticker}_daily.csv"
        ticker_path = os.path.join(raw_data_path, ticker_file)
        st.write("🚀 BUTTON CLICKED")
        
        st.write("PATH:", ticker_path)
        st.write("EXISTS:", os.path.exists(ticker_path))
        if True:

        # ✅ STEP 1: FIX STRATEGY → ORDER TYPE
            order_type = "buy" if "Buy" in strategy else "sell"

        # ✅ STEP 2: RUN AI BOT
            result = execute_bot(
            stock=new_ticker,
            quantity=quantity,
            sim_days=sim_days,
            order_type=order_type,
            strategy=strategy
        )
           

        # ✅ STEP 3: DEBUG (TEMP — IMPORTANT)
            st.write("DEBUG RESULT:", result)

        # ✅ STEP 4: SAVE ORDER
            save_order(result)

        # ✅ STEP 5: GET AI PRICE
            ai_exec_price = result.get("price", 0)

        # 

        # ✅ STEP 7: UNIQUE BOT ID (VERY IMPORTANT)
            bot_id = f"{new_ticker}_{int(time.time())}"

        # ✅ STEP 8: STORE IN SESSION
            st.session_state.active_bots[bot_id] = {
            'qty': quantity,
            'strat': strategy,
            'entry_date': datetime.now().strftime('%Y-%m-%d'),
            'ai_exec_price': ai_exec_price,
            'pnl': result.get('pnl', 0),
            'status': '✅ EXECUTED',
            'logs': [
                f"AI Executed @ ₹{ai_exec_price:,.2f}",
                f"Simulated {sim_days} days"
            ]
        }
            
            st.write("SESSION STATE:", st.session_state.active_bots)

            st.success(f"✅ AI Bot EXECUTED {strategy} for {new_ticker}!")

            st.rerun()
    
    # === ACTIVE POSITIONS ===
    st.markdown("---")
    st.header("📊 Active Positions & AI Analysis")
    
    if st.session_state.active_bots:
        for bot_id, position in st.session_state.active_bots.items():
    
            ticker = bot_id.split("_")[0]
            with st.expander(f"📈 {ticker} | {position['strat']} | Qty: {position['qty']}", expanded=True):
                
                # === EXECUTION SUMMARY ===
                col1, col2, col3 = st.columns(3)
                col1.metric("🎯 AI Execution Price", f"₹{position['ai_exec_price']:,.2f}")
                col2.metric("📅 Entry Date", position['entry_date'])
                col3.metric("🔄 Status", position['status'])
                
                # ✅ LOAD PRICE DATA AGAIN
                file_path = os.path.join(raw_data_path, f"{ticker}_minute.csv")

                if os.path.exists(file_path):

                    df = pd.read_csv(file_path)

                    close_col = [col for col in df.columns if col.lower() == "close"][0]

                    prices = df[close_col].dropna().tolist()

                    sim_prices = prices[-30:]  # last sim days

                    entry_price = position['ai_exec_price']
                    qty = position['qty']

                    pnl = [(p - entry_price) * qty for p in sim_prices]

    # ✅ PLOT GRAPH
                    fig = go.Figure()

                    fig.add_trace(go.Scatter(
        y=pnl,
        mode='lines+markers',
        name='P&L',
        line=dict(color='#00FF88', width=3)
    ))

                    fig.update_layout(
        title="📈 AI Profit & Loss Over Time",
        xaxis_title="Time",
        yaxis_title="Profit / Loss (₹)",
        template="plotly_dark",
        height=400
    )

                    st.plotly_chart(fig, use_container_width=True)

    # ✅ CURRENT P&L
                    current_pnl = pnl[-1]
                    pnl_percent = (sim_prices[-1] - entry_price) / entry_price * 100

                    st.metric(
        "💰 Current P&L",
        f"₹{current_pnl:,.2f}",
        f"{pnl_percent:+.2f}%"
    )

                else:
                    st.warning("⚠️ No dataset found for P&L graph")
                
               
                
                # === DETAILED LOGS ===
                st.markdown("**📜 AI Execution Log**")
                for log in position['logs']:
                    st.caption(f"• {log}")
                
                # Terminate button with unique key
                import time
                ts = str(int(time.time() * 1000))
                if st.button(f"🗑️ Close Position", key=f"close_{ticker}_{ts}"):
                    del st.session_state.active_bots[ticker]
                    st.rerun()
    else:
        st.info("👆 Deploy your first AI bot above!")


# --- 7. SIDEBAR STATUS ---
with st.sidebar:
    st.header("📡 AI Engine Status")
    current_hour = datetime.now().hour
    if 9 <= current_hour <= 15:
        st.success("🟢 Market Open: LIVE Mode")
    else:
        st.success("🟢 Backtest Mode Active")
    
    st.divider()
    st.metric("Available Stocks", len(available_stocks))
    
    if st.button("🔄 Refresh All Data"):
        st.cache_data.clear()
        st.rerun()
        st.toast("Data refreshed!")

