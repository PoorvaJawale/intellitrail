# routes/bot_routes.py

from flask import Blueprint, request, redirect, url_for
from ai_engine.bot_executor import execute_bot
from ai_engine.order_manager import save_order

bot_bp = Blueprint('bot', __name__)

@bot_bp.route('/deploy-bot', methods=['POST'])
def deploy_bot():
    
    stock = request.form.get('stock')
    quantity = int(request.form.get('quantity'))
    sim_days = int(request.form.get('sim_days'))
    order_type = request.form.get('order_type')
    strategy = request.form.get('strategy')

    result = execute_bot(stock, quantity, sim_days, order_type, strategy)

    save_order(result)

    return redirect('/statistics')