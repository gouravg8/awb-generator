import React from 'react';
import type { AWBSettings } from '../types';

interface Props {
  settings: AWBSettings;
  onChange: (s: AWBSettings) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<Props> = ({ settings, onChange, onClose }) => {
  const update = (key: keyof AWBSettings, value: boolean | number | string) => {
    onChange({ ...settings, [key]: value });
  };

  const Toggle: React.FC<{ label: string; subtext?: string; checked: boolean; onToggle: () => void }> = ({
    label, subtext, checked, onToggle,
  }) => (
    <div className="toggle-row" onClick={onToggle}>
      <div className="toggle-label">
        <span className="toggle-name">{label}</span>
        {subtext && <span className="toggle-sub">{subtext}</span>}
      </div>
      <div className={`toggle-switch ${checked ? 'on' : ''}`}>
        <div className="toggle-knob" />
      </div>
    </div>
  );


  const Input: React.FC<{ label: string; prefix: string; onToggle: () => void }> = ({
    label, prefix, onToggle,
  }) => (
    <div className="toggle-row" onClick={onToggle}>
      <div className="toggle-label">
        <span className="toggle-name">{label}</span>
      </div>
      <div className={`toggle-switch`}>
        <input placeholder={label} value={prefix} />
      </div>
    </div>
  );

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <span className="settings-title">Configuration</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-section">
          <label className="section-label">MAX LENGTH</label>
          <div className="length-control">
            <input
              type="range"
              min={4}
              max={32}
              value={settings.maxLength}
              onChange={e => update('maxLength', Number(e.target.value))}
              className="range-slider"
            />
            <span className="length-value">{settings.maxLength}</span>
          </div>
          <div className="range-ticks">
            <span>4</span><span>16</span><span>32</span>
          </div>
        </div>

        <div className="settings-section">
          <label className="section-label">CHARACTER SET</label>
          <div className="toggles-list">
            <Toggle
              label="Uppercase"
              subtext="A – Z"
              checked={settings.includeUppercase}
              onToggle={() => update('includeUppercase', !settings.includeUppercase)}
            />
            <Toggle
              label="Lowercase"
              subtext="a – z"
              checked={settings.includeLowercase}
              onToggle={() => update('includeLowercase', !settings.includeLowercase)}
            />
            <Toggle
              label="Numbers"
              subtext="0 – 9"
              checked={settings.includeNumbers}
              onToggle={() => update('includeNumbers', !settings.includeNumbers)}
            />
          </div>
        </div>

        <div className="settings-section">
          <label className="section-label">SPECIAL CHARACTERS</label>
          <div className="toggles-list">
            <Toggle
              label="Hyphen"
              subtext="–"
              checked={settings.includeHyphen}
              onToggle={() => update('includeHyphen', !settings.includeHyphen)}
            />
            <Toggle
              label="Underscore"
              subtext="_"
              checked={settings.includeUnderscore}
              onToggle={() => update('includeUnderscore', !settings.includeUnderscore)}
            />
          </div>
        </div>


        <div className="settings-section">
          <label className="section-label">Prefix, Suffix</label>
          <div className="toggles-list">
            <Input
              label='Prefix'
              prefix={settings.prefix}
              onToggle={() => update("prefix", settings.prefix)}
            />
            <Toggle
              label="Underscore"
              subtext="_"
              checked={settings.includeUnderscore}
              onToggle={() => update('includeUnderscore', !settings.includeUnderscore)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
