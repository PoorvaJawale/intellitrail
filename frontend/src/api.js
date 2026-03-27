import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000/api" });

export const getStatus      = async ()             => (await api.get("/status")).data;
export const getWatchlist   = async ()             => (await api.get("/watchlist")).data;
export const getPortfolio   = async ()             => (await api.get("/portfolio")).data;

export const getStockData   = async (ticker, timeframe = "minute", limit = 200) =>
  (await api.get(`/stock/${ticker}?timeframe=${timeframe}&limit=${limit}`)).data;

export const getAnalysis    = async (ticker)       => (await api.get(`/analysis/${ticker}`)).data;

export const getPnlSeries   = async (ticker, entryPrice, qty, simDays) =>
  (await api.get(`/pnl/${ticker}?entry_price=${entryPrice}&quantity=${qty}&sim_days=${simDays}`)).data;

export const deployBot      = async (ticker, strategy, quantity, simDays) =>
  (await api.post("/bot/deploy", { ticker, strategy, quantity, sim_days: simDays })).data;

export const terminateBot   = async (botId)        => (await api.delete(`/bot/${botId}`)).data;

export const togglePin      = async (ticker)       => (await api.post(`/watchlist/${ticker}/pin`)).data;
