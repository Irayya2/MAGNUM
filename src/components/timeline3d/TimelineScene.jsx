import React, { useState, useEffect } from 'react';
import { Timeline2D } from './Timeline2D';
import { Scene3D }    from './Scene3D';

/* ─── Main exported component ────────────────────────────────────────────── */
export function TimelineScene() {
  // Default to 3D view, with CODING EVENT (0) as the initial selected destination or harbor state
  const [view, setView] = useState('3d');
  const [selectedDestination, setSelectedDestination] = useState(0);

  // Sync view with the HTML navbar toggle buttons via custom events
  useEffect(() => {
    const handleSetView = (e) => setView(e.detail);
    window.addEventListener('timeline:setView', handleSetView);
    return () => window.removeEventListener('timeline:setView', handleSetView);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('timeline:viewChanged', { detail: view }));
  }, [view]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
      <style>{`
        @keyframes tl-bounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(4px); }
        }
        @keyframes tl-fade-in {
          from { opacity:0; transform: translateY(10px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes tl-card-swap {
          0%   { opacity: 0; transform: translateY(16px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* ── 2D Schedule View ── */}
      {view === '2d' && (
        <div style={{ position: 'absolute', inset: 0, animation: 'tl-fade-in 0.35s ease' }}>
          <Timeline2D
            view={view}
            setView={setView}
            selectedDestination={selectedDestination}
            setSelectedDestination={setSelectedDestination}
          />
        </div>
      )}

      {/* ── 3D Harbor / Sailing View ── */}
      {view === '3d' && (
        <div style={{ position: 'absolute', inset: 0, animation: 'tl-fade-in 0.35s ease' }}>
          <Scene3D
            view={view}
            setView={setView}
            selectedDestination={selectedDestination}
            setSelectedDestination={setSelectedDestination}
          />
        </div>
      )}
    </div>
  );
}
