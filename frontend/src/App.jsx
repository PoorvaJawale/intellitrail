import React, { useState, useEffect } from 'react';
import { getStatus, getPortfolio, getWatchlist, togglePin } from './api';
import StatsView from './components/StatsView';
import AnalyticsView from './components/AnalyticsView';
import PortfolioView from './components/PortfolioView';

const NAV = [
  { id: 'analytics', label: 'Chart' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'stats',     label: 'Overview' },
];

/* ── Inline styles ── */
const s = {
  app:    { display:'flex', height:'100vh', background:'#000', color:'#d1d4dc', overflow:'hidden' },
  aside:  { width:180, flexShrink:0, background:'#0a0a0a', borderRight:'1px solid #1c1c1c', display:'flex', flexDirection:'column' },
  logo:   { padding:'16px 14px 12px', borderBottom:'1px solid #1c1c1c' },
  logoT:  { fontSize:15, fontWeight:700, color:'#e0e0e0', letterSpacing:'-0.02em' },
  logoS:  { fontSize:9, color:'#3d404a', textTransform:'uppercase', letterSpacing:'0.12em', marginTop:2 },
  nav:    { padding:'10px 8px 4px' },
  navBtn: (active) => ({
    display:'block', width:'100%', textAlign:'left', marginBottom:2,
    padding:'7px 10px', border:'none', borderRadius:6, cursor:'pointer',
    background: active ? '#1a1a1a' : 'transparent',
    color: active ? '#e0e0e0' : '#6b7280',
    fontSize:13, fontWeight: active ? 600 : 400,
  }),
  divider:  { height:1, background:'#1c1c1c', margin:'6px 0' },
  wlHead:   { padding:'8px 14px 6px', fontSize:9, color:'#3d404a', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:700 },
  wlBtn:    (active) => ({
    display:'block', width:'100%', textAlign:'left', padding:'7px 10px', marginBottom:1, borderRadius:6,
    background: active ? '#131313' : 'transparent', border:'none', cursor:'pointer',
  }),
  wlRow:    { display:'flex', justifyContent:'space-between', alignItems:'center' },
  wlTick:   { fontSize:12, fontWeight:600, color:'#e0e0e0' },
  wlPct:    (up) => ({ fontSize:11, color: up ? '#089981':'#F23645', fontWeight:500 }),
  wlPrice:  { fontSize:11, color:'#6b7280', fontFamily:'monospace', marginTop:1 },
  footer:   { padding:'10px 14px', borderTop:'1px solid #1c1c1c', fontSize:11 },
  ftRow:    { display:'flex', justifyContent:'space-between', marginBottom:3 },
  ftLabel:  { color:'#3d404a' },
  header:   { height:36, flexShrink:0, background:'#0a0a0a', borderBottom:'1px solid #1c1c1c', display:'flex', alignItems:'center', padding:'0 14px', fontSize:11 },
  hLabel:   { color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.08em', fontSize:10, fontWeight:600 },
  hRight:   { marginLeft:'auto', color:'#3d404a', fontFamily:'monospace', fontSize:11 },
};

export default function App() {
  const [tab, setTab]             = useState('analytics');
  const [status, setStatus]       = useState(null);
  const [portfolio, setPortfolio] = useState({ summary:{}, active_bots:[] });
  const [watchlist, setWatchlist] = useState([]);
  const [activeStock, setActiveStock] = useState('');

  const fetchAll = async () => {
    try {
      const [st, pf, wl] = await Promise.all([
        import('./api').then(m => m.getStatus()),
        import('./api').then(m => m.getPortfolio()),
        import('./api').then(m => m.getWatchlist()),
      ]);
      setStatus(st); setPortfolio(pf); setWatchlist(wl);
      if (!activeStock && st?.available_stocks?.length > 0) setActiveStock(st.available_stocks[0]);
    } catch(e) { console.error(e); }
  };

  const handleTogglePin = async (ticker) => {
    try {
      const res = await togglePin(ticker);
      setWatchlist(prev => prev.map(w => w.ticker === res.ticker ? { ...w, is_pinned: res.is_pinned } : w));
    } catch(e) { console.error(e); }
  };

  useEffect(() => { fetchAll(); const t = setInterval(fetchAll, 15000); return () => clearInterval(t); }, []);
  const stocks = status?.available_stocks || [];

  return (
    <div style={s.app}>
      {/* ── SIDEBAR ── */}
      <aside style={s.aside}>
        <div style={s.logo}>
          <div style={s.logoT}>IntelliTrail</div>
          <div style={s.logoS}>AI Engine</div>
        </div>

        <nav style={s.nav}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={s.navBtn(tab===n.id)}>{n.label}</button>
          ))}
        </nav>

        <div style={s.divider} />

        {/* Watchlist */}
        <div style={{ flex:1 }} />

        <div style={s.footer}>
          <div style={s.ftRow}>
            <span style={s.ftLabel}>API</span>
            <span style={{ color: status ? '#089981':'#6b7280' }}>{status ? '● Online':'○ Offline'}</span>
          </div>
          <div style={s.ftRow}>
            <span style={s.ftLabel}>Mode</span>
            <span style={{ color:'#6b7280' }}>{status?.mode || 'Backtest'}</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <main style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          {tab==='analytics' && <AnalyticsView availableStocks={stocks} activeStock={activeStock} setActiveStock={setActiveStock} watchlist={watchlist} onTogglePin={handleTogglePin} />}
          {tab==='portfolio' && <PortfolioView availableStocks={stocks} portfolio={portfolio} fetchPortfolio={fetchAll} watchlist={watchlist} onTogglePin={handleTogglePin} />}
          {tab==='stats'     && <StatsView portfolio={portfolio} />}
        </main>
      </div>
    </div>
  );
}
