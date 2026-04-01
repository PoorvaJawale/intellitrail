import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

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
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const hydrateFromSession = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return;

      if (!email && user.email) setEmail(user.email);
      const md = user.user_metadata || {};
      if (!fullName && md.full_name) setFullName(md.full_name);
      if (!phone && md.phone) setPhone(md.phone);
    };
    hydrateFromSession();
  }, []);

  const saveProfile = async () => {
    setProfileErr('');
    setProfileMsg('');
    try {
      localStorage.setItem('profile_full_name', fullName);
      localStorage.setItem('profile_email', email);
      localStorage.setItem('profile_phone', phone);

      const { error } = await supabase.auth.updateUser({
        email: email || undefined,
        data: {
          full_name: fullName,
          phone,
        },
      });

      if (error) {
        setProfileErr(error.message);
        return;
      }

      setProfileMsg('Profile updated successfully.');
      setIsEditingProfile(false);
    } catch (e) {
      setProfileErr('Failed to update profile.');
    }
  };

  const changePassword = async () => {
    setPasswordErr('');
    setPasswordMsg('');

    if (newPassword.length < 6) {
      setPasswordErr('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErr('Passwords do not match.');
      return;
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);

    if (error) {
      setPasswordErr(error.message);
      return;
    }

    setNewPassword('');
    setConfirmPassword('');
    setPasswordMsg('Password updated successfully.');
  };

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
              disabled={!isEditingProfile}
              placeholder="Enter full name"
              style={{ width: '100%', padding: '9px 10px', borderRadius: 8, opacity: isEditingProfile ? 1 : 0.8 }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--tv-text3)', marginBottom: 6 }}>Email</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isEditingProfile}
              placeholder="name@example.com"
              style={{ width: '100%', padding: '9px 10px', borderRadius: 8, opacity: isEditingProfile ? 1 : 0.8 }}
            />
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--tv-text3)', marginBottom: 6 }}>Phone</div>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isEditingProfile}
              placeholder="+91 XXXXX XXXXX"
              style={{ width: '100%', padding: '9px 10px', borderRadius: 8, opacity: isEditingProfile ? 1 : 0.8 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {!isEditingProfile ? (
              <button
                onClick={() => { setProfileErr(''); setProfileMsg(''); setIsEditingProfile(true); }}
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
                Edit Details
              </button>
            ) : (
              <>
                <button
                  onClick={saveProfile}
                  style={{
                    border: '1px solid rgba(8,153,129,0.35)',
                    background: 'rgba(8,153,129,0.15)',
                    color: '#089981',
                    borderRadius: 8,
                    padding: '8px 10px',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => { setIsEditingProfile(false); setProfileErr(''); setProfileMsg(''); }}
                  style={{
                    border: '1px solid var(--tv-border)',
                    background: 'transparent',
                    color: 'var(--tv-text2)',
                    borderRadius: 8,
                    padding: '8px 10px',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {profileMsg && <div style={{ marginTop: 10, fontSize: 11, color: '#089981' }}>{profileMsg}</div>}
          {profileErr && <div style={{ marginTop: 10, fontSize: 11, color: '#F23645' }}>{profileErr}</div>}
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
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--tv-text3)', marginBottom: 6 }}>New Password</div>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              style={{ width: '100%', padding: '9px 10px', borderRadius: 8 }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--tv-text3)', marginBottom: 6 }}>Confirm Password</div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              style={{ width: '100%', padding: '9px 10px', borderRadius: 8 }}
            />
          </div>
          <button
            onClick={changePassword}
            disabled={savingPassword}
            style={{
              border: '1px solid var(--tv-border)',
              background: 'var(--tv-bg3)',
              color: 'var(--tv-text)',
              borderRadius: 8,
              padding: '8px 10px',
              cursor: savingPassword ? 'wait' : 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {savingPassword ? 'Updating…' : 'Change Password'}
          </button>
          {passwordMsg && <div style={{ marginTop: 10, fontSize: 11, color: '#089981' }}>{passwordMsg}</div>}
          {passwordErr && <div style={{ marginTop: 10, fontSize: 11, color: '#F23645' }}>{passwordErr}</div>}
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
