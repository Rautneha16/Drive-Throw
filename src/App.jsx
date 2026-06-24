import React, { useState, useEffect, useRef } from 'react';
import Loader from './components/Loader';
import HUD from './components/HUD';
import Panel from './components/Panel';
import Toast from './components/Toast';
import Canvas3D from './components/Canvas3D';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [zone, setZone] = useState(null);
  const [isNight, setIsNight] = useState(true);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [activeKeys, setActiveKeys] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelData, setPanelData] = useState(null);
  const [toast, setToast] = useState(null);
  const audioRef = useRef(null);

  // Global Key listeners for App-level UI (E to open, Esc to close panel, etc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      setActiveKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
      
      // Panel toggle (E)
      if (key === 'e' && zone && !panelOpen) {
        setPanelData(zone);
        setPanelOpen(true);
      }
      // Close panel (Esc)
      if (e.key === 'Escape') setPanelOpen(false);
      // Theme toggle (T)
      if (key === 't') handleToggleTheme();
      // Music toggle (M)
      if (key === 'm') handleToggleMusic();
    };

    const handleKeyUp = (e) => {
      setActiveKeys((prev) => prev.filter((k) => k !== e.key.toLowerCase()));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [zone, panelOpen, isNight, musicPlaying]);

  const handleToggleTheme = () => {
    setIsNight((prev) => {
      const next = !prev;
      document.body.classList.toggle('dark-mode', next);
      return next;
    });
  };

  const handleToggleMusic = () => {
    if (!audioRef.current) return;
    if (musicPlaying) {
      audioRef.current.pause();
      setToast({ title: 'Audio Paused', sub: 'Music stopped' });
    } else {
      audioRef.current.play().catch(e => console.warn('Audio play failed', e));
      setToast({ title: 'Now Playing', sub: 'Bairan - Lofi Mix' });
    }
    setMusicPlaying(!musicPlaying);
  };

  return (
    <div className="app-container">
      <audio ref={audioRef} src="/Bairan.mp3" loop />
      <Loader progress={progress} isReady={isReady} />
      <HUD
        speed={speed}
        zone={zone}
        isNight={isNight}
        onToggleTheme={handleToggleTheme}
        onToggleMusic={handleToggleMusic}
        activeKeys={activeKeys}
      />
      <Panel isOpen={panelOpen} onClose={() => setPanelOpen(false)} panelData={panelData} />
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      <Canvas3D 
        onProgress={setProgress}
        onReady={() => setIsReady(true)}
        onSpeedChange={setSpeed}
        onZoneChange={setZone}
        onToast={(title, sub) => setToast({ title, sub })}
        isNight={isNight}
        panelOpen={panelOpen}
      />
    </div>
  );
}
