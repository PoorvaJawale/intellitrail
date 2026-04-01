import React, { useState, useEffect } from 'react';
import { getStatus, getPortfolio, getWatchlist, togglePin, terminateBot } from './api';
import StatsView from './components/StatsView';
import AnalyticsView from './components/AnalyticsView';
import PortfolioView from './components/PortfolioView';
import LandingPage from './components/LandingPage';
import SettingsView from './components/SettingsView';
import AccountView from './components/AccountView';
import { getTranslator, getLocaleForLanguage } from './i18n';

const ActiveBotsSummary = ({ portfolio, onBotTerminated, onViewPortfolio, t }) => {
  const { active_bots = [], summary = {} } = portfolio;
  const [selectedBot, setSelectedBot] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteBot = async () => {
    if (!selectedBot) return;
    setDeleting(true);
    try {
      await terminateBot(selectedBot.id);
      setSelectedBot(null);
      if (onBotTerminated) onBotTerminated();
    } catch(e) {
      console.error('Failed to terminate bot:', e);
    } finally {
      setDeleting(false);
    }
  };

  const handleViewPortfolio = () => {
    if (onViewPortfolio) {
      onViewPortfolio(selectedBot.id);
    }
    setSelectedBot(null);
  };

  const s = {
    container: { display:'flex', flexDirection:'column', fontSize:11 },
    title: { color:'var(--tv-text)', textTransform:'uppercase', fontSize:'9px', letterSpacing:'0.1em', padding:'8px 14px 6px', fontWeight:700, borderBottom:'1px solid var(--tv-border)' },
    emptyState: { color:'var(--tv-text2)', fontSize:'11px', padding:'12px 14px', textAlign:'center', fontStyle:'italic' },
    botRow: { display:'flex', flexDirection:'column', padding:'10px 14px', borderBottom:'1px solid var(--tv-border)', gap:4, cursor:'pointer', userSelect:'none' },
    botHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 },
    ticker: { color:'var(--tv-text)', fontSize:'12px', fontWeight:700 },
    badge: (isBuy) => ({ 
      padding:'2px 7px', 
      borderRadius:12, 
      fontSize:'8px', 
      fontWeight:700,
      background: isBuy ? 'rgba(8,153,129,0.12)' : 'rgba(242,54,69,0.12)',
      border: `1px solid ${isBuy ? 'rgba(8,153,129,0.3)' : 'rgba(242,54,69,0.3)'}`,
      color: isBuy ? '#089981' : '#F23645',
      whiteSpace:'nowrap',
    }),
    metricsRow: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, fontSize:'10px', color:'var(--tv-text2)' },
    metricBox: { display:'flex', flexDirection:'column', gap:2 },
    metricLabel: { fontSize:'8px', color:'var(--tv-text3)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600 },
    metricValue: (color) => ({ fontSize:'11px', fontWeight:700, color: color || 'var(--tv-text)', fontFamily:'monospace' }),
  };

  return (
    <>
      <div style={s.container}>
        <div style={s.title}>{t('portfolio.activeOrders') || 'Active Orders'}</div>
        {active_bots.length === 0 ? (
          <div style={s.emptyState}>{t('portfolio.noActiveBots') || 'No active bots'}</div>
        ) : (
          active_bots.slice(0, 3).map((bot) => {
            const pnl = bot.pnl || 0;
            const pnlPct = bot.pnl_pct || (bot.ai_exec_price ? ((pnl / (bot.ai_exec_price * bot.qty)) * 100) : 0);
            const isBuy = bot.strat?.includes("Buy");
            
            return (
              <div key={bot.id} style={s.botRow} onDoubleClick={() => setSelectedBot(bot)}>
                <div style={s.botHeader}>
                  <span style={s.ticker}>{bot.ticker}</span>
                  <span style={s.badge(isBuy)}>{isBuy ? (t('portfolio.buyLabel') || 'LONG') : (t('portfolio.sellLabel') || 'SHORT')}</span>
                </div>
                <div style={s.metricsRow}>
                  <div style={s.metricBox}>
                    <span style={s.metricLabel}>{t('portfolio.entry') || 'Entry'}</span>
                    <span style={s.metricValue()}>₹{bot.ai_exec_price?.toFixed(1)}</span>
                  </div>
                  <div style={s.metricBox}>
                    <span style={s.metricLabel}>{t('portfolio.pnl') || 'P&L'}</span>
                    <span style={s.metricValue(pnl >= 0 ? '#089981' : '#F23645')}>
                      {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(0)}
                    </span>
                  </div>
                  <div style={s.metricBox}>
                    <span style={s.metricLabel}>{t('portfolio.return') || 'Return'}</span>
                    <span style={s.metricValue(pnlPct >= 0 ? '#089981' : '#F23645')}>
                      {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Details Modal */}
      {selectedBot && (
        <div style={{
          position:'fixed', inset:0, zIndex:9998, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(2px)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:16,
        }} onClick={(e) => { if(e.target === e.currentTarget) setSelectedBot(null); }}>
            <div style={{
            width:'100%', maxWidth:380, background:'var(--tv-bg2)', border:'1px solid var(--tv-border)',
            borderRadius:12, padding:20,
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--tv-text)' }}>
                {selectedBot.ticker} {t('portfolio.orderDetails') || 'Order Details'}
              </div>
              <button onClick={() => setSelectedBot(null)} style={{ background:'none', border:'none', color:'var(--tv-text2)', cursor:'pointer', fontSize:18 }}>
                ✕
              </button>
            </div>

            <div style={{ marginBottom:20, display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <div style={{ fontSize:10, color:'var(--tv-text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>{t('portfolio.type') || 'Type'}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--tv-text)' }}>{selectedBot.strat?.includes("Buy") ? (t('portfolio.buyLabel') || 'LONG') : (t('portfolio.sellLabel') || 'SHORT')}</div>
                </div>
                <div>
                  <div style={{ fontSize:10, color:'var(--tv-text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>{t('portfolio.quantity') || 'Quantity'}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--tv-text)' }}>× {selectedBot.qty}</div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <div style={{ fontSize:10, color:'var(--tv-text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>{t('portfolio.entryPrice') || 'Entry Price'}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--tv-text)', fontFamily:'monospace' }}>₹{selectedBot.ai_exec_price?.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize:10, color:'var(--tv-text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>{t('portfolio.status') || 'Status'}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#089981' }}>● {t('portfolio.executed') || 'Executed'}</div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <div style={{ fontSize:10, color:'var(--tv-text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>{t('portfolio.pnl') || 'P&L'}</div>
                  <div style={{ fontSize:13, fontWeight:700, color: (selectedBot.pnl || 0) >= 0 ? '#089981' : '#F23645', fontFamily:'monospace' }}>
                    {(selectedBot.pnl || 0) >= 0 ? '+' : ''}₹{(selectedBot.pnl || 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:10, color:'var(--tv-text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>{t('portfolio.return') || 'Return'}</div>
                  <div style={{ fontSize:13, fontWeight:700, color: (selectedBot.pnl_pct || 0) >= 0 ? '#089981' : '#F23645', fontFamily:'monospace' }}>
                    {(selectedBot.pnl_pct || 0) >= 0 ? '+' : ''}{(selectedBot.pnl_pct || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={handleViewPortfolio} style={{
                flex:1, padding:'10px 14px', background:'var(--tv-bg3)', border:'1px solid var(--tv-border)',
                borderRadius:8, color:'var(--tv-text)', fontWeight:600, cursor:'pointer', fontSize:12,
                transition:'background 0.2s'
              }} onMouseOver={(e) => e.target.style.background = 'var(--tv-bg)'} onMouseOut={(e) => e.target.style.background = 'var(--tv-bg3)'}>
                {t('portfolio.viewOnPortfolio') || 'View on Portfolio'}
              </button>
              <button onClick={handleDeleteBot} disabled={deleting} style={{
                flex:1, padding:'10px 14px', background:'rgba(242,54,69,0.15)', border:'1px solid rgba(242,54,69,0.35)',
                borderRadius:8, color:'#F23645', fontWeight:600, cursor:deleting ? 'not-allowed' : 'pointer', fontSize:12,
                opacity:deleting ? 0.6 : 1, transition:'opacity 0.2s'
              }}>
                {deleting ? (t('portfolio.closing') || 'Closing...') : (t('portfolio.closeOrder') || 'Close Order')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const getSystemTheme = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const NAV = [
  { id: 'stats',     labelKey: 'nav.overview' },
  { id: 'analytics', labelKey: 'nav.chart' },
  { id: 'portfolio', labelKey: 'nav.portfolio' },
];

const BOTTOM_NAV = [
  { id: 'settings', labelKey: 'nav.settings' },
  { id: 'account',  labelKey: 'nav.account' },
];

const SettingsIcon = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 10.09 3H10a2 2 0 1 1 4 0h.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const AccountIcon = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="8" r="4" />
  </svg>
);

/* ── Inline styles ── */
const s = {
  app:    { display:'flex', height:'100vh', background:'var(--tv-bg)', color:'var(--tv-text)', overflow:'hidden' },
  aside:  { width:180, flexShrink:0, background:'var(--tv-bg2)', borderRight:'1px solid var(--tv-border)', display:'flex', flexDirection:'column' },
  logo:   { padding:'16px 14px 12px', borderBottom:'1px solid var(--tv-border)' },
  logoT:  { fontSize:15, fontWeight:700, color:'var(--tv-text)', letterSpacing:'-0.02em' },
  logoS:  { fontSize:9, color:'var(--tv-text3)', textTransform:'uppercase', letterSpacing:'0.12em', marginTop:2 },
  nav:    { padding:'10px 8px 4px' },
  navBtn: (active) => ({
    display:'flex', alignItems:'center', gap:8, width:'100%', textAlign:'left', marginBottom:2,
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
  const [expandBotId, setExpandBotId] = useState(null);
  const [status, setStatus]       = useState(null);
  const [portfolio, setPortfolio] = useState({ summary:{}, active_bots:[] });
  const [watchlist, setWatchlist] = useState([]);
  const [activeStock, setActiveStock] = useState('');
  const t = getTranslator(language);
  const locale = getLocaleForLanguage(language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

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
      if (st?.available_stocks?.length > 0) {
        setActiveStock(prev => {
          if (prev && st.available_stocks.includes(prev)) return prev;
          return st.available_stocks[0];
        });
      }
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
    return <LandingPage onLogin={handleLogin} theme={theme} toggleTheme={toggleTheme} language={language} onLanguageChange={setLanguage} t={t} />;
  }

  const needsUsernameSetup = !username;

  const saveUsername = () => {
    const clean = usernameDraft.trim().replace(/\s+/g, '_');
    if (!clean) return;
    localStorage.setItem('username', clean);
    setUsername(clean);
  };

  return (
    <div style={s.app} className="dashboard-caps">
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
          <div style={s.logoT} className="no-caps">{t('app.name')}</div>
          <div style={s.logoS} className="no-caps">{t('app.aiEngine')}</div>
        </div>

        <nav style={s.nav}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={s.navBtn(tab===n.id)} className="no-caps">{t(n.labelKey)}</button>
          ))}
        </nav>

        <div style={s.divider} />

        {/* Active Bots Summary */}
        <ActiveBotsSummary 
          portfolio={portfolio} 
          onBotTerminated={fetchAll}
          onViewPortfolio={(botId) => {
            setTab('portfolio');
            setExpandBotId(botId);
          }}
          t={t}
        />

        {/* Push utility nav to bottom */}
        <div style={{ flex:1 }} />

        <div style={s.divider} />

        <div style={{ padding:'8px 8px 6px' }}>
          {BOTTOM_NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={s.navBtn(tab===n.id)} className="no-caps">
              {n.id === 'settings' ? <SettingsIcon color={tab===n.id ? 'var(--tv-text)' : 'var(--tv-text2)'} /> : <AccountIcon color={tab===n.id ? 'var(--tv-text)' : 'var(--tv-text2)'} />}
              <span>{t(n.labelKey)}</span>
            </button>
          ))}
        </div>

        <div style={s.footer}>
          <div style={s.ftRow}>
            <span style={s.ftLabel}>{t('status.api')}</span>
            <span style={{ color: status ? '#089981':'#6b7280' }}>{status ? `● ${t('status.online')}`:`○ ${t('status.offline')}`}</span>
          </div>
          <div style={s.ftRow}>
            <span style={s.ftLabel}>{t('status.mode')}</span>
            <span style={{ color:'#6b7280' }}>{status?.mode || t('status.backtest')}</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <main style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          {tab==='stats'     && <StatsView portfolio={portfolio} theme={theme} language={language} t={t} />}
          {tab==='analytics' && <AnalyticsView availableStocks={stocks} activeStock={activeStock} setActiveStock={setActiveStock} watchlist={watchlist} onTogglePin={handleTogglePin} theme={theme} onToggleTheme={toggleTheme} language={language} onLanguageChange={setLanguage} t={t} locale={locale} />}
           {tab==='portfolio' && <PortfolioView availableStocks={stocks} portfolio={portfolio} fetchPortfolio={fetchAll} watchlist={watchlist} onTogglePin={handleTogglePin} theme={theme} expandBotId={expandBotId} language={language} t={t} locale={locale} />}
          {tab==='settings'  && (
            <SettingsView
              theme={theme}
              themeMode={themeMode}
              onThemeModeChange={setThemeMode}
              language={language}
              onLanguageChange={setLanguage}
              t={t}
            />
          )}
          {tab==='account'   && <AccountView status={status} username={username} onLogout={handleLogout} language={language} t={t} />}
        </main>
      </div>
    </div>
  );
}
