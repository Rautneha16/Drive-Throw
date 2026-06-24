import React from 'react';
import MobileControls from './MobileControls';

export default function HUD({ speed, zone, isNight, onToggleTheme, onToggleMusic, activeKeys }) {
  return (
    <div id="hud">
      <div className="hud-name">NEHA RAUT</div>
      <div className="hud-role">IT Engineer (B.Tech)</div>

      <div className="top-right-group">
        <button className="hud-btn" onClick={onToggleTheme}>
          {isNight ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
        <button className="hud-btn" onClick={onToggleMusic}>
          🎵 Play Music
        </button>
      </div>

      <div className="hud-controls">
        <div className="ctrl-group">
          <div className="ctrl-row">
            <div className={`ctrl-key ${activeKeys.includes('w') ? 'active' : ''}`}>W</div>
          </div>
          <div className="ctrl-row">
            <div className={`ctrl-key ${activeKeys.includes('a') ? 'active' : ''}`}>A</div>
            <div className={`ctrl-key ${activeKeys.includes('s') ? 'active' : ''}`}>S</div>
            <div className={`ctrl-key ${activeKeys.includes('d') ? 'active' : ''}`}>D</div>
          </div>
          <div className="ctrl-label">Drive & Explore</div>
        </div>
      </div>

      <div className="hud-zone">
        <div className="zone-label">Nearby Region</div>
        <div className="zone-name">{zone ? zone.label : 'SAKURA FIELD'}</div>
        <div className="zone-hint">{zone ? 'Press E to view info' : 'Drive around'}</div>
      </div>

      <div className="hud-speed">
        <div className="speed-val">{speed}</div>
        <div className="speed-unit">km/h</div>
      </div>

      <div className="hud-info">
        <div className="info-btn">i</div>
        <div className="info-tooltip">
          <strong>Controls:</strong><br />
          W/A/S/D — Drive<br />
          Space — Drift<br />
          L — Car Lights<br />
          H — Horn<br />
          M — Toggle Music<br />
          T — Theme (Light/Dark)<br />
          E — Open Info Panel
        </div>
      </div>
      <MobileControls />
    </div>
  );
}
