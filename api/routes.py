import os
import io
import joblib
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import time as _time

from ai_engine.bot_executor import execute_bot
from ai_engine.order_manager import save_order, get_orders
from core.data_loader import load_stock_data
from core.indicators import apply_indicators

router = APIRouter()

RAW_DATA_PATH = "data/raw/"
MODEL_PATH    = "models/trained_models/nifty_model.pkl"

active_bots_db: Dict[str, Any] = {}
pinned_stocks = {"RELIANCE", "TCS", "HDFCBANK", "INFY"}  # Default pinned stocks

# ── Timeframe priority for each ticker (used by /stock and /analysis) ──
# If a ticker has only minute data, we fall back to minute.
# Supported file suffixes: minute, hourly, daily, weekly, monthly, yearly
TIMEFRAME_FILE = {
    "minute":  "minute",
    "hourly":  "hourly",
    "1h":      "hourly",
    "4h":      "hourly",
    "daily":   "daily",
    "1d":      "daily",
    "weekly":  "weekly",
    "1w":      "weekly",
    "monthly": "monthly",
}


def _all_tickers() -> list[str]:
    """Return sorted list of unique tickers from data/raw/, ignoring helper files."""
    try:
        files = os.listdir(RAW_DATA_PATH)
    except Exception:
        return []

    seen, result = set(), []
    for f in sorted(files):
        if not f.endswith(".csv"):
            continue
        # Split on the LAST underscore to get suffix (minute/daily/hourly/etc.)
        parts = f[:-4].rsplit("_", 1)
        if len(parts) != 2:
            continue  # e.g. NIFTY_50.csv — skip
        ticker, suffix = parts[0], parts[1].lower()
        if suffix not in ("minute", "daily", "hourly", "weekly", "monthly", "yearly"):
            continue
        if ticker not in seen:
            seen.add(ticker)
            result.append(ticker)
    return result


def _best_file(ticker: str, prefer: str = "minute") -> str | None:
    """Return the best available file path for the given ticker and preferred timeframe."""
    suffix = TIMEFRAME_FILE.get(prefer.lower(), "minute")
    # Try preferred, then fall back in order
    for s in [suffix, "minute", "daily", "hourly"]:
        fp = os.path.join(RAW_DATA_PATH, f"{ticker}_{s}.csv")
        if os.path.exists(fp):
            return fp
    return None


def _tail_read(file_path: str, n_rows: int = 500) -> pd.DataFrame | None:
    """Efficiently read only the last n rows of a large CSV without loading the whole file."""
    try:
        # Read header
        with open(file_path, "r") as fh:
            header = fh.readline()

        # Estimate bytes per row (sample first 200 lines)
        with open(file_path, "r") as fh:
            sample = "".join(fh.readline() for _ in range(201))
        lines_sample = sample.count("\n")
        if lines_sample < 2:
            return pd.read_csv(file_path)

        sample_bytes = len(sample.encode())
        avg_bytes_per_row = sample_bytes / lines_sample

        file_size = os.path.getsize(file_path)
        seek_pos  = max(0, int(file_size - avg_bytes_per_row * (n_rows + 5)))

        with open(file_path, "rb") as fh:
            fh.seek(seek_pos)
            tail_bytes = fh.read()

        # Combine header with the tail chunk
        lines = tail_bytes.decode(errors="replace").split("\n")
        tail_csv = header + "\n".join(lines[1:] if seek_pos > 0 else lines)
        df = pd.read_csv(io.StringIO(tail_csv))
        df.columns = [c.lower() for c in df.columns]
        return df.tail(n_rows)
    except Exception:
        return None


def _sanitize(row_dict: dict) -> dict:
    import math
    clean = {}
    for k, v in row_dict.items():
        if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
            clean[k] = None
        elif hasattr(v, "isoformat"):
            clean[k] = v.isoformat()
        elif isinstance(v, (np.integer,)):
            clean[k] = int(v)
        elif isinstance(v, (np.floating,)):
            clean[k] = None if np.isnan(v) else float(v)
        else:
            clean[k] = v
    return clean


class BotDeployRequest(BaseModel):
    ticker:   str
    strategy: str
    quantity: int
    sim_days: int


# ── WATCHLIST (fast: reads only last 2 rows per file) ─────────────────────────
@router.get("/watchlist")
def get_watchlist():
    tickers = _all_tickers()
    result  = []
    for ticker in tickers:
        try:
            fp = _best_file(ticker, "minute")
            if not fp:
                continue
            # Fast tail read — just last 2 rows
            tail = _tail_read(fp, n_rows=3)
            if tail is None or len(tail) < 2:
                continue
            # Normalise column names
            tail.columns = [c.lower() for c in tail.columns]
            close_col = next((c for c in tail.columns if c == "close"), None)
            if not close_col:
                continue
            price = float(tail["close"].iloc[-1])
            prev  = float(tail["close"].iloc[-2])
            change = price - prev
            pct    = (change / prev * 100) if prev else 0
            result.append({
                "ticker": ticker,
                "price":  round(price, 2),
                "change": round(change, 2),
                "pct":    round(pct, 3),
                "trend":  "up" if change >= 0 else "down",
                "is_pinned": ticker in pinned_stocks,
            })
        except Exception:
            pass
    return result

# ── TOGGLE PIN ────────────────────────────────────────────────────────────────
@router.post("/watchlist/{ticker}/pin")
def toggle_pin(ticker: str):
    if ticker in pinned_stocks:
        pinned_stocks.remove(ticker)
        pinned = False
    else:
        pinned_stocks.add(ticker)
        pinned = True
    return {"status": "success", "ticker": ticker, "is_pinned": pinned}


# ── STATUS ─────────────────────────────────────────────────────────────────────
@router.get("/status")
def get_system_status():
    from datetime import datetime
    tickers = _all_tickers()
    hour    = datetime.now().hour
    return {
        "status":           "online",
        "mode":             "LIVE" if 9 <= hour <= 15 else "Backtest",
        "available_stocks": tickers,
        "count":            len(tickers),
    }


# ── STOCK OHLCV + indicators ──────────────────────────────────────────────────
@router.get("/stock/{ticker}")
def get_stock_data(ticker: str, timeframe: str = "minute", limit: int = 200):
    try:
        fp = _best_file(ticker, timeframe)
        if not fp:
            raise HTTPException(status_code=404, detail=f"No dataset for {ticker}")

        if limit > 0:
            df_raw = _tail_read(fp, n_rows=limit + 60)  # extra for indicator warm-up
            if df_raw is None:
                raise HTTPException(status_code=500, detail="Could not read file")
        else:
            df_raw = pd.read_csv(fp)
            df_raw.columns = [c.lower() for c in df_raw.columns]

        # parse date index
        date_col = next((c for c in df_raw.columns if c in ("date", "timestamp", "datetime", "time")), None)
        if date_col:
            df_raw[date_col] = pd.to_datetime(df_raw[date_col], errors="coerce")
            df_raw = df_raw.set_index(date_col)

        df = apply_indicators(df_raw)

        # Bollinger Bands
        df["bb_middle"] = df["close"].rolling(20).mean()
        df["bb_std"]    = df["close"].rolling(20).std()
        df["bb_upper"]  = df["bb_middle"] + df["bb_std"] * 2
        df["bb_lower"]  = df["bb_middle"] - df["bb_std"] * 2

        recent = df.tail(limit).copy() if limit > 0 else df.copy()
        chart_data = [_sanitize(row) for _, row in recent.reset_index().iterrows()]

        cur = float(recent["close"].iloc[-1])

        # AI prediction
        pred = cur
        try:
            model = joblib.load(MODEL_PATH)
            feats = pd.DataFrame(
                [[recent["sma_20"].iloc[-1], recent["sma_50"].iloc[-1],
                  recent["rsi"].iloc[-1],    recent["atr"].iloc[-1]]],
                columns=["sma_20", "sma_50", "rsi", "atr"]
            )
            pred = float(model.predict(feats)[0])
        except Exception:
            pass

        metrics = {
            "current_price":      cur,
            "trend":              "Bullish" if float(recent["sma_20"].iloc[-1]) > float(recent["sma_50"].iloc[-1]) else "Bearish",
            "volatility_atr_pct": float(recent["atr"].iloc[-1] / cur * 100),
            "rsi":                round(float(recent["rsi"].iloc[-1]), 2),
            "prediction":         round(pred, 2),
            "support":            float(recent["low"].tail(20).min()),
            "resistance":         float(recent["high"].tail(20).max()),
            "sma_20":             float(recent["sma_20"].iloc[-1]),
            "sma_50":             float(recent["sma_50"].iloc[-1]),
        }
        return {"ticker": ticker, "metrics": metrics, "chart_data": chart_data}
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ── FULL TECHNICAL + AI ANALYSIS ──────────────────────────────────────────────
@router.get("/analysis/{ticker}")
def get_full_analysis(ticker: str):
    try:
        fp = _best_file(ticker, "minute")
        if not fp:
            raise HTTPException(status_code=404, detail=f"No data for {ticker}")

        df_raw = _tail_read(fp, n_rows=300)
        if df_raw is None:
            raise HTTPException(status_code=500, detail="Could not read file")

        date_col = next((c for c in df_raw.columns if c in ("date", "timestamp", "datetime", "time")), None)
        if date_col:
            df_raw[date_col] = pd.to_datetime(df_raw[date_col], errors="coerce")
            df_raw = df_raw.set_index(date_col)

        df = apply_indicators(df_raw)
        df["bb_middle"] = df["close"].rolling(20).mean()
        df["bb_std"]    = df["close"].rolling(20).std()
        df["bb_upper"]  = df["bb_middle"] + df["bb_std"] * 2
        df["bb_lower"]  = df["bb_middle"] - df["bb_std"] * 2

        recent = df.tail(120).copy()
        cur    = float(recent["close"].iloc[-1])
        first  = float(recent["close"].iloc[0])

        rsi = float(recent["rsi"].iloc[-1])
        rsi_label  = "OVERSOLD" if rsi < 30 else "OVERBOUGHT" if rsi > 70 else "NEUTRAL"
        rsi_signal = "Oversold — potential bounce" if rsi < 30 else "Overbought — potential pullback" if rsi > 70 else "Neutral zone"

        bb_upper = float(recent["bb_upper"].iloc[-1])
        bb_lower = float(recent["bb_lower"].iloc[-1])
        bb_range = bb_upper - bb_lower or 1
        bb_pos   = (cur - bb_lower) / bb_range
        bb_signal = "Buy Zone — near lower band" if bb_pos < 0.2 else "Sell Zone — near upper band" if bb_pos > 0.8 else "Middle — no edge"

        sma20 = float(recent["sma_20"].iloc[-1])
        sma50 = float(recent["sma_50"].iloc[-1])
        trend = "Bullish" if sma20 > sma50 else "Bearish"

        atr     = float(recent["atr"].iloc[-1])
        atr_pct = atr / cur * 100

        returns   = recent["close"].pct_change().dropna()
        total_ret = (cur / first - 1) * 100
        vol_20d   = float(returns.rolling(20).std().iloc[-1] * (252 ** 0.5) * 100) if len(returns) >= 20 else 0
        sharpe    = float(returns.mean() / returns.std() * (252 ** 0.5)) if returns.std() != 0 else 0
        mom_10d   = float((cur / recent["close"].iloc[-10] - 1) * 100) if len(recent) >= 10 else 0

        vol_trend = None
        if "volume" in df.columns and df["volume"].sum() > 0:
            v5  = float(df["volume"].tail(5).mean())
            v20 = float(df["volume"].tail(20).mean())
            vol_trend = round((v5 / v20 - 1) * 100, 2) if v20 else None

        support    = float(recent["low"].tail(20).min())
        resistance = float(recent["high"].tail(20).max())

        pred = cur
        confidence = 0.0
        try:
            model = joblib.load(MODEL_PATH)
            feats = pd.DataFrame([[sma20, sma50, rsi, atr]], columns=["sma_20", "sma_50", "rsi", "atr"])
            pred       = float(model.predict(feats)[0])
            confidence = abs(pred / cur - 1) * 100
        except Exception:
            pass

        return {
            "ticker":        ticker,
            "current_price": cur,
            "technical": {
                "trend":        trend,
                "trend_signal": f"SMA20 {'above' if trend == 'Bullish' else 'below'} SMA50 — {'uptrend' if trend == 'Bullish' else 'downtrend'}",
                "sma_20":       round(sma20, 2),
                "sma_50":       round(sma50, 2),
                "rsi":          round(rsi, 2),
                "rsi_label":    rsi_label,
                "rsi_signal":   rsi_signal,
                "atr":          round(atr, 4),
                "atr_pct":      round(atr_pct, 3),
                "bb_upper":     round(bb_upper, 2),
                "bb_lower":     round(bb_lower, 2),
                "bb_position":  round(bb_pos, 3),
                "bb_signal":    bb_signal,
            },
            "performance": {
                "total_return":   round(total_ret, 3),
                "volatility_20d": round(vol_20d, 2),
                "sharpe_ratio":   round(sharpe, 3),
            },
            "fundamental": {
                "momentum_10d": round(mom_10d, 2),
                "volume_trend": vol_trend,
                "support":      round(support, 2),
                "resistance":   round(resistance, 2),
            },
            "ai": {
                "prediction":  round(pred, 2),
                "confidence":  round(confidence, 2),
                "direction":   "UP" if pred > cur else "DOWN",
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ── P&L TIME SERIES ───────────────────────────────────────────────────────────
@router.get("/pnl/{ticker}")
def get_pnl_series(ticker: str, entry_price: float, quantity: int, sim_days: int = 30):
    try:
        fp = _best_file(ticker, "minute")
        if not fp:
            raise HTTPException(status_code=404, detail="No data")

        tail = _tail_read(fp, n_rows=sim_days + 10)
        if tail is None:
            raise HTTPException(status_code=500, detail="Read error")

        date_col  = next((c for c in tail.columns if c in ("date", "timestamp", "datetime", "time")), None)
        close_col = next((c for c in tail.columns if c.lower() == "close"), None)
        if not close_col:
            raise HTTPException(status_code=400, detail="No close column")

        tail = tail.tail(sim_days)
        prices = tail[close_col].dropna().tolist()
        times  = tail[date_col].tolist() if date_col else list(range(len(prices)))

        series      = [{"time": str(t), "pnl": round((p - entry_price) * quantity, 2)} for t, p in zip(times, prices)]
        current_pnl = (prices[-1] - entry_price) * quantity if prices else 0
        pnl_pct     = (prices[-1] - entry_price) / entry_price * 100 if prices and entry_price else 0

        return {"series": series, "current_pnl": round(current_pnl, 2), "pnl_pct": round(pnl_pct, 3)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── PORTFOLIO ─────────────────────────────────────────────────────────────────
@router.get("/portfolio")
def get_portfolio():
    try:
        total_bots = len(active_bots_db)
        active_qty = sum(b["qty"] for b in active_bots_db.values())
        total_pnl  = sum(b.get("pnl", 0) for b in active_bots_db.values())
        summary    = {
            "total_bots": total_bots,
            "total_qty":  active_qty,
            "total_pnl":  total_pnl,
            "status":     "AI LIVE" if total_bots > 0 else "STANDBY",
        }
        bots_list = [dict(b, id=bid) for bid, b in active_bots_db.items()]
        return {"summary": summary, "active_bots": bots_list, "orders": get_orders()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── DEPLOY BOT ────────────────────────────────────────────────────────────────
@router.post("/bot/deploy")
def deploy_bot(request: BotDeployRequest):
    try:
        order_type = "buy" if "Buy" in request.strategy else "sell"
        result     = execute_bot(
            stock=request.ticker, quantity=request.quantity,
            sim_days=request.sim_days, order_type=order_type, strategy=request.strategy
        )
        if result.get("status") == "failed":
            raise HTTPException(status_code=400, detail="Bot execution failed")

        save_order(result)
        ai_exec_price = result.get("price", 0)
        bot_id        = f"{request.ticker}_{int(_time.time())}"

        from datetime import datetime
        active_bots_db[bot_id] = {
            "ticker":        request.ticker,
            "qty":           request.quantity,
            "strat":         request.strategy,
            "entry_date":    datetime.now().strftime("%Y-%m-%d"),
            "ai_exec_price": ai_exec_price,
            "pnl":           result.get("pnl", 0),
            "status":        "EXECUTED",
            "sim_days":      request.sim_days,
            "logs": [
                f"AI Executed @ ₹{ai_exec_price:,.2f}",
                f"Simulated {request.sim_days} days",
                f"Strategy: {request.strategy}",
            ],
        }
        return {"status": "success", "bot_id": bot_id, "result": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── TERMINATE BOT ─────────────────────────────────────────────────────────────
@router.delete("/bot/{bot_id}")
def terminate_bot(bot_id: str):
    if bot_id in active_bots_db:
        del active_bots_db[bot_id]
        return {"status": "terminated", "bot_id": bot_id}
    raise HTTPException(status_code=404, detail="Bot not found")
