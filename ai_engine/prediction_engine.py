import pandas as pd
import os

def get_predicted_prices(stock, days):

    print("👉 STOCK:", stock)

    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    file_path = os.path.join(base_dir, "data", "raw", f"{stock}_minute.csv")

    print("👉 FULL PATH:", file_path)
    print("👉 FILE EXISTS:", os.path.exists(file_path))

    if os.path.exists(file_path):

        df = pd.read_csv(file_path)

        print("👉 DATAFRAME HEAD:")
        print(df.head())

        print("👉 COLUMNS:", df.columns)

        # ⚠️ HANDLE COLUMN NAME PROPERLY
        close_col = None
        for col in df.columns:
            if col.lower() == "close":
                close_col = col
                break

        if close_col:
            prices = df[close_col].dropna().tolist()

            print("👉 LAST PRICES:", prices[-5:])

            if len(prices) > 0:
                return prices[-days:] if len(prices) >= days else prices

        else:
            print("❌ CLOSE COLUMN NOT FOUND")

    print("⚠️ FALLBACK TRIGGERED")
    return [100 + i for i in range(days)]