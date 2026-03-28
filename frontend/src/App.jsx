import React, { useState, useEffect } from 'react';
import { getStatus, getPortfolio, getWatchlist, togglePin } from './api';
import StatsView from './components/StatsView';
import AnalyticsView from './components/AnalyticsView';
import PortfolioView from './components/PortfolioView';
import LandingPage from './components/LandingPage';
import SettingsView from './components/SettingsView';
import AccountView from './components/AccountView';

const getSystemTheme = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const NAV = [
  { id: 'stats',     label: 'Overview' },
  { id: 'analytics', label: 'Chart' },
  { id: 'portfolio', label: 'Portfolio' },
];

const BOTTOM_NAV = [
  { id: 'settings', label: 'Settings' },
  { id: 'account',  label: 'Account' },
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
  const [themeMode, setThemeMode] = useState(() => {
    const persistedMode = localStorage.getItem('themeMode');
    if (persistedMode === 'dark' || persistedMode === 'light' || persistedMode === 'auto') return persistedMode;

    const legacyTheme = localStorage.getItem('theme');
    if (legacyTheme === 'dark' || legacyTheme === 'light') return legacyTheme;
    return 'auto';
  });
  const [theme, setTheme] = useState(() => {
    const persistedMode = localStorage.getItem('themeMode');
    if (persistedMode === 'dark' || persistedMode === 'light') return persistedMode;

    const legacyTheme = localStorage.getItem('theme');
    if (legacyTheme === 'dark' || legacyTheme === 'light') return legacyTheme;
    return getSystemTheme();
  });
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [usernameDraft, setUsernameDraft] = useState('');
  const [tab, setTab]             = useState('stats');
  const [status, setStatus]       = useState(null);
  const [portfolio, setPortfolio] = useState({ summary:{}, active_bots:[] });
  const [watchlist, setWatchlist] = useState([]);
  const [activeStock, setActiveStock] = useState('');

  const toggleTheme = () => {
    setThemeMode(prev => {
      const current = prev === 'auto' ? getSystemTheme() : prev;
      return current === 'dark' ? 'light' : 'dark';
    });
  };

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);

    const applyTheme = (nextTheme) => {
      setTheme(nextTheme);
      if (nextTheme === 'light') document.documentElement.classList.add('light');
      else document.documentElement.classList.remove('light');
      localStorage.setItem('theme', nextTheme);
    };

    if (themeMode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches ? 'dark' : 'light');

      const handler = (event) => applyTheme(event.matches ? 'dark' : 'light');
      if (mediaQuery.addEventListener) mediaQuery.addEventListener('change', handler);
      else mediaQuery.addListener(handler);

      return () => {
        if (mediaQuery.removeEventListener) mediaQuery.removeEventListener('change', handler);
        else mediaQuery.removeListener(handler);
      };
    }

    applyTheme(themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

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

  const handleLogin = () => {
    const savedUsername = localStorage.getItem('username') || '';
    setUsername(savedUsername);
    setUsernameDraft(savedUsername);
    setAppMode('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setAppMode('landing');
    setTab('stats');
  };

  if (appMode === 'landing') {
    return <LandingPage onLogin={handleLogin} theme={theme} toggleTheme={toggleTheme} />;
  }

  const needsUsernameSetup = !username;

  const saveUsername = () => {
    const clean = usernameDraft.trim().replace(/\s+/g, '_');
    if (!clean) return;
    localStorage.setItem('username', clean);
    setUsername(clean);
  };

  return (
    <div style={s.app}>
      {needsUsernameSetup && (
        <div style={{
          position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.88)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:16,
        }}>
          <div style={{
            width:'100%', maxWidth:460, background:'var(--tv-bg2)', border:'1px solid var(--tv-border)',
            borderRadius:12, padding:20,
          }}>
            <div style={{ fontSize:16, fontWeight:700, color:'var(--tv-text)', marginBottom:8 }}>
              Create your username
            </div>
            <div style={{ fontSize:12, color:'var(--tv-text2)', marginBottom:14 }}>
              This username is permanent and will be shown in Account.
            </div>
            <input
              value={usernameDraft}
              onChange={(e) => setUsernameDraft(e.target.value)}
              placeholder="e.g. archie_trader"
              style={{ width:'100%', padding:'11px 12px', borderRadius:8, marginBottom:12 }}
            />
            <button
              onClick={saveUsername}
              disabled={!usernameDraft.trim()}
              style={{
                width:'100%', padding:'11px 12px', borderRadius:8, border:'none',
                background: usernameDraft.trim() ? '#089981' : 'var(--tv-bg3)',
                color:'#fff', cursor: usernameDraft.trim() ? 'pointer' : 'not-allowed', fontWeight:700,
              }}
            >
              Save Username
            </button>
          </div>
        </div>
      )}

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

        {/* Push utility nav to bottom */}
        <div style={{ flex:1 }} />

        <div style={{ padding:'8px 8px 6px' }}>
          {BOTTOM_NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={s.navBtn(tab===n.id)}>{n.label}</button>
          ))}
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
          {tab==='settings'  && (
            <SettingsView
              theme={theme}
              themeMode={themeMode}
              onThemeModeChange={setThemeMode}
              language={language}
              onLanguageChange={setLanguage}
            />
          )}
          {tab==='account'   && <AccountView status={status} username={username} onLogout={handleLogout} language={language} />}
        </main>
      </div>
    </div>
  );
}
