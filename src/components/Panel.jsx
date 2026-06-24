import React from 'react';

export default function Panel({ isOpen, onClose, panelData }) {
  if (!isOpen || !panelData) return null;

  return (
    <div id="panel" className={isOpen ? 'open' : ''}>
      <div className="panel-inner">
        <button className="panel-close" onClick={onClose} title="Close Panel">✕</button>
        <div className="panel-tag">{panelData.tag || 'Zone Info'}</div>
        <h2 className="panel-title">{panelData.title}</h2>
        <div className="panel-body" dangerouslySetInnerHTML={{ __html: panelData.body?.replace(/\n/g, '<br/>') }}></div>
        <div dangerouslySetInnerHTML={{ __html: panelData.extraHTML }}></div>
      </div>
    </div>
  );
}
