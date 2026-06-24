import React, { useEffect, useState } from 'react';

export default function Loader({ progress, isReady }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (isReady) {
      const timer = setTimeout(() => setHidden(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  return (
    <div id="loader" className={hidden ? 'hidden' : ''}>
      <div className="loader-title">NEHA RAUT</div>
      <div className="loader-sub">Interactive 3D Portfolio</div>
      <div className="loader-bar-wrap">
        <div className="loader-bar" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="loader-hint">
        {isReady ? 'Press Any Key or Click to Start' : 'Spawning Environment...'}
      </div>
    </div>
  );
}
