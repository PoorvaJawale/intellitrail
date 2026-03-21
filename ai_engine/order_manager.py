# ai_engine/order_manager.py

from datetime import datetime

orders = []  # TEMP (replace later with Supabase)

def save_order(order):
    orders.append(order)

def get_orders():
    return orders