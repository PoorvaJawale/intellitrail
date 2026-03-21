from ai_engine.prediction_engine import get_predicted_prices

def execute_bot(stock, quantity, sim_days, order_type, strategy):

    predicted_prices = get_predicted_prices(stock, sim_days)

    # ❌ SAFETY CHECK
    if not predicted_prices or len(predicted_prices) == 0:
        return {
            "stock": stock,
            "quantity": quantity,
            "price": 0,
            "exit_price": 0,
            "pnl": 0,
            "status": "failed"
        }

    # ✅ DEFINE BOTH ENTRY & EXIT FIRST
    if order_type == "buy":
        entry_price = min(predicted_prices)
        exit_price = max(predicted_prices)
    else:
        entry_price = max(predicted_prices)
        exit_price = min(predicted_prices)

    # ✅ CALCULATE P&L
    pnl = (exit_price - entry_price) * quantity

    # ✅ RETURN FULL DATA
    return {
        "stock": stock,
        "quantity": quantity,
        "price": float(entry_price),
        "exit_price": float(exit_price),
        "pnl": float(pnl),
        "type": order_type,
        "strategy": strategy,
        "sim_days": sim_days,
        "status": "executed"
    }