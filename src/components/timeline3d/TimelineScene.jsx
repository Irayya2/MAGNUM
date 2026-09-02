import React, { useState } from 'react';
import { Timeline2D } from './Timeline2D';
import { Scene3D }    from './Scene3D';

/* ─── Main exported component ────────────────────────────────────────────── */
export function TimelineScene() {
  // Default to 3D — users immediately see the cinematic harbor
  const [view, setView] = useState('3d');

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
      `}</style>

      {/* ── 2D Schedule View ── */}
      {view === '2d' && (
        <div style={{ position: 'absolute', inset: 0, animation: 'tl-fade-in 0.35s ease' }}>
          <Timeline2D view={view} setView={setView} />
        </div>
      )}

      {/* ── 3D Harbor / Sailing View ── */}
      {view === '3d' && (
        <div style={{ position: 'absolute', inset: 0, animation: 'tl-fade-in 0.35s ease' }}>
          <Scene3D view={view} setView={setView} />
        </div>
      )}
    </div>
  );
}
