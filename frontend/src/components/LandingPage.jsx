import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LANGUAGE_OPTIONS } from '../i18n';

// --- Dummy Data ---
const TICKER_DATA = [
  { sym: 'AAPL', p: '173.50', c: '+1.2%' },
  { sym: 'TSLA', p: '240.20', c: '-0.8%' },
  { sym: 'NVDA', p: '850.10', c: '+3.4%' },
  { sym: 'MSFT', p: '420.55', c: '+0.5%' },
  { sym: 'AMZN', p: '178.10', c: '-0.2%' },
  { sym: 'GOOGL', p: '144.20', c: '+1.1%' },
  { sym: 'META', p: '500.40', c: '+2.1%' },
];

export default function LandingPage({ onLogin, theme, toggleTheme, language, onLanguageChange, t }) {
  const [view, setView] = useState(() => {
    return localStorage.getItem('hasAccount') ? 'login' : 'home';
  }); // home, about, contacts, login, signup

  return (
    <div style={{ minHeight: '100vh', background: 'var(--tv-bg)', color: 'var(--tv-text)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Background Ambience */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(8,153,129,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(41,98,255,0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />

      {/* Navbar */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', borderBottom: '1px solid var(--tv-border)' }}>
        <div 
          onClick={() => setView('home')}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
        >
          <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--tv-text)', letterSpacing: '-0.04em' }}>{t('app.name')}</span>
          <span style={{ fontSize: 10, color: '#089981', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 700, marginTop: 2 }}>{t('app.aiEngine')}</span>
        </div>

        <div style={{ display: 'flex', gap: 35, fontSize: 14, fontWeight: 600 }}>
          <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', color: view === 'home' ? 'var(--tv-text)' : 'var(--tv-text2)', cursor: 'pointer', transition: 'color 0.2s', padding: 0 }}>{t('landing.home')}</button>
          <button onClick={() => setView('about')} style={{ background: 'none', border: 'none', color: view === 'about' ? 'var(--tv-text)' : 'var(--tv-text2)', cursor: 'pointer', transition: 'color 0.2s', padding: 0 }}>{t('landing.about')}</button>
          <button onClick={() => setView('contacts')} style={{ background: 'none', border: 'none', color: view === 'contacts' ? 'var(--tv-text)' : 'var(--tv-text2)', cursor: 'pointer', transition: 'color 0.2s', padding: 0 }}>{t('landing.contacts')}</button>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Theme Toggle Component inside Landing Page */}
          <div onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--tv-text2)', fontSize: 12, marginRight: 10 }}>
            <div style={{ width: 32, height: 18, background: theme === 'dark' ? 'var(--tv-bg3)' : 'var(--tv-border)', borderRadius: 10, position: 'relative', transition: 'background 0.3s' }}>
              <div style={{ position: 'absolute', top: 2, left: theme === 'dark' ? 2 : 16, width: 14, height: 14, background: 'var(--tv-text)', borderRadius: '50%', transition: 'left 0.3s' }} />
            </div>
          </div>

          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label="Language"
            title="Language"
            style={{
              border: '1px solid var(--tv-border)',
              background: 'var(--tv-bg2)',
              color: 'var(--tv-text2)',
              borderRadius: 999,
              padding: '4px 8px',
              fontSize: 10,
              fontWeight: 700,
              width: 56,
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              textAlign: 'center',
            }}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <button 
            onClick={() => setView('login')}
            style={{ padding: '8px 24px', fontSize: 13, fontWeight: 600, color: 'var(--tv-text)', background: 'transparent', border: '1px solid var(--tv-border)', borderRadius: 24, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--tv-text3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--tv-border)'}
          >
            {t('landing.login')}
          </button>
          <button 
            onClick={() => setView('signup')}
            style={{ padding: '8px 24px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#089981', border: 'none', borderRadius: 24, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#0aab91'}
            onMouseLeave={e => e.currentTarget.style.background = '#089981'}
          >
            {t('landing.signup')}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)' }}>
        {view === 'home' && <HomeView onGetStarted={() => setView('signup')} t={t} />}
        {view === 'about' && <AboutView t={t} />}
        {view === 'contacts' && <ContactsView t={t} />}
        {(view === 'login' || view === 'signup') && <AuthForm type={view} onSwitch={setView} onAuthSuccess={onLogin} t={t} />}
      </div>

    </div>
  );
}

// ── SUBCOMPONENTS ──

function HomeView({ onGetStarted, t }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ padding: '6px 16px', background: 'rgba(8,153,129,0.1)', border: '1px solid rgba(8,153,129,0.2)', borderRadius: 30, color: '#089981', fontSize: 12, fontWeight: 600, marginBottom: 30 }}>
        {t('landing.heroBadge')}
      </div>
      
      <h1 style={{ fontSize: 72, fontWeight: 800, color: 'var(--tv-text)', lineHeight: 1.1, letterSpacing: '-0.04em', maxWidth: 800, marginBottom: 24 }}>
        {t('landing.heroTitleTop')}<br />
        <span style={{ background: 'linear-gradient(90deg, #089981, #2962ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {t('landing.heroTitleBottom')}
        </span>
      </h1>
      
      <p style={{ fontSize: 18, color: 'var(--tv-text2)', maxWidth: 650, lineHeight: 1.6, marginBottom: 40, fontWeight: 500 }}>
        {t('landing.heroSub')}
      </p>

      <button 
        onClick={onGetStarted}
        style={{ padding: '18px 48px', fontSize: 16, fontWeight: 700, color: '#fff', background: '#089981', border: 'none', borderRadius: 30, cursor: 'pointer', boxShadow: '0 8px 30px rgba(8,153,129,0.3)', transition: 'all 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        {t('landing.heroCta')}
      </button>

      {/* Ticker Tape Animation */}
      <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, width: '100vw', background: 'var(--tv-bg2)', borderTop: '1px solid var(--tv-border)', borderBottom: '1px solid var(--tv-border)', padding: '16px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 60, whiteSpace: 'nowrap', animation: 'scroll 30s linear infinite' }}>
          {[...TICKER_DATA, ...TICKER_DATA, ...TICKER_DATA, ...TICKER_DATA].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--tv-text)', fontSize: 14 }}>{t.sym}</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--tv-text3)', fontSize: 14 }}>${t.p}</span>
              <span style={{ fontWeight: 600, color: t.c.startsWith('+') ? '#089981' : '#F23645', fontSize: 13, background: t.c.startsWith('+') ? 'rgba(8,153,129,0.1)' : 'rgba(242,54,69,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                {t.c.startsWith('+') ? '▲' : '▼'} {t.c.replace('+', '').replace('-', '')}
              </span>
            </div>
          ))}
        </div>
      </div>
      <style>
        {`@keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}
      </style>
    </div>
  );
}

function AboutView({ t }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
      <div style={{ maxWidth: 800, background: 'var(--tv-bg2)', border: '1px solid var(--tv-border)', borderRadius: 24, padding: 50, backdropFilter: 'blur(20px)' }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: 'var(--tv-text)', marginBottom: 24, letterSpacing: '-0.02em' }}>{t('landing.aboutTitle')}</h2>
        <p style={{ fontSize: 16, color: 'var(--tv-text2)', lineHeight: 1.7, marginBottom: 20 }}>
          {t('landing.aboutP1')}
        </p>
        <p style={{ fontSize: 16, color: 'var(--tv-text2)', lineHeight: 1.7 }}>
          {t('landing.aboutP2')}
        </p>
      </div>
    </div>
  );
}

function ContactsView({ t }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
      <div style={{ maxWidth: 600, width: '100%', background: 'var(--tv-bg2)', border: '1px solid var(--tv-border)', borderRadius: 24, padding: 50, backdropFilter: 'blur(20px)' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--tv-text)', marginBottom: 12, letterSpacing: '-0.02em' }}>{t('landing.contactTitle')}</h2>
        <p style={{ fontSize: 15, color: 'var(--tv-text2)', marginBottom: 30 }}>{t('landing.contactSub')}</p>
        
        <form onSubmit={e => e.preventDefault()}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--tv-text2)', marginBottom: 8, fontWeight: 500 }}>{t('landing.contactName')}</label>
            <input required type="text" placeholder="Jane Doe" style={{ width: '100%', padding: '14px 16px', borderRadius: 10, fontSize: 14 }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--tv-text2)', marginBottom: 8, fontWeight: 500 }}>{t('landing.contactEmail')}</label>
            <input required type="email" placeholder="jane@example.com" style={{ width: '100%', padding: '14px 16px', borderRadius: 10, fontSize: 14 }} />
          </div>
          <div style={{ marginBottom: 30 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--tv-text2)', marginBottom: 8, fontWeight: 500 }}>{t('landing.contactMessage')}</label>
            <textarea required rows="4" placeholder="How can we help?" style={{ width: '100%', padding: '14px 16px', background: 'var(--tv-bg)', border: '1px solid var(--tv-border)', borderRadius: 10, color: 'var(--tv-text)', fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '16px', fontSize: 15, fontWeight: 600, color: '#fff', background: '#089981', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
            {t('landing.contactSend')}
          </button>
        </form>
      </div>
    </div>
  );
}


function AuthForm({ type, onSwitch, onAuthSuccess, t }) {
  const isLogin = type === 'login';
  const [signupUsername, setSignupUsername] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (isLogin) {
      // Supabase sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      onAuthSuccess();
    } else {
      // Supabase sign up
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setLoading(false);
        setError(signUpError.message);
        return;
      }
      // Insert profile row
      const user = data.user;
      const userId = user?.id || data.session?.user?.id;
      if (userId) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: userId,
            username: signupUsername.trim().replace(/\s+/g, '_'),
            full_name: signupFullName,
          },
        ]);
        if (profileError) {
          setLoading(false);
          setError('Profile creation failed: ' + profileError.message);
          return;
        }
      }
      setLoading(false);
      onSwitch('login');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400, background: 'var(--tv-bg2)', border: '1px solid var(--tv-border)', borderRadius: 24, padding: 40, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--tv-text)', marginBottom: 8, letterSpacing: '-0.02em' }}>{isLogin ? t('landing.authWelcome') : t('landing.authCreate')}</h2>
          <p style={{ fontSize: 14, color: 'var(--tv-text3)' }}>
            {isLogin ? t('landing.authLoginSub') : t('landing.authSignupSub')}
          </p>
        </div>

        {!isLogin && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--tv-text2)', marginBottom: 8, fontWeight: 500 }}>{t('landing.fullName')}</label>
            <input
              required
              type="text"
              value={signupFullName}
              onChange={e => setSignupFullName(e.target.value)}
              placeholder="John Doe"
              style={{ width: '100%', padding: '14px 16px', borderRadius: 10, fontSize: 14 }}
            />
          </div>
        )}

        {!isLogin && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--tv-text2)', marginBottom: 8, fontWeight: 500 }}>{t('landing.username')}</label>
            <input
              required
              type="text"
              value={signupUsername}
              onChange={e => setSignupUsername(e.target.value)}
              placeholder={t('landing.usernamePlaceholder')}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 10, fontSize: 14 }}
            />
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--tv-text2)', marginBottom: 8, fontWeight: 500 }}>{t('landing.email')}</label>
          <input
            required
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="trade@example.com"
            style={{ width: '100%', padding: '14px 16px', borderRadius: 10, fontSize: 14 }}
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--tv-text2)', marginBottom: 8, fontWeight: 500 }}>{t('landing.password')}</label>
          <input
            required
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: '100%', padding: '14px 16px', borderRadius: 10, fontSize: 14 }}
          />
        </div>

        {error && <div style={{ color: '#F23645', marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', fontSize: 15, fontWeight: 600, color: '#fff', background: loading ? '#ccc' : '#089981', border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 24, transition: 'all 0.2s' }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0aab91'; }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = loading ? '#ccc' : '#089981'; }}>
          {loading ? (isLogin ? `${t('landing.loginButton')}...` : `${t('landing.signupButton')}...`) : (isLogin ? t('landing.loginButton') : t('landing.signupButton'))}
        </button>

        <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--tv-text3)' }}>
          {isLogin ? `${t('landing.switchToSignup').split('?')[0]}? ` : `${t('landing.switchToLogin').split('?')[0]}? `}
          <span 
            onClick={() => !loading && onSwitch(isLogin ? 'signup' : 'login')}
            style={{ color: '#089981', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600 }}
          >
            {isLogin ? t('landing.signup') : t('landing.login')}
          </span>
        </div>
      </form>
    </div>
  );
}
