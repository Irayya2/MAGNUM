import React from 'react';

const toggleStyles = {
  wrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: 'rgba(2,6,23,0.80)',
    border: '1px solid rgba(56,189,248,0.22)',
    borderRadius: 999,
    padding: 4,
    backdropFilter: 'blur(16px)',
    boxShadow: '0 4px 28px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.06)',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '8px 22px',
    borderRadius: 999,
    border: 'none',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.05em',
    fontFamily: "'Inter','Segoe UI',sans-serif",
    transition: 'all 0.22s ease',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  },
  btnActive: {
    background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
    color: '#020617',
    boxShadow: '0 2px 14px rgba(56,189,248,0.4)',
  },
  btnInactive: {
    background: 'transparent',
    color: '#94a3b8',
  },
};

export function ViewToggle({ view, setView }) {
  return (
    <div style={toggleStyles.wrapper}>
      {[
        { id: '3d', label: '3D View', icon: '⛵' },
        { id: '2d', label: '2D View', icon: '📋' },
      ].map((tab) => {
        const isActive = view === tab.id;
        return (
          <button
            key={tab.id}
            id={`view-toggle-${tab.id}`}
            onClick={() => setView(tab.id)}
            aria-pressed={isActive}
            style={{
              ...toggleStyles.btn,
              ...(isActive ? toggleStyles.btnActive : toggleStyles.btnInactive),
            }}
          >
            <span style={{ fontSize: 16 }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
