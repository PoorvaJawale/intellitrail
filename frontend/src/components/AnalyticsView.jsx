import React, { useState, useEffect, useRef } from "react";
import CandlestickChart from "./CandlestickChart";
import { getStockData, getAnalysis, getWatchlist, deployBot, terminateBot, getPortfolio } from "../api";
import { LANGUAGE_OPTIONS } from "../i18n";

const TF = ["1m", "5m", "15m", "1H", "4H", "1D", "1W"];
const TF_MAP = { "1m": "minute", "5m": "minute", "15m": "minute", "1H": "minute", "4H": "daily", "1D": "daily", "1W": "daily" };
const TF_LIMIT = { "1m": 120, "5m": 200, "15m": 200, "1H": 300, "4H": 400, "1D": 0, "1W": 0 };

const smallPill = (active) => ({
  padding: "3px 9px", border: "1px solid", borderRadius: 16, cursor: "pointer",
  fontSize: 11, fontWeight: active ? 600 : 400,
  background: active ? "var(--tv-text)" : "transparent",
  color: active ? "var(--tv-bg)" : "var(--tv-text2)",
  borderColor: active ? "var(--tv-text)" : "var(--tv-border)",
  transition: "all .12s",
});

/* ── TradingView SVG Icons ── */
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const ClearIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const SymbolIcon = ({ ticker }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="var(--tv-bg3)" />
    <text x="12" y="16.5" fontSize="12" fontWeight="700" fill="var(--tv-text)" textAnchor="middle">{ticker.charAt(0)}</text>
  </svg>
);
const IndiaFlag = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="8" fill="#f9f9f9" />
    <path d="M0 8a8 8 0 0 1 1.08-4h13.84A8 8 0 0 1 16 8" fill="#FF9933" />
    <path d="M0 8a8 8 0 0 0 1.08 4h13.84A8 8 0 0 0 16 8" fill="#138808" />
    <circle cx="8" cy="8" r="2.5" fill="#000080" />
  </svg>
);
const PinIcon = ({ pinned }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={pinned ? "var(--tv-text)" : "none"} stroke={pinned ? "var(--tv-text)" : "var(--tv-text2)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="17" x2="12" y2="22"></line>
    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76v-6A2 2 0 0 0 13 2.76h-2a2 2 0 0 0-2 2v6a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
  </svg>
);

/* ── Symbol Search Modal ── */
function SymbolSearchModal({ availableStocks, watchlist, value, onChange, onTogglePin, t }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const fullList = availableStocks.map(ticker => {
    return watchlist.find(w => w.ticker === ticker) || { ticker, price: 0, change: 0, pct: 0, trend: "up" };
  });

  const sortedList = [...fullList].sort((a, b) => {
    if (!query) {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return 0;
    }
    const q = query.toLowerCase();
    const aMatch = a.ticker.toLowerCase().includes(q);
    const bMatch = b.ticker.toLowerCase().includes(q);
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return 0;
  });

  return (
    <>
      <button onClick={() => { setOpen(true); setQuery(""); }} style={{
        padding: "6px 16px", background: "transparent", border: "1px solid var(--tv-border)",
        borderRadius: 20, cursor: "pointer", color: "var(--tv-text)", fontSize: 14, fontWeight: 700,
        display: "flex", alignItems: "center", transition: "background 0.2s"
      }} onMouseOver={e => e.currentTarget.style.background = "var(--tv-bg3)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
        {value || t('analytics.selectSymbol')}
      </button>

      {open && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)",
          zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center"
        }} onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div style={{
            width: "90%", maxWidth: 620, background: "var(--tv-bg)", borderRadius: 8, border: "1px solid var(--tv-border)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.8)", display: "flex", flexDirection: "column",
            overflow: "hidden", maxHeight: "60vh"
          }}>
            <div style={{ padding: "12px 16px 0", background: "var(--tv-bg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--tv-text)" }}>{t('analytics.symbolSearch')}</div>
                <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "var(--tv-text2)", cursor: "pointer", fontSize: 18 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div style={{ position: "relative", marginBottom: 12 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--tv-text2)", display: "flex" }}>
                  <SearchIcon />
                </span>
                <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                  placeholder={t('analytics.search')}
                  style={{
                    width: "100%", background: "var(--tv-bg2)", border: "1px solid var(--tv-border)", borderRadius: 8,
                    padding: "10px 40px", color: "var(--tv-text)", fontSize: 14, outline: "none", boxSizing: "border-box",
                    transition: "border 0.2s"
                  }} onFocus={e => e.target.style.borderColor = "var(--tv-text)"} onBlur={e => e.target.style.borderColor = "var(--tv-border)"} />

                {query && (
                  <button onClick={() => setQuery("")} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "var(--tv-text)", border: "none", color: "var(--tv-bg)", borderRadius: "50%", padding: 2, display: "flex", cursor: "pointer" }}>
                    <ClearIcon />
                  </button>
                )}
              </div>
            </div>

            <div style={{ overflowY: "auto", flex: 1, background: "var(--tv-bg)" }}>
              {sortedList.map((w) => {
                const isMatch = !query || w.ticker.toLowerCase().includes(query.toLowerCase());
                return (
                  <button key={w.ticker} onClick={() => { if (isMatch) { onChange(w.ticker); setOpen(false); } }} style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 16px", background: "transparent", borderTop: "1px solid transparent", borderBottom: "1px solid var(--tv-border)",
                    cursor: isMatch ? "pointer" : "default", opacity: isMatch ? 1 : 0.25,
                    transition: "none", textAlign: "left", outline: "none", position: "relative"
                  }} onMouseOver={e => { if (isMatch) { e.currentTarget.style.background = "var(--tv-bg3)"; e.currentTarget.style.zIndex = 1; } }} onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.zIndex = 0; }}>

                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <SymbolIcon ticker={w.ticker} />
                      <div style={{ color: "var(--tv-text)", fontSize: 14, fontWeight: 600, width: 90 }}>{w.ticker}</div>
                      <div style={{ color: "var(--tv-text2)", fontSize: 13 }}>{w.ticker} Corporation</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ fontSize: 12, color: "var(--tv-text3)" }}>{t('analytics.stock')}</div>
                      <button onClick={(e) => { e.stopPropagation(); onTogglePin(w.ticker); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 4 }}>
                        <PinIcon pinned={w.is_pinned} />
                      </button>
                      <div style={{ width: 80, textAlign: "right", display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: w.trend === "up" ? "#089981" : "#F23645" }}>
                          {w.pct > 0 ? "+" : ""}{w.pct.toFixed(2)}%
                        </div>
                        <div style={{ fontSize: 11, color: "var(--tv-text3)", fontFamily: "monospace" }}>
                          ₹{w.price.toLocaleString("en-IN", { minimumFractionDigits: 1 })}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── RSI Gauge ── */
function RsiGauge({ rsi, label }) {
  const pct = Math.min(100, Math.max(0, rsi));
  const color = rsi < 30 ? "#089981" : rsi > 70 ? "#F23645" : "#f39c12";
  return (
    <div style={{ padding: "10px 14px", background: "var(--tv-bg)", borderRadius: 8 }}>
      <div style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>RSI (14)</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "monospace", color }}>{rsi?.toFixed(1)}</div>
        <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700,
          background: color + "20", border: `1px solid ${color}50`, color }}>{label}</span>
      </div>
      <div style={{ height: 4, background: "var(--tv-border)", borderRadius: 2, position: "relative" }}>
        {/* zones */}
        <div style={{ position: "absolute", left: "30%", width: "40%", height: "100%", background: "rgba(243,156,18,0.15)" }} />
        <div style={{ position: "absolute", left: 0, width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }} />
        <div style={{ position: "absolute", left: "30%", top: -2, width: 1, height: 8, background: "var(--tv-text3)" }} />
        <div style={{ position: "absolute", left: "70%", top: -2, width: 1, height: 8, background: "var(--tv-text3)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--tv-text3)", marginTop: 4 }}>
        <span>0 Oversold</span><span>Neutral</span><span>Overbought 100</span>
      </div>
    </div>
  );
}

/* ── Metric cell (row/column layout) ── */
function MetricCell({ label, value, sub, color, mono }) {
  return (
    <div style={{ padding: "10px 12px", minHeight: 76, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: color || "var(--tv-text)", fontFamily: mono ? "monospace" : undefined }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "var(--tv-text2)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function SplitMetricRows({ rows }) {
  return (
    <div style={{ background: "var(--tv-bg)", borderRadius: 8, overflow: "hidden" }}>
      {rows.map(([left, right], idx) => (
        <React.Fragment key={idx}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2px 1fr",
              alignItems: "stretch",
            }}
          >
            <MetricCell {...left} />
            <div style={{ background: "var(--tv-border)", margin: "8px 0", borderRadius: 2 }} />
            {right ? <MetricCell {...right} /> : <div style={{ minHeight: 76 }} />}
          </div>
          {idx < rows.length - 1 && (
            <div style={{ height: 2, background: "var(--tv-border)", margin: "0 14px", borderRadius: 2 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function AnalyticsView({ availableStocks, activeStock, setActiveStock, watchlist, onTogglePin, theme, onToggleTheme, language, onLanguageChange, t, locale }) {
  const [tf, setTf] = useState("1m");
  const [stockData, setStockData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [side, setSide] = useState("buy");
  const [quantity, setQuantity] = useState(10);
  const [simDays, setSimDays] = useState(30);
  const [orderLoading, setOrderLoading] = useState(false);
  const [portfolio, setPortfolio] = useState({ active_bots: [], summary: {} });
  const [rightTab, setRightTab] = useState("watchlist");
  const [liveTime, setLiveTime] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    getPortfolio().then(setPortfolio).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeStock) return;
    setLoading(true); setStockData(null); setAnalysis(null);
    const timeframe = TF_MAP[tf];
    const limit = TF_LIMIT[tf];
    Promise.all([
      getStockData(activeStock, timeframe, limit),
      getAnalysis(activeStock)
    ]).then(([sd, an]) => { setStockData(sd); setAnalysis(an); })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [activeStock, tf]);

  const exec = async () => {
    if (!activeStock) return;
    setOrderLoading(true);
    try {
      await deployBot(activeStock, side === "buy" ? "Auto-Scout (Buy)" : "Auto-Protect (Sell)", quantity, simDays);
      setPortfolio(await getPortfolio());
    } catch (e) { alert(t('portfolio.orderFailed') || "Order failed."); }
    setOrderLoading(false);
  };

  const terminate = async (id) => {
    try { await terminateBot(id); setPortfolio(await getPortfolio()); } catch (e) { }
  };

  const m  = stockData?.metrics;
  const an = analysis;
  const currentWl = watchlist.find(w => w.ticker === activeStock);
  const bullish = m?.trend === "Bullish";
  const timeText = liveTime.toLocaleTimeString(locale || "en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "var(--tv-bg)" }}>

      {/* ── TOOLBAR ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 12px", height: 38, flexShrink: 0, borderBottom: "1px solid var(--tv-border)", background: "var(--tv-bg2)" }}>
        <SymbolSearchModal availableStocks={availableStocks} watchlist={watchlist} value={activeStock} onChange={setActiveStock} onTogglePin={onTogglePin} t={t} />
        <div style={{ width: 1, height: 16, background: "var(--tv-border)", margin: "0 6px", flexShrink: 0 }} />
        <div style={{ display: "flex", gap: 3 }}>
          {TF.map(t => (
            <button key={t} onClick={() => setTf(t)} style={smallPill(tf === t)}>{t}</button>
          ))}
        </div>
        <div style={{ width: 1, height: 16, background: "var(--tv-border)", margin: "0 6px", flexShrink: 0 }} />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {[[t('analytics.bull'), "#089981"], [t('analytics.bear'), "#F23645"], ["SMA20", "#2962ff"], ["SMA50", "#f39c12"], ["BB", "#7864c8"]].map(([label, color]) => (
            <span key={label} style={{ fontSize: 10, color, opacity: 0.8 }}>{label}</span>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label="Language"
            title="Language"
            style={{
              border: "1px solid var(--tv-border)",
              background: "var(--tv-bg3)",
              color: "var(--tv-text2)",
              borderRadius: 12,
              padding: "3px 6px",
              fontSize: 10,
              fontWeight: 700,
              width: 56,
              cursor: "pointer",
              outline: "none",
              appearance: "none",
              textAlign: "center",
            }}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={onToggleTheme}
            style={{
              border: "1px solid var(--tv-border)",
              background: "var(--tv-bg3)",
              color: "var(--tv-text2)",
              borderRadius: 12,
              padding: "3px 8px",
              fontSize: 10,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.08em",
            }}
          >
            {theme === "dark" ? t('analytics.dark') : t('analytics.light')}
          </button>
          <div style={{ fontSize: 11, color: "var(--tv-text2)", fontFamily: "monospace", letterSpacing: "0.04em" }}>
            {timeText} IST
          </div>
        </div>
      </div>

      {/* ── CHART + RIGHT PANEL ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* Chart */}
        <div style={{ flex: 1, overflow: "hidden", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            {loading ? (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--tv-text3)", fontSize: 12 }}>
                {t('analytics.loading', { symbol: activeStock })}
              </div>
            ) : stockData?.chart_data ? (
              <CandlestickChart chartData={stockData.chart_data} ticker={activeStock} metrics={m} changePct={currentWl?.pct} theme={theme} />
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--tv-text3)", fontSize: 12 }}>{t('analytics.noSymbol')}</div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ width: 340, flexShrink: 0, borderLeft: "1px solid var(--tv-border)", background: "var(--tv-bg2)", display: "flex", flexDirection: "column" }}>
          
          {/* Tabs header */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--tv-border)" }}>
            <div style={{ display: "flex", background: "var(--tv-bg3)", borderRadius: 6, padding: 3 }}>
              <button onClick={() => setRightTab("watchlist")} style={{
                flex: 1, padding: "6px 0", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: rightTab === "watchlist" ? "var(--tv-text)" : "transparent",
                border: "none", borderRadius: 4, color: rightTab === "watchlist" ? "var(--tv-bg)" : "var(--tv-text2)",
                transition: "all 0.15s", outline: "none"
              }}>{t('analytics.watchlist')}</button>
              <button onClick={() => setRightTab("analysis")} style={{
                flex: 1, padding: "6px 0", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: rightTab === "analysis" ? "var(--tv-text)" : "transparent",
                border: "none", borderRadius: 4, color: rightTab === "analysis" ? "var(--tv-bg)" : "var(--tv-text2)",
                transition: "all 0.15s", outline: "none"
              }}>{t('analytics.analysis')}</button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            
            {/* ── TECHNICAL ANALYSIS ── */}
            {rightTab === "analysis" && an && (
              <div style={{ padding: 12, flex: 1 }}>
                {/* Sentiment Header */}
                <div style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 8 }}>
                  {t('analytics.marketSentiment')}
                </div>
                <div style={{ borderTop: "1px solid var(--tv-border)", borderBottom: "1px solid var(--tv-border)", padding: "10px 0", marginBottom: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <RsiGauge rsi={an.technical.rsi} label={an.technical.rsi_label} />
                    <SplitMetricRows
                      rows={[
                        [
                          { label: t('stats.trend'), value: an.technical.trend, sub: an.technical.trend_signal, color: an.technical.trend === "Bullish" ? "#089981" : "#F23645" },
                          { label: t('portfolio.return'), value: `${an.performance.total_return > 0 ? "+" : ""}${an.performance.total_return?.toFixed(2)}%`, color: an.performance.total_return >= 0 ? "#089981" : "#F23645" },
                        ],
                      ]}
                    />
                  </div>
                </div>

                {/* Technical Indicators Header */}
                <div style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 8 }}>
                  {t('analytics.technicalIndicators')}
                </div>
                <div style={{ borderTop: "1px solid var(--tv-border)", borderBottom: "1px solid var(--tv-border)", padding: "10px 0", marginBottom: 16 }}>
                  <SplitMetricRows
                    rows={[
                      [
                        { label: "Volatility", value: `${an.technical.atr_pct?.toFixed(3)}%`, sub: "ATR Rate" },
                        { label: "BB Position", value: `${(an.technical.bb_position * 100)?.toFixed(0)}%`, sub: an.technical.bb_signal, color: an.technical.bb_position < 0.2 ? "#089981" : an.technical.bb_position > 0.8 ? "#F23645" : "#f39c12" },
                      ],
                      [
                        { label: "Sup / Res", value: `₹${an.fundamental.support?.toLocaleString("en-IN")}`, sub: `R: ₹${an.fundamental.resistance?.toLocaleString("en-IN")}`, mono: true },
                        { label: "Volume", value: an.fundamental.volume_trend != null ? `${an.fundamental.volume_trend > 0 ? "+" : ""}${an.fundamental.volume_trend}%` : "N/A", color: an.fundamental.volume_trend > 0 ? "#089981" : an.fundamental.volume_trend < 0 ? "#F23645" : undefined },
                      ],
                      [
                        { label: "20D Vol", value: `${an.performance.volatility_20d?.toFixed(1)}%`, sub: "Annualised" },
                        { label: "Sharpe", value: an.performance.sharpe_ratio?.toFixed(2), color: an.performance.sharpe_ratio > 1 ? "#089981" : an.performance.sharpe_ratio < 0 ? "#F23645" : "#f39c12" },
                      ],
                      [
                        { label: "10D Mom", value: `${an.fundamental.momentum_10d > 0 ? "+" : ""}${an.fundamental.momentum_10d?.toFixed(1)}%`, color: an.fundamental.momentum_10d >= 0 ? "#089981" : "#F23645" },
                        null,
                      ],
                    ]}
                  />
                </div>
                
                {/* AI Prediction Header */}
                <div style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 8 }}>
                  AI Engine Evaluation
                </div>
                <div style={{ borderTop: "1px solid var(--tv-border)", borderBottom: "1px solid var(--tv-border)", padding: "10px 0" }}>
                  <div style={{ padding: "12px 14px", background: "var(--tv-bg)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{t('analytics.forecastedNextClose')}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "monospace", color: an.ai.direction === "UP" ? "#089981" : "#F23645" }}>
                        ₹{an.ai.prediction?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--tv-text2)", marginTop: 2 }}>
                        {an.ai.direction === "UP" ? "▲" : "▼"} {t('analytics.expectedDelta', { value: an.ai.confidence?.toFixed(1) })}
                      </div>
                    </div>
                    <span style={{
                      padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 800,
                      background: an.ai.direction === "UP" ? "rgba(8,153,129,0.15)" : "rgba(242,54,69,0.15)",
                      border: `1px solid ${an.ai.direction === "UP" ? "rgba(8,153,129,0.4)" : "rgba(242,54,69,0.4)"}`,
                      color: an.ai.direction === "UP" ? "#089981" : "#F23645"
                    }}>{an.ai.direction}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── WATCHLIST ── */}
            {rightTab === "watchlist" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "6px 14px", fontSize: 9, color: "var(--tv-text3)", borderBottom: "1px solid var(--tv-border)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em" }}><span>{t('analytics.watchlistSymbol')}</span><span>{t('analytics.watchlistPrice')}</span></div>
                <div style={{ flex: 1, overflowY: "auto" }}>
                  {watchlist.filter(w => w.is_pinned).map(w => (
                    <button key={w.ticker} onClick={() => setActiveStock(w.ticker)} style={{
                      display: "grid", gridTemplateColumns: "1fr auto", width: "100%", padding: "10px 14px",
                      background: activeStock === w.ticker ? "var(--tv-bg3)" : "transparent", border: "none", borderBottom: "1px solid var(--tv-border)", cursor: "pointer"
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: activeStock === w.ticker ? "#089981" : "var(--tv-text)", textAlign: "left" }}>{w.ticker}</div>
                        <div style={{ fontSize: 11, color: "var(--tv-text2)", textAlign: "left", marginTop: 2 }}>{t('analytics.stock')}</div>
                      </div>
                      <div style={{ textAlign: "right", alignSelf: "center" }}>
                        <div style={{ fontSize: 12, fontFamily: "monospace", color: "var(--tv-text)", fontWeight: 500 }}>₹{w.price.toLocaleString("en-IN")}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: w.trend === "up" ? "#089981" : "#F23645", marginTop: 2 }}>
                          {w.pct > 0 ? "+" : ""}{w.pct.toFixed(2)}%
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── POSITIONS ── */}
            {portfolio.active_bots.length > 0 && <>
              <div style={{ padding: "6px 14px", borderTop: "1px solid var(--tv-border)", borderBottom: "1px solid var(--tv-border)", fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
                {t('analytics.positions', { count: portfolio.active_bots.length })}
              </div>
              <div style={{ maxHeight: 160, overflowY: "auto", flexShrink: 0 }}>
                {portfolio.active_bots.map(bot => (
                  <div key={bot.id} style={{ padding: "8px 14px", borderBottom: "1px solid var(--tv-border)", display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--tv-text)" }}>{bot.ticker}</div>
                      <div style={{ fontSize: 11, color: bot.strat.includes("Buy") ? "#089981" : "#F23645", marginTop: 2 }}>{bot.strat.includes("Buy") ? t('portfolio.buyLabel') : t('portfolio.sellLabel')} · {bot.qty}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: bot.pnl >= 0 ? "#089981" : "#F23645" }}>{bot.pnl >= 0 ? "+" : ""}₹{bot.pnl?.toFixed(0)}</div>
                      <button onClick={() => terminate(bot.id)} style={{ fontSize: 11, color: "#F23645", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 4 }}>{t('analytics.close')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </>}
          </div>
        </div>
      </div>

      {/* ── ORDER STRIP ── */}
      <div style={{ flexShrink: 0, borderTop: "1px solid var(--tv-border)", background: "var(--tv-bg2)", display: "flex", alignItems: "center", gap: 14, padding: "7px 14px", height: 54 }}>
        <div style={{ display: "flex", gap: 3, background: "var(--tv-bg3)", padding: "3px", borderRadius: 22, border: "1px solid var(--tv-border)", flexShrink: 0 }}>
          {["buy", "sell"].map(s => (
            <button key={s} onClick={() => setSide(s)} style={{
              padding: "5px 14px", borderRadius: 18, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
              background: side === s ? (s === "buy" ? "#089981" : "#F23645") : "transparent",
              color: side === s ? "#fff" : "var(--tv-text2)", transition: "all .15s"
            }}>
              {s === "buy" ? t('analytics.buy') : t('analytics.sell')}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t('portfolio.quantity')}</span>
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: 22, height: 22, background: "transparent", border: "1px solid var(--tv-border)", color: "var(--tv-text)", borderRadius: 6, cursor: "pointer" }}>−</button>
          <input type="number" value={quantity} min={1} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            style={{ width: 48, height: 24, textAlign: "center", background: "transparent", border: "1px solid var(--tv-border)", borderRadius: 6, color: "var(--tv-text)", fontSize: 12 }} />
          <button onClick={() => setQuantity(q => q + 1)} style={{ width: 22, height: 22, background: "transparent", border: "1px solid var(--tv-border)", color: "var(--tv-text)", borderRadius: 6, cursor: "pointer" }}>+</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t('portfolio.simulationPeriod')}</span>
          <input type="range" min={5} max={90} step={5} value={simDays} onChange={e => setSimDays(Number(e.target.value))} style={{ width: 80 }} />
          <span style={{ fontSize: 11, color: "var(--tv-text2)", fontFamily: "monospace", minWidth: 28 }}>{simDays}d</span>
        </div>
        <span style={{ fontSize: 11, color: "var(--tv-text3)" }}>
          {t('portfolio.strategy')}: <span style={{ color: side === "buy" ? "#089981" : "#F23645", fontWeight: 600 }}>{side === "buy" ? "Auto-Scout (Buy)" : "Auto-Protect (Sell)"}</span>
        </span>
        <button onClick={exec} disabled={orderLoading} style={{
          marginLeft: "auto", padding: "7px 20px", borderRadius: 20, border: "none",
          background: side === "buy" ? "#089981" : "#F23645",
          color: "#fff", fontWeight: 700, fontSize: 12, cursor: orderLoading ? "wait" : "pointer", flexShrink: 0,
        }}>
          {orderLoading ? t('analytics.executing') : side === "buy" ? t('analytics.deployBuy') : t('analytics.deploySell')}
        </button>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t('portfolio.fleetPnl')}</div>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: (portfolio.summary?.total_pnl || 0) >= 0 ? "#089981" : "#F23645" }}>
            ₹{(portfolio.summary?.total_pnl || 0).toFixed(0)}
          </div>
        </div>
      </div>
    </div>
  );
}
