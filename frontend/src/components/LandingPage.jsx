import React, { useState } from 'react';

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

export default function LandingPage({ onLogin, theme, toggleTheme }) {
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
          <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--tv-text)', letterSpacing: '-0.04em' }}>IntelliTrail</span>
          <span style={{ fontSize: 10, color: '#089981', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 700, marginTop: 2 }}>AI Engine</span>
        </div>

        <div style={{ display: 'flex', gap: 35, fontSize: 14, fontWeight: 600 }}>
          <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', color: view === 'home' ? 'var(--tv-text)' : 'var(--tv-text2)', cursor: 'pointer', transition: 'color 0.2s', padding: 0 }}>Home</button>
          <button onClick={() => setView('about')} style={{ background: 'none', border: 'none', color: view === 'about' ? 'var(--tv-text)' : 'var(--tv-text2)', cursor: 'pointer', transition: 'color 0.2s', padding: 0 }}>About</button>
          <button onClick={() => setView('contacts')} style={{ background: 'none', border: 'none', color: view === 'contacts' ? 'var(--tv-text)' : 'var(--tv-text2)', cursor: 'pointer', transition: 'color 0.2s', padding: 0 }}>Contacts</button>
        </div>

        <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
          {/* Theme Toggle Component inside Landing Page */}
          <div onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--tv-text2)', fontSize: 12, marginRight: 10 }}>
            <div style={{ width: 32, height: 18, background: theme === 'dark' ? 'var(--tv-bg3)' : 'var(--tv-border)', borderRadius: 10, position: 'relative', transition: 'background 0.3s' }}>
              <div style={{ position: 'absolute', top: 2, left: theme === 'dark' ? 2 : 16, width: 14, height: 14, background: 'var(--tv-text)', borderRadius: '50%', transition: 'left 0.3s' }} />
            </div>
          </div>

          <button 
            onClick={() => setView('login')}
            style={{ padding: '8px 24px', fontSize: 13, fontWeight: 600, color: 'var(--tv-text)', background: 'transparent', border: '1px solid var(--tv-border)', borderRadius: 24, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--tv-text3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--tv-border)'}
          >
            Login
          </button>
          <button 
            onClick={() => setView('signup')}
            style={{ padding: '8px 24px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#089981', border: 'none', borderRadius: 24, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#0aab91'}
            onMouseLeave={e => e.currentTarget.style.background = '#089981'}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)' }}>
        {view === 'home' && <HomeView onGetStarted={() => setView('signup')} />}
        {view === 'about' && <AboutView />}
        {view === 'contacts' && <ContactsView />}
        {(view === 'login' || view === 'signup') && <AuthForm type={view} onSwitch={setView} onAuthSuccess={onLogin} />}
      </div>

    </div>
  );
}

// ── SUBCOMPONENTS ──

function HomeView({ onGetStarted }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ padding: '6px 16px', background: 'rgba(8,153,129,0.1)', border: '1px solid rgba(8,153,129,0.2)', borderRadius: 30, color: '#089981', fontSize: 12, fontWeight: 600, marginBottom: 30 }}>
        Next Generation Algorithmic Trading
      </div>
      
      <h1 style={{ fontSize: 72, fontWeight: 800, color: 'var(--tv-text)', lineHeight: 1.1, letterSpacing: '-0.04em', maxWidth: 800, marginBottom: 24 }}>
        Trade Smarter with<br />
        <span style={{ background: 'linear-gradient(90deg, #089981, #2962ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AI-Driven Insights
        </span>
      </h1>
      
      <p style={{ fontSize: 18, color: 'var(--tv-text2)', maxWidth: 650, lineHeight: 1.6, marginBottom: 40, fontWeight: 500 }}>
        IntelliTrail decodes market complexity. Execute algorithmic strategies effortlessly and monitor your portfolio with zero latency real-time insights.
      </p>

      <button 
        onClick={onGetStarted}
        style={{ padding: '18px 48px', fontSize: 16, fontWeight: 700, color: '#fff', background: '#089981', border: 'none', borderRadius: 30, cursor: 'pointer', boxShadow: '0 8px 30px rgba(8,153,129,0.3)', transition: 'all 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        Start Trading Now
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

function AboutView() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
      <div style={{ maxWidth: 800, background: 'var(--tv-bg2)', border: '1px solid var(--tv-border)', borderRadius: 24, padding: 50, backdropFilter: 'blur(20px)' }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: 'var(--tv-text)', marginBottom: 24, letterSpacing: '-0.02em' }}>About IntelliTrail</h2>
        <p style={{ fontSize: 16, color: 'var(--tv-text2)', lineHeight: 1.7, marginBottom: 20 }}>
          IntelliTrail was born from a singular vision: to democratize advanced algorithmic trading. For too long, high-frequency quant strategies and machine learning models were exclusively the domain of Wall Street institutions.
        </p>
        <p style={{ fontSize: 16, color: 'var(--tv-text2)', lineHeight: 1.7 }}>
          By leveraging cutting-edge web technologies and a powerful backend AI Engine, IntelliTrail bridges the gap, offering retail traders a lightning-fast interface to deploy, manage, and backtest automated trading strategies across global equity markets in real-time.
        </p>
      </div>
    </div>
  );
}

function ContactsView() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
      <div style={{ maxWidth: 600, width: '100%', background: 'var(--tv-bg2)', border: '1px solid var(--tv-border)', borderRadius: 24, padding: 50, backdropFilter: 'blur(20px)' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--tv-text)', marginBottom: 12, letterSpacing: '-0.02em' }}>Get in Touch</h2>
        <p style={{ fontSize: 15, color: 'var(--tv-text2)', marginBottom: 30 }}>Have questions about our AI models or API access? Reach out to us.</p>
        
        <form onSubmit={e => e.preventDefault()}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--tv-text2)', marginBottom: 8, fontWeight: 500 }}>Name</label>
            <input required type="text" placeholder="Jane Doe" style={{ width: '100%', padding: '14px 16px', borderRadius: 10, fontSize: 14 }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--tv-text2)', marginBottom: 8, fontWeight: 500 }}>Email</label>
            <input required type="email" placeholder="jane@example.com" style={{ width: '100%', padding: '14px 16px', borderRadius: 10, fontSize: 14 }} />
          </div>
          <div style={{ marginBottom: 30 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--tv-text2)', marginBottom: 8, fontWeight: 500 }}>Message</label>
            <textarea required rows="4" placeholder="How can we help?" style={{ width: '100%', padding: '14px 16px', background: 'var(--tv-bg)', border: '1px solid var(--tv-border)', borderRadius: 10, color: 'var(--tv-text)', fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '16px', fontSize: 15, fontWeight: 600, color: '#fff', background: '#089981', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}

function AuthForm({ type, onSwitch, onAuthSuccess }) {
  const isLogin = type === 'login';
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      localStorage.setItem('isLoggedIn', 'true');
      onAuthSuccess(); // Bypass real auth and jump to dashboard
    } else {
      // Simulate storing data to database
      localStorage.setItem('hasAccount', 'true');
      onSwitch('login'); // Redirect new user to login page
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400, background: 'var(--tv-bg2)', border: '1px solid var(--tv-border)', borderRadius: 24, padding: 40, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--tv-text)', marginBottom: 8, letterSpacing: '-0.02em' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p style={{ fontSize: 14, color: 'var(--tv-text3)' }}>
            {isLogin ? 'Enter your credentials to access your dashboard.' : 'Join IntelliTrail and start algorithmic trading.'}
          </p>
        </div>

        {!isLogin && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--tv-text2)', marginBottom: 8, fontWeight: 500 }}>Full Name</label>
            <input required type="text" placeholder="John Doe" style={{ width: '100%', padding: '14px 16px', borderRadius: 10, fontSize: 14 }} />
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--tv-text2)', marginBottom: 8, fontWeight: 500 }}>Email</label>
          <input required type="email" placeholder="trade@example.com" style={{ width: '100%', padding: '14px 16px', borderRadius: 10, fontSize: 14 }} />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--tv-text2)', marginBottom: 8, fontWeight: 500 }}>Password</label>
          <input required type="password" placeholder="••••••••" style={{ width: '100%', padding: '14px 16px', borderRadius: 10, fontSize: 14 }} />
        </div>

        <button type="submit" style={{ width: '100%', padding: '16px', fontSize: 15, fontWeight: 600, color: '#fff', background: '#089981', border: 'none', borderRadius: 10, cursor: 'pointer', marginBottom: 24, transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#0aab91'}
          onMouseLeave={e => e.currentTarget.style.background = '#089981'}>
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--tv-text3)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => onSwitch(isLogin ? 'signup' : 'login')}
            style={{ color: '#089981', cursor: 'pointer', fontWeight: 600 }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </div>
      </form>
    </div>
  );
}
