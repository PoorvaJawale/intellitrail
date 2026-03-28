import React, { useEffect, useState } from 'react';

const card = {
  background: 'var(--tv-bg2)',
  border: '1px solid var(--tv-border)',
  borderRadius: 10,
  padding: 16,
};

export default function AccountView({ status, username, onLogout, language }) {
  const [fullName, setFullName] = useState(() => localStorage.getItem('profile_full_name') || '');
  const [email, setEmail] = useState(() => localStorage.getItem('profile_email') || '');
  const [phone, setPhone] = useState(() => localStorage.getItem('profile_phone') || '');

  useEffect(() => {
    localStorage.setItem('profile_full_name', fullName);
  }, [fullName]);

  useEffect(() => {
    localStorage.setItem('profile_email', email);
  }, [email]);

  useEffect(() => {
    localStorage.setItem('profile_phone', phone);
  }, [phone]);

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--tv-bg)', padding: 16 }}>
      <div style={{ fontSize: 12, color: 'var(--tv-text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
        Account
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, maxWidth: 900 }}>
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tv-text)', marginBottom: 10 }}>Profile</div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--tv-text3)', marginBottom: 6 }}>Username (permanent)</div>
            <input
              value={username || '—'}
              disabled
              style={{ width: '100%', padding: '9px 10px', borderRadius: 8, opacity: 0.8 }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--tv-text3)', marginBottom: 6 }}>Full Name</div>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              style={{ width: '100%', padding: '9px 10px', borderRadius: 8 }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--tv-text3)', marginBottom: 6 }}>Email</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={{ width: '100%', padding: '9px 10px', borderRadius: 8 }}
            />
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--tv-text3)', marginBottom: 6 }}>Phone</div>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              style={{ width: '100%', padding: '9px 10px', borderRadius: 8 }}
            />
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tv-text)', marginBottom: 10 }}>Workspace</div>
          <div style={{ fontSize: 12, color: 'var(--tv-text2)', marginBottom: 5 }}>
            API: <span style={{ color: status ? '#089981' : '#6b7280' }}>{status ? 'Online' : 'Offline'}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--tv-text2)', marginBottom: 5 }}>Mode: {status?.mode || 'Backtest'}</div>
          <div style={{ fontSize: 12, color: 'var(--tv-text2)' }}>Language: {language?.toUpperCase?.() || 'EN'}</div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tv-text)', marginBottom: 10 }}>Security</div>
          <div style={{ fontSize: 12, color: 'var(--tv-text2)', marginBottom: 8 }}>Password: ••••••••</div>
          <button
            style={{
              border: '1px solid var(--tv-border)',
              background: 'var(--tv-bg3)',
              color: 'var(--tv-text)',
              borderRadius: 8,
              padding: '8px 10px',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Change Password (UI)
          </button>
        </div>

        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tv-text)', marginBottom: 10 }}>Session</div>
          <div style={{ fontSize: 12, color: 'var(--tv-text2)', marginBottom: 10 }}>
            Manage your active login and account session.
          </div>
          <button
            onClick={onLogout}
            style={{
              border: '1px solid rgba(242,54,69,0.35)',
              background: 'transparent',
              color: '#F23645',
              borderRadius: 8,
              padding: '8px 10px',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
