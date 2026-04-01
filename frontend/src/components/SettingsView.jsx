import React from 'react';
import { LANGUAGE_OPTIONS } from '../i18n';

const card = {
  background: 'var(--tv-bg2)',
  border: '1px solid var(--tv-border)',
  borderRadius: 10,
  padding: 16,
};

const themeChip = (active) => ({
  border: '1px solid var(--tv-border)',
  background: active ? 'var(--tv-bg3)' : 'transparent',
  color: active ? 'var(--tv-text)' : 'var(--tv-text2)',
  borderRadius: 18,
  padding: '8px 12px',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
});

export default function SettingsView({ theme, themeMode, onThemeModeChange, language, onLanguageChange, t }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--tv-bg)', padding: 16 }}>
      <div style={{ fontSize: 12, color: 'var(--tv-text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
        {t('settings.title')}
      </div>
      <div style={{ fontSize: 13, color: 'var(--tv-text2)', marginBottom: 14 }}>
        {t('settings.subtitle')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12, maxWidth: 980 }}>
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tv-text)', marginBottom: 12 }}>
            {t('settings.appearance')}
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--tv-text)', marginBottom: 8 }}>{t('settings.themeMode')}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => onThemeModeChange('auto')} style={themeChip(themeMode === 'auto')}>{t('settings.auto')}</button>
              <button onClick={() => onThemeModeChange('light')} style={themeChip(themeMode === 'light')}>{t('settings.light')}</button>
              <button onClick={() => onThemeModeChange('dark')} style={themeChip(themeMode === 'dark')}>{t('settings.dark')}</button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--tv-text2)', marginTop: 8 }}>
              {t('settings.activeTheme')}: <span style={{ color: 'var(--tv-text)' }}>{theme === 'dark' ? t('settings.dark') : t('settings.light')}</span>
            </div>
          </div>

        </div>

        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tv-text)', marginBottom: 12 }}>
            {t('settings.languageRegion')}
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--tv-text)', marginBottom: 7 }}>{t('settings.appLanguage')}</div>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              style={{ width: '100%', maxWidth: 280, padding: '10px 12px', borderRadius: 8 }}
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div style={{ fontSize: 11, color: 'var(--tv-text2)', marginTop: 8 }}>
              {t('settings.note')}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
