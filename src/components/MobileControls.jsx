import React from 'react';

export default function MobileControls() {
  const triggerKey = (key, type) => {
    window.dispatchEvent(new KeyboardEvent(type, { key }));
  };

  const btnProps = (key) => ({
    onTouchStart: (e) => { e.preventDefault(); triggerKey(key, 'keydown'); },
    onTouchEnd: (e) => { e.preventDefault(); triggerKey(key, 'keyup'); },
    onMouseDown: (e) => { e.preventDefault(); triggerKey(key, 'keydown'); },
    onMouseUp: (e) => { e.preventDefault(); triggerKey(key, 'keyup'); },
    onMouseLeave: (e) => { e.preventDefault(); triggerKey(key, 'keyup'); }
  });

  return (
    <div className="mobile-controls-container">
      <div className="d-pad">
        <div className="d-pad-row">
          <button className="mc-btn" {...btnProps('w')}>W</button>
        </div>
        <div className="d-pad-row">
          <button className="mc-btn" {...btnProps('a')}>A</button>
          <button className="mc-btn" {...btnProps('s')}>S</button>
          <button className="mc-btn" {...btnProps('d')}>D</button>
        </div>
      </div>
      
      <div className="action-pad">
        <div className="action-row">
          <button className="mc-btn action-btn" {...btnProps('l')}>L</button>
          <button className="mc-btn action-btn highlight" {...btnProps('e')}>E</button>
        </div>
        <div className="action-row">
          <button className="mc-btn action-btn wide" {...btnProps(' ')}>Drift</button>
        </div>
      </div>
    </div>
  );
}
