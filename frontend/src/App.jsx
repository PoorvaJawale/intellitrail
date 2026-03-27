import React, { useState, useEffect } from 'react';
import { getStatus, getPortfolio, getWatchlist, togglePin } from './api';
import StatsView from './components/StatsView';
import AnalyticsView from './components/AnalyticsView';
import PortfolioView from './components/PortfolioView';
import LandingPage from './components/LandingPage';

const NAV = [
  { id: 'stats',     label: 'Overview' },
  { id: 'analytics', label: 'Chart' },
  { id: 'portfolio', label: 'Portfolio' },
];

/* ── Inline styles ── */
const s = {
  app:    { display:'flex', height:'100vh', background:'var(--tv-bg)', color:'var(--tv-text)', overflow:'hidden' },
  aside:  { width:180, flexShrink:0, background:'var(--tv-bg2)', borderRight:'1px solid var(--tv-border)', display:'flex', flexDirection:'column' },
  logo:   { padding:'16px 14px 12px', borderBottom:'1px solid var(--tv-border)' },
  logoT:  { fontSize:15, fontWeight:700, color:'var(--tv-text)', letterSpacing:'-0.02em' },
  logoS:  { fontSize:9, color:'var(--tv-text3)', textTransform:'uppercase', letterSpacing:'0.12em', marginTop:2 },
  nav:    { padding:'10px 8px 4px' },
  navBtn: (active) => ({
    display:'block', width:'100%', textAlign:'left', marginBottom:2,
    padding:'7px 10px', border:'none', borderRadius:6, cursor:'pointer',
    background: active ? 'var(--tv-bg3)' : 'transparent',
    color: active ? 'var(--tv-text)' : 'var(--tv-text2)',
    fontSize:13, fontWeight: active ? 600 : 400,
  }),
  divider:  { height:1, background:'var(--tv-border)', margin:'6px 0' },
  footer:   { padding:'10px 14px', borderTop:'1px solid var(--tv-border)', fontSize:11 },
  ftRow:    { display:'flex', justifyContent:'space-between', marginBottom:3 },
  ftLabel:  { color:'var(--tv-text3)' }
};

export default function App() {
  const [appMode, setAppMode]     = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true' ? 'dashboard' : 'landing';
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [tab, setTab]             = useState('stats');
  const [status, setStatus]       = useState(null);
  const [portfolio, setPortfolio] = useState({ summary:{}, active_bots:[] });
  const [watchlist, setWatchlist] = useState([]);
  const [activeStock, setActiveStock] = useState('');

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    if (theme === 'light') document.documentElement.classList.add('light');
    else document.documentElement.classList.remove('light');
    localStorage.setItem('theme', theme);
  }, [theme]);

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

  if (appMode === 'landing') {
    return <LandingPage onLogin={() => setAppMode('dashboard')} theme={theme} toggleTheme={toggleTheme} />;
  }

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

        {/* Watchlist space filler and Theme toggle */}
        <div style={{ flex:1 }} />
        
        <div style={{ padding: '10px 14px' }}>
          <div onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--tv-text2)', fontSize: 12 }}>
            <div style={{ width: 32, height: 18, background: theme === 'dark' ? 'var(--tv-bg3)' : 'var(--tv-border)', borderRadius: 10, position: 'relative', transition: 'background 0.3s' }}>
              <div style={{ position: 'absolute', top: 2, left: theme === 'dark' ? 2 : 16, width: 14, height: 14, background: 'var(--tv-text)', borderRadius: '50%', transition: 'left 0.3s' }} />
            </div>
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </div>
        </div>

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
          {tab==='stats'     && <StatsView portfolio={portfolio} theme={theme} />}
          {tab==='analytics' && <AnalyticsView availableStocks={stocks} activeStock={activeStock} setActiveStock={setActiveStock} watchlist={watchlist} onTogglePin={handleTogglePin} theme={theme} />}
          {tab==='portfolio' && <PortfolioView availableStocks={stocks} portfolio={portfolio} fetchPortfolio={fetchAll} watchlist={watchlist} onTogglePin={handleTogglePin} theme={theme} />}
        </main>
      </div>
    </div>
  );
}
