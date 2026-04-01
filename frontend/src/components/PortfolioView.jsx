import React, { useState, useEffect } from "react";
import { deployBot, terminateBot, getPortfolio, getWatchlist, getPnlSeries } from "../api";

/* ── TradingView SVG Icons ── */
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const ClearIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const FilterIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
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
    if (!query) return 0;
    const q = query.toLowerCase();
    const aMatch = a.ticker.toLowerCase().includes(q);
    const bMatch = b.ticker.toLowerCase().includes(q);
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  return (
    <>
      <button onClick={() => { setOpen(true); setQuery(""); }} style={{
        display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
        background: "var(--tv-bg2)", border: "1px solid var(--tv-border)", borderRadius: 8,
        cursor: "pointer", color: "var(--tv-text)", fontSize: 13, fontWeight: 700, width: "100%", transition: "background 0.2s"
      }} onMouseOver={e => e.currentTarget.style.background = "var(--tv-bg3)"} onMouseOut={e => e.currentTarget.style.background = "var(--tv-bg2)"}>
        <span style={{ flex: 1, textAlign: "left" }}>{value || t('portfolio.symbolSearch')}</span>
        <span style={{ color: "var(--tv-text2)", fontSize: 10 }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)",
          zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center",
        }} onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div style={{
            width: "90%", maxWidth: 620, background: "var(--tv-bg)", borderRadius: 8, border: "1px solid var(--tv-border)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.8)", display: "flex", flexDirection: "column",
            overflow: "hidden", maxHeight: "60vh"
          }}>
            {/* Header / Search */}
            <div style={{ padding: "12px 16px 0", background: "var(--tv-bg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--tv-text)" }}>{t('portfolio.symbolSearch')}</div>
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

            {/* List */}
            <div style={{ overflowY: "auto", flex: 1, background: "var(--tv-bg)" }}>
              {sortedList.map((w, index) => {
                const isMatch = !query || w.ticker.toLowerCase().includes(query.toLowerCase());
                return (
                  <button key={w.ticker} onClick={() => { if(isMatch) { onChange(w.ticker); setOpen(false); } }} style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 16px", background: "transparent", borderTop: "1px solid transparent", borderBottom: "1px solid var(--tv-border)", 
                    cursor: isMatch ? "pointer" : "default", opacity: isMatch ? 1 : 0.25,
                    transition: "none", textAlign: "left", outline: "none", position: "relative"
                  }} onMouseOver={e => { if(isMatch) { e.currentTarget.style.background = "var(--tv-bg3)"; e.currentTarget.style.zIndex=1; } }} onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.zIndex=0; }}>
                    
                    {/* Left Side: Icon + Ticker + Name */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <SymbolIcon ticker={w.ticker} />
                      <div style={{ color: "var(--tv-text)", fontSize: 14, fontWeight: 600, width: 90 }}>{w.ticker}</div>
                      <div style={{ color: "var(--tv-text2)", fontSize: 13 }}>{w.ticker} Corporation</div>
                    </div>

                    {/* Right Side: Type + Pin + Dataset Info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ fontSize: 12, color: "var(--tv-text3)" }}>{t('analytics.stock')}</div>
                      <button onClick={(e) => { e.stopPropagation(); onTogglePin(w.ticker); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 4 }}>
                        <PinIcon pinned={w.is_pinned} />
                      </button>
                      {/* Integrated Dataset Live Info */}
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

/* ── SVG P&L line chart ── */
function PnlChart({ series }) {
  if (!series || series.length < 2) return (
    <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--tv-text3)", fontSize: 11 }}>
      Not enough data for chart
    </div>
  );
  const W = 560, H = 130, PAD = { t: 10, r: 10, b: 24, l: 56 };
  const values = series.map(d => d.pnl);
  const minV = Math.min(...values), maxV = Math.max(...values);
  const range = maxV - minV || 1;
  const toX = i => PAD.l + (i / (series.length - 1)) * (W - PAD.l - PAD.r);
  const toY = v => PAD.t + ((maxV - v) / range) * (H - PAD.t - PAD.b);

  const points = series.map((d, i) => `${toX(i)},${toY(d.pnl)}`).join(" ");
  const area   = `M${toX(0)},${toY(0)} ` + series.map((d, i) => `L${toX(i)},${toY(d.pnl)}`).join(" ")
                 + ` L${toX(series.length - 1)},${H - PAD.b} L${toX(0)},${H - PAD.b} Z`;

  const lastPnl = values[values.length - 1];
  const color   = lastPnl >= 0 ? "#089981" : "#F23645";
  const zeroY   = toY(0);

  /* axis labels */
  const yTicks = [minV, 0, maxV].filter((v, i, a) => a.indexOf(v) === i);
  const xStep  = Math.max(1, Math.floor(series.length / 5));

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <image
        href="/icon.png"
        x={8}
        y={H - PAD.b - 14}
        width={12}
        height={12}
        opacity={0.22}
        preserveAspectRatio="xMidYMid meet"
      />
      {/* zero line */}
      {zeroY > PAD.t && zeroY < H - PAD.b && (
        <line x1={PAD.l} y1={zeroY} x2={W - PAD.r} y2={zeroY} stroke="var(--tv-border)" strokeWidth={1} strokeDasharray="3 3" />
      )}
      {/* area fill */}
      <defs>
        <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#pnlGrad)" />
      {/* line */}
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      {/* last point dot */}
      <circle cx={toX(series.length - 1)} cy={toY(lastPnl)} r={3} fill={color} />
      {/* Y tick labels */}
      {yTicks.map((v, i) => (
        <text key={i} x={PAD.l - 4} y={toY(v) + 4} textAnchor="end" fontSize={9} fill="var(--tv-text3)">
          {v >= 0 ? "+" : ""}₹{v.toFixed(0)}
        </text>
      ))}
      {/* X tick labels */}
      {series.filter((_, i) => i % xStep === 0).map((d, j) => {
        const i = j * xStep;
        const label = String(d.time).slice(11, 16) || String(i);
        return (
          <text key={i} x={toX(i)} y={H - PAD.b + 14} textAnchor="middle" fontSize={9} fill="var(--tv-text3)">{label}</text>
        );
      })}
    </svg>
  );
}

/* ── Bot Card (expandable like Streamlit) ── */
function BotCard({ bot, onTerminate, watchlist, isAutoOpen, t }) {
  const [open, setOpen] = useState(isAutoOpen || false);
  const [pnlData, setPnlData] = useState(null);
  const wl = watchlist.find(w => w.ticker === bot.ticker);

  useEffect(() => {
    if (open && !pnlData && bot.ai_exec_price) {
      getPnlSeries(bot.ticker, bot.ai_exec_price, bot.qty, bot.sim_days || 30)
        .then(setPnlData)
        .catch(() => {});
    }
  }, [open]);

  const pnl = bot.pnl || 0;
  const pnlPct = pnlData?.pnl_pct ?? (bot.ai_exec_price ? ((pnl / (bot.ai_exec_price * bot.qty)) * 100) : 0);
  const isBuy = bot.strat?.includes("Buy");

  return (
    <div style={{ border: "1px solid var(--tv-border)", borderRadius: 10, overflow: "hidden", marginBottom: 10, background: "var(--tv-bg2)" }}>
      {/* Header row — always visible */}
      <button onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", width: "100%", padding: "12px 16px",
        background: "transparent", border: "none", cursor: "pointer", gap: 14
      }}>
        {/* Ticker + side badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 180px" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--tv-text)" }}>{bot.ticker}</span>
          <span style={{
            padding: "2px 9px", borderRadius: 14, fontSize: 10, fontWeight: 700,
            background: isBuy ? "rgba(8,153,129,0.12)" : "rgba(242,54,69,0.12)",
            border: `1px solid ${isBuy ? "rgba(8,153,129,0.3)" : "rgba(242,54,69,0.3)"}`,
            color: isBuy ? "#089981" : "#F23645"
          }}>{isBuy ? t('portfolio.buyLabel') : t('portfolio.sellLabel')}</span>
          <span style={{ fontSize: 11, color: "var(--tv-text3)" }}>× {bot.qty}</span>
        </div>

        {/* Key metrics */}
        {[
          [t('portfolio.entry'), `₹${bot.ai_exec_price?.toFixed(2)}`, null],
          [t('analytics.live'), wl ? `₹${wl.price.toLocaleString("en-IN")}` : "—", null],
          [t('portfolio.pnl'), `${pnl >= 0 ? "+" : ""}₹${pnl.toFixed(2)}`, pnl >= 0 ? "#089981" : "#F23645"],
          [t('portfolio.return'), `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`, pnlPct >= 0 ? "#089981" : "#F23645"],
          [t('stats.entryDate'), bot.entry_date, null],
          [t('portfolio.status'), `● ${t('portfolio.executed')}`, "#089981"],
        ].map(([label, val, color]) => (
          <div key={label} style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 12, fontWeight: label === t('portfolio.pnl') || label === t('portfolio.return') ? 700 : 400, color: color || "var(--tv-text)", fontFamily: "monospace" }}>{val}</div>
          </div>
        ))}

        <span style={{ color: "var(--tv-text3)", fontSize: 11 }}>{open ? "▲" : "▼"}</span>
      </button>

      {/* Expanded body */}
      {open && (
        <div style={{ borderTop: "1px solid var(--tv-border)", background: "var(--tv-bg)", padding: "14px 16px" }}>
          {/* P&L Chart */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>
              {t('portfolio.aiPnl')}
            </div>
            <div style={{ background: "var(--tv-bg2)", border: "1px solid var(--tv-border)", borderRadius: 8, padding: "10px 14px" }}>
              {pnlData ? (
                <div>
                  <PnlChart series={pnlData.series} />
                  <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
                    <div>
                      <div style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{t('portfolio.currentPnl')}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace", color: (pnlData.current_pnl || 0) >= 0 ? "#089981" : "#F23645" }}>
                        {(pnlData.current_pnl || 0) >= 0 ? "+" : ""}₹{(pnlData.current_pnl || 0).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{t('portfolio.return')}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace", color: (pnlData.pnl_pct || 0) >= 0 ? "#089981" : "#F23645" }}>
                        {(pnlData.pnl_pct || 0) >= 0 ? "+" : ""}{(pnlData.pnl_pct || 0).toFixed(3)}%
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: "var(--tv-text3)", fontSize: 11, padding: "20px 0", textAlign: "center" }}>{t('portfolio.loadingChart') || 'Loading P&L chart…'}</div>
              )}
            </div>
          </div>

          {/* Execution log + Close */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div>
              <div style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>
                {t('portfolio.aiExecutionLog')}
              </div>
              {bot.logs?.map((log, i) => (
                <div key={i} style={{ fontSize: 11, color: "var(--tv-text2)", marginBottom: 4 }}>
                  <span style={{ color: "var(--tv-text3)", marginRight: 6 }}>›</span>{log}
                </div>
              ))}
              <div style={{ fontSize: 11, color: "var(--tv-text2)", marginTop: 2 }}>
                <span style={{ color: "var(--tv-text3)", marginRight: 6 }}>›</span>
                {t('portfolio.strategy')}: <span style={{ color: isBuy ? "#089981" : "#F23645" }}>{bot.strat}</span>
              </div>
            </div>
            <button onClick={() => onTerminate(bot.id)} style={{
              padding: "7px 16px", background: "transparent",
              border: "1px solid rgba(242,54,69,0.35)", borderRadius: 16,
              color: "#F23645", fontSize: 11, cursor: "pointer", fontWeight: 600, flexShrink: 0
            }}>
              {t('portfolio.closePosition')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main component ── */
const LABEL = { fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 7, display: "block" };

export default function PortfolioView({ availableStocks, portfolio, fetchPortfolio, watchlist, onTogglePin, expandBotId, t }) {
  const { active_bots = [], summary = {} } = portfolio;
  const [side, setSide]     = useState("buy");
  const [ticker, setTicker] = useState(availableStocks[0] || "");
  const [qty, setQty]       = useState(10);
  const [simDays, setSimDays] = useState(30);
  const [loading, setLoading] = useState(false);

  const selectedWl = watchlist.find(w => w.ticker === ticker);

  const deploy = async () => {
    if (!ticker) return;
    setLoading(true);
    try {
      await deployBot(ticker, side === "buy" ? "Auto-Scout (Buy)" : "Auto-Protect (Sell)", qty, simDays);
      await fetchPortfolio();
    } catch (e) { alert((t('portfolio.orderFailed') || 'Deploy failed') + ': ' + e.message); }
    setLoading(false);
  };

  const terminate = async (id) => {
    try { await terminateBot(id); await fetchPortfolio(); } catch (e) {}
  };

  const totalPnl  = summary.total_pnl || 0;
  const totalBots = summary.total_bots || 0;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "var(--tv-bg)" }}>

      {/* ════ LEFT — ORDER FORM ════ */}
      <div style={{ width: 280, flexShrink: 0, borderRight: "1px solid var(--tv-border)", background: "var(--tv-bg)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: "14px 16px 0" }}>
          <div style={{ fontSize: 11, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 14 }}>{t('portfolio.newOrder')}</div>
          {/* Buy / Sell toggle */}
          <div style={{ display: "flex", gap: 3, background: "var(--tv-bg3)", padding: 3, borderRadius: 24, border: "1px solid var(--tv-border)", marginBottom: 18 }}>
            {["buy", "sell"].map(s => (
              <button key={s} onClick={() => setSide(s)} style={{
                flex: 1, padding: "8px 0", borderRadius: 20, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 700,
                background: side === s ? (s === "buy" ? "#089981" : "#F23645") : "transparent",
                color: side === s ? "#fff" : "var(--tv-text2)", transition: "all .15s"
              }}>
                {s === "buy" ? t('portfolio.buyLong') : t('portfolio.sellShort')}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
          {/* Symbol dropdown */}
          <div>
            <span style={LABEL}>Symbol</span>
            <SymbolSearchModal availableStocks={availableStocks} watchlist={watchlist} value={ticker} onChange={setTicker} onTogglePin={onTogglePin} t={t} />
          </div>

          {/* Mini price card */}
          {selectedWl && (
            <div style={{ background: "var(--tv-bg2)", border: "1px solid var(--tv-border)", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{t('portfolio.currentPrice')}</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace", color: "var(--tv-text)" }}>₹{selectedWl.price.toLocaleString("en-IN")}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{t('portfolio.chg24h')}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: selectedWl.trend === "up" ? "#089981" : "#F23645" }}>
                  {selectedWl.pct > 0 ? "+" : ""}{selectedWl.pct.toFixed(3)}%
                </div>
                <div style={{ fontSize: 10, color: selectedWl.trend === "up" ? "#089981" : "#F23645", marginTop: 2 }}>
                  {selectedWl.trend === "up" ? "▲ Bullish" : "▼ Bearish"}
                </div>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
              <span style={LABEL}>{t('portfolio.quantity')}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
              <button onClick={() => setQty(q => Math.max(1, q - 10))} style={{ width: 28, height: 28, background: "transparent", border: "1px solid var(--tv-border)", color: "var(--tv-text2)", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>−−</button>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 28, height: 28, background: "transparent", border: "1px solid var(--tv-border)", color: "var(--tv-text2)", borderRadius: 8, cursor: "pointer", fontSize: 16 }}>−</button>
              <input type="number" value={qty} min={1}
                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ flex: 1, height: 28, textAlign: "center", background: "transparent", border: "1px solid var(--tv-border)", borderRadius: 8, color: "var(--tv-text)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              <button onClick={() => setQty(q => q + 1)} style={{ width: 28, height: 28, background: "transparent", border: "1px solid var(--tv-border)", color: "var(--tv-text2)", borderRadius: 8, cursor: "pointer", fontSize: 16 }}>+</button>
              <button onClick={() => setQty(q => q + 10)} style={{ width: 28, height: 28, background: "transparent", border: "1px solid var(--tv-border)", color: "var(--tv-text2)", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>++</button>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 5, 10, 25, 50, 100].map(q => (
                <button key={q} onClick={() => setQty(q)} style={{
                  flex: 1, padding: "3px 0", borderRadius: 10, border: "1px solid var(--tv-border)",
                  background: qty === q ? "var(--tv-bg3)" : "transparent",
                  color: qty === q ? "var(--tv-text)" : "var(--tv-text3)", fontSize: 10, cursor: "pointer"
                }}>{q}</button>
              ))}
            </div>
          </div>

          {/* Simulation period */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={LABEL}>{t('portfolio.simulationPeriod')}</span>
              <span style={{ fontSize: 11, color: "var(--tv-text3)", fontFamily: "monospace" }}>{simDays}d</span>
            </div>
            <input type="range" min={5} max={60} step={5} value={simDays}
              onChange={e => setSimDays(Number(e.target.value))} style={{ width: "100%", marginBottom: 6 }} />
            <div style={{ display: "flex", gap: 4 }}>
              {[5, 10, 14, 30, 60].map(d => (
                <button key={d} onClick={() => setSimDays(d)} style={{
                  flex: 1, padding: "3px 0", borderRadius: 10, border: "1px solid var(--tv-border)",
                  background: simDays === d ? "var(--tv-bg3)" : "transparent",
                  color: simDays === d ? "var(--tv-text)" : "var(--tv-text3)", fontSize: 10, cursor: "pointer"
                }}>{d}d</button>
              ))}
            </div>
          </div>

          {/* Strategy readout */}
          <div style={{ background: "var(--tv-bg2)", border: "1px solid var(--tv-border)", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t('portfolio.strategy')}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: side === "buy" ? "#089981" : "#F23645" }}>
                {side === "buy" ? "Auto-Scout (Buy)" : "Auto-Protect (Sell)"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t('portfolio.mktValueEst')}</span>
              <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--tv-text)" }}>
                {selectedWl ? `₹${(selectedWl.price * qty).toLocaleString("en-IN", { minimumFractionDigits: 0 })}` : "—"}
              </span>
            </div>
          </div>

          {/* Execute */}
          <button onClick={deploy} disabled={loading} style={{
            padding: "11px 0", borderRadius: 22, border: "none",
            background: side === "buy" ? "#089981" : "#F23645",
            color: "#fff", fontWeight: 700, fontSize: 13, cursor: loading ? "wait" : "pointer",
          }}>
            {loading ? t('portfolio.executing') : side === "buy" ? t('portfolio.deployBuy') : t('portfolio.deploySell')}
          </button>
        </div>

        {/* Footer summary */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--tv-border)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[[t('portfolio.openPositions'), totalBots, "var(--tv-text)"], [t('portfolio.fleetPnl'), `₹${totalPnl.toFixed(0)}`, totalPnl >= 0 ? "#089981" : "#F23645"]].map(([label, value, color]) => (
            <div key={label}>
              <div style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color, fontFamily: "monospace" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ════ RIGHT — ACTIVE POSITIONS ════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--tv-bg)" }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--tv-border)", background: "var(--tv-bg)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: "var(--tv-text2)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{t('portfolio.activePositionsAnalysis')}</span>
            {active_bots.length > 0 && (
              <span style={{ padding: "2px 9px", borderRadius: 12, background: "rgba(8,153,129,0.12)", border: "1px solid rgba(8,153,129,0.25)", color: "#089981", fontSize: 10, fontWeight: 600 }}>
                {active_bots.length} open
              </span>
            )}
          </div>
          {active_bots.length > 0 && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, color: "var(--tv-text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Total P&amp;L</div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "monospace", color: totalPnl >= 0 ? "#089981" : "#F23645" }}>
                {totalPnl >= 0 ? "+" : ""}₹{totalPnl.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: active_bots.length > 0 ? "12px 16px" : 0 }}>
          {active_bots.length === 0 ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "var(--tv-text3)" }}>
              <div style={{ fontSize: 14, color: "var(--tv-text3)", fontWeight: 600 }}>{t('portfolio.noAIBots')}</div>
              <div style={{ fontSize: 12, color: "var(--tv-text2)", textAlign: "center", maxWidth: 280 }}>
                {t('portfolio.deployHint')}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ padding: "4px 12px", borderRadius: 16, background: "rgba(8,153,129,0.08)", border: "1px solid rgba(8,153,129,0.2)", color: "#089981", fontSize: 11 }}>{t('portfolio.buyLong').replace(' / LONG', '')} — Auto-Scout</span>
                <span style={{ padding: "4px 12px", borderRadius: 16, background: "rgba(242,54,69,0.08)", border: "1px solid rgba(242,54,69,0.2)", color: "#F23645", fontSize: 11 }}>{t('portfolio.sellShort').replace(' / SHORT', '')} — Auto-Protect</span>
              </div>
            </div>
          ) : (
            active_bots.map(bot => (
              <BotCard key={bot.id} bot={bot} onTerminate={terminate} watchlist={watchlist} isAutoOpen={bot.id === expandBotId} t={t} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
