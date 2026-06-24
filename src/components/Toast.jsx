import React, { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  return (
    <div id="toast" className={toast ? 'show' : ''}>
      <div className="toast-title">{toast?.title}</div>
      <div className="toast-sub">{toast?.sub}</div>
    </div>
  );
}
