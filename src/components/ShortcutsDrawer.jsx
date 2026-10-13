import React from 'react';
import ShortcutGrid from './ShortcutGrid';

export default function ShortcutsDrawer({ open, onClose, activeType, onSelectType, activePurok, onSelectPurok, activeSeverity, onSelectSeverity }) {
  return (
    <>
      {/* Backdrop */}
      {open && <div className="drawer-backdrop" onClick={onClose} />}

      {/* Drawer */}
      <div className={`shortcuts-drawer ${open ? 'open' : ''}`}>
        <div className="drawer-header">
          <span>⚡ POS Shortcuts</span>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>
        <div className="drawer-body">
          <ShortcutGrid
            activeType={activeType}       onSelectType={onSelectType}
            activePurok={activePurok}     onSelectPurok={onSelectPurok}
            activeSeverity={activeSeverity} onSelectSeverity={onSelectSeverity}
          />
        </div>
      </div>
    </>
  );
}
