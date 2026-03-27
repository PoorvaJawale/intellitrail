import yfinance as yf
import pandas as pd
import os

def download_data():
    os.makedirs('data/raw', exist_ok=True)
    os.makedirs('models/trained_models', exist_ok=True)

    tickers = {'NIFTY 50': '^NSEI', 'RELIANCE': 'RELIANCE.NS', 'TCS': 'TCS.NS', 'HDFCBANK': 'HDFCBANK.NS'}

    for name, ticker in tickers.items():
        print(f"Downloading {name} ({ticker})...")
        # Daily data
        print("  - Fetching daily data...")
        df_daily = yf.download(ticker, period="2y", interval="1d", multi_level_index=False)
        if not df_daily.empty:
            if isinstance(df_daily.columns, pd.MultiIndex):
                df_daily.columns = df_daily.columns.get_level_values(0)
            df_daily = df_daily.reset_index()
            df_daily = df_daily.rename(columns={"Date": "date", "Datetime": "timestamp"})
            df_daily.to_csv(f"data/raw/{name}_daily.csv", index=False)
        
        # Minute data
        print("  - Fetching minute data...")
        df_minute = yf.download(ticker, period="5d", interval="1m", multi_level_index=False)
        if not df_minute.empty:
            if isinstance(df_minute.columns, pd.MultiIndex):
                df_minute.columns = df_minute.columns.get_level_values(0)
            df_minute = df_minute.reset_index()
            df_minute = df_minute.rename(columns={"Datetime": "timestamp", "Date": "date"})
            df_minute.to_csv(f"data/raw/{name}_minute.csv", index=False)

if __name__ == "__main__":
    download_data()
    print("✅ Data download complete.")
