import React, { useState, useEffect, useCallback } from 'react';
import QRCode from './components/QRCode';
import SettingsPanel from './components/SettingsPanel';
import { generateAWB } from './utils/awbGenerator';
import type { AWBSettings } from './types';
import { DEFAULT_SETTINGS, normalizeAWBSettings } from './types';
import './App.css';

type CopyState = 'idle' | 'copied' | 'error';

const App: React.FC = () => {
  const [settings, setSettings] = useState<AWBSettings>(DEFAULT_SETTINGS);
  const [awb, setAwb] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get('awb_settings', (result: Record<string, Partial<AWBSettings>>) => {
        if (result.awb_settings) setSettings(normalizeAWBSettings(result.awb_settings));
      });
    } else {
      try {
        const stored = localStorage.getItem('awb_settings');
        if (stored) setSettings(normalizeAWBSettings(JSON.parse(stored)));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!awb) refresh();
  }, [settings]);

  const saveSettings = (s: AWBSettings) => {
    setSettings(s);
    // Save to chrome.storage so content script picks it up too
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ awb_settings: s });
    } else {
      localStorage.setItem('awb_settings', JSON.stringify(s));
    }
  };

  const refresh = useCallback(() => {
    setIsAnimating(true);
    setCopyState('idle');
    setTimeout(() => {
      setAwb(generateAWB(settings));
      setIsAnimating(false);
    }, 180);
  }, [settings]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(awb);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2000);
    }
  };

  const copyLabel = copyState === 'copied' ? '✓ Copied' : copyState === 'error' ? '✗ Failed' : 'Copy';

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="logo-mark">AWB</div>
          <div className="header-text">
            <span className="app-name">Generator</span>
            <span className="app-sub">Airway Bill</span>
          </div>
        </div>
        <button className="settings-btn" onClick={() => setShowSettings(true)} title="Settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      {/* Main Card — QR left, AWB right */}
      <div className="main">
        <div className="awb-card">
          {/* QR always visible */}
          <div className={`qr-col ${isAnimating ? 'animating' : ''}`}>
            {awb && <QRCode value={awb} size={112} fg="#f0ede8" bg="#1a1917" />}
          </div>

          {/* AWB info */}
          <div className="awb-col">
            <div className="awb-label">
              <span className="dot" />
              AIRWAY BILL
            </div>
            <div className={`awb-number ${isAnimating ? 'animating' : ''}`}>
              {awb || '—'}
            </div>
            <div className="awb-meta">
              <span>{awb.length} chars</span>
              <span className="meta-sep">·</span>
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Actions inline */}
            <div className="actions">
              <button className="btn-refresh" onClick={refresh} title="Regenerate">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                New
              </button>

              <button className={`btn-copy ${copyState}`} onClick={handleCopy} disabled={!awb}>
                {copyState === 'copied' ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                )}
                {copyLabel}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <span>Max <strong>{settings.maxLength}</strong> chars</span>
        <span className="footer-sep">·</span>
        <span>
          {[
            settings.includeUppercase && 'A–Z',
            settings.includeLowercase && 'a–z',
            settings.includeNumbers && '0–9',
            settings.includeHyphen && '-',
            settings.includeUnderscore && '_',
          ].filter(Boolean).join(' ')}
        </span>
      </div>

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={saveSettings}
          onClose={() => { setShowSettings(false); refresh(); }}
        />
      )}
    </div>
  );
};

export default App;
