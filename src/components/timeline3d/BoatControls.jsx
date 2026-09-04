import React, { useState, useRef, useEffect } from 'react';

export function BoatControls({ selectedDestination, onSelect }) {
  const [isMobile, setIsMobile] = useState(false);
  const activeIntervalRef = useRef(null);
  const activeTimeoutRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const stopMoving = () => {
    if (activeTimeoutRef.current) {
      clearTimeout(activeTimeoutRef.current);
      activeTimeoutRef.current = null;
    }
    if (activeIntervalRef.current) {
      clearInterval(activeIntervalRef.current);
      activeIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopMoving();
  }, []);

  const triggerMove = (direction) => {
    const delta = direction === 'forward' ? 35 : -35;

    // If user is at harbor overview (no destination selected), clicking forward launches boat
    if (selectedDestination === null || selectedDestination === undefined) {
      if (direction === 'forward') {
        onSelect?.(0);
      }
      return;
    }

    window.dispatchEvent(new CustomEvent('boat:move', { detail: { delta } }));
  };

  const startMoving = (direction, e) => {
    // Prevent context menus / text selection on touch
    if (e && e.cancelable) {
      // Don't call preventDefault on touch events if passive issues arise, but e.preventDefault for touchstart is fine
    }
    stopMoving();

    // Instant step move on initial press/tap
    triggerMove(direction);

    // After 220ms, start continuous sailing if button is held down
    activeTimeoutRef.current = setTimeout(() => {
      activeIntervalRef.current = setInterval(() => {
        const stepDelta = direction === 'forward' ? 18 : -18;
        if (selectedDestination !== null && selectedDestination !== undefined) {
          window.dispatchEvent(new CustomEvent('boat:move', { detail: { delta: stepDelta } }));
        }
      }, 40);
    }, 220);
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: isMobile ? 18 : 28,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        pointerEvents: 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation',
      }}
    >
      {/* Control Label Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: isMobile ? 9 : 10,
          fontWeight: 800,
          color: '#facc15',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          background: 'rgba(10, 20, 38, 0.85)',
          backdropFilter: 'blur(12px)',
          padding: '3px 10px',
          borderRadius: 999,
          border: '1px solid rgba(250, 204, 21, 0.3)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}
      >
        <span style={{ animation: 'tl-bounce 1.5s infinite ease-in-out' }}>⛵</span>
        <span>{isMobile ? 'BOAT CONTROLS (TAP OR HOLD)' : 'BOAT NAVIGATION'}</span>
      </div>

      {/* Button Group Pod */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 8 : 12,
          background: 'rgba(8, 16, 32, 0.92)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(250, 204, 21, 0.45)',
          borderRadius: 999,
          padding: isMobile ? '6px 10px' : '8px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.65), 0 0 20px rgba(250, 204, 21, 0.18)',
        }}
      >
        {/* Backward Button */}
        <button
          type="button"
          aria-label="Move Boat Backward"
          onMouseDown={(e) => startMoving('backward', e)}
          onMouseUp={stopMoving}
          onMouseLeave={stopMoving}
          onTouchStart={(e) => startMoving('backward', e)}
          onTouchEnd={stopMoving}
          onTouchCancel={stopMoving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(250, 204, 21, 0.35)',
            borderRadius: 999,
            color: '#fef08a',
            padding: isMobile ? '10px 18px' : '10px 22px',
            fontSize: isMobile ? 12 : 13,
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            letterSpacing: '0.04em',
            transition: 'all 0.15s ease',
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            outline: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(250, 204, 21, 0.8)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            stopMoving();
            e.currentTarget.style.borderColor = 'rgba(250, 204, 21, 0.35)';
            e.currentTarget.style.color = '#fef08a';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <span style={{ fontSize: isMobile ? 14 : 16 }}>◀</span>
          <span>Move Back</span>
        </button>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: isMobile ? 24 : 28,
            background: 'rgba(250, 204, 21, 0.25)',
          }}
        />

        {/* Forward Button */}
        <button
          type="button"
          aria-label="Move Boat Forward"
          onMouseDown={(e) => startMoving('forward', e)}
          onMouseUp={stopMoving}
          onMouseLeave={stopMoving}
          onTouchStart={(e) => startMoving('forward', e)}
          onTouchEnd={stopMoving}
          onTouchCancel={stopMoving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
            border: '1px solid #fef08a',
            borderRadius: 999,
            color: '#020617',
            padding: isMobile ? '10px 18px' : '10px 22px',
            fontSize: isMobile ? 12 : 13,
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            letterSpacing: '0.04em',
            transition: 'all 0.15s ease',
            boxShadow: '0 4px 16px rgba(250, 204, 21, 0.4)',
            outline: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(250, 204, 21, 0.6)';
          }}
          onMouseLeave={(e) => {
            stopMoving();
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(250, 204, 21, 0.4)';
          }}
        >
          <span>Move Ahead</span>
          <span style={{ fontSize: isMobile ? 14 : 16 }}>▶</span>
        </button>
      </div>
    </div>
  );
}
