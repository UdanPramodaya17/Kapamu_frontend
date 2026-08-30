import React from 'react';
import { AlertCircle, CalendarX } from 'lucide-react';

export default function SlotPicker({ slots = [], selectedSlot, onSelectSlot, loading, reason }) {

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '2.5rem 1rem', gap: '0.75rem',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          border: '2.5px solid rgba(0,0,0,0.08)',
          borderTopColor: '#000000',
          animation: 'spin 0.7s linear infinite',
        }} />
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.8rem', color: 'rgba(0,0,0,0.4)', fontWeight: 500, margin: 0,
        }}>Checking availability...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── No slots / closed / reason ───────────────────────────────────
  if (reason || slots.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '2rem 1rem', gap: '0.75rem',
        background: 'rgba(0,0,0,0.015)', borderRadius: '12px',
        border: '1px dashed rgba(0,0,0,0.1)',
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.04)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <CalendarX size={20} color="rgba(0,0,0,0.3)" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700, fontSize: '0.85rem', color: '#000000', margin: '0 0 0.25rem 0',
          }}>
            {reason ? 'Not available' : 'No slots available'}
          </p>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)', margin: 0,
          }}>
            {reason || 'Try a different date or stylist'}
          </p>
        </div>
      </div>
    );
  }

  // ── Split by period ──────────────────────────────────────────────
  const morning   = slots.filter(s => parseInt(s.startTime) < 12);
  const afternoon = slots.filter(s => parseInt(s.startTime) >= 12 && parseInt(s.startTime) < 17);
  const evening   = slots.filter(s => parseInt(s.startTime) >= 17);

  const periods = [
    { title: 'Morning',   emoji: '☀️',  items: morning   },
    { title: 'Afternoon', emoji: '🌤️', items: afternoon },
    { title: 'Evening',   emoji: '🌙',  items: evening   },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {periods.map(({ title, emoji, items }) => {
        if (items.length === 0) return null;
        return (
          <div key={title}>
            {/* Period header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              marginBottom: '0.75rem',
            }}>
              <span style={{ fontSize: '0.85rem' }}>{emoji}</span>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: '0.72rem',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: '#000000',
              }}>{title}</span>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.68rem', color: 'rgba(0,0,0,0.4)',
                fontWeight: 700, marginLeft: '2px',
                background: 'rgba(0,0,0,0.05)', padding: '0.1rem 0.45rem',
                borderRadius: '50px',
              }}>{items.length}</span>
            </div>

            {/* Slot grid (Larger & More Spacious) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
              {items.map(slot => {
                const isSelected = selectedSlot?.startTime === slot.startTime;
                const isBooked = slot.isBooked;
                return (
                  <button
                    key={slot.startTime}
                    onClick={() => !isBooked && onSelectSlot(slot)}
                    disabled={isBooked}
                    style={{
                      padding: '0.65rem 0.95rem',
                      borderRadius: '11px',
                      border: isSelected
                        ? '1.5px solid #000000'
                        : isBooked
                        ? '1px solid rgba(0,0,0,0.05)'
                        : '1px solid rgba(0,0,0,0.12)',
                      background: isSelected
                        ? '#000000'
                        : isBooked
                        ? 'rgba(0,0,0,0.03)'
                        : '#ffffff',
                      color: isSelected
                        ? '#ffffff'
                        : isBooked
                        ? 'rgba(0,0,0,0.2)'
                        : '#000000',
                      fontSize: '0.92rem',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: isSelected ? 800 : 700,
                      cursor: isBooked ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected
                        ? '0 4px 14px rgba(0,0,0,0.2)'
                        : 'none',
                      transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                      position: 'relative',
                      overflow: 'hidden',
                      minWidth: '74px',
                      textAlign: 'center',
                      letterSpacing: '-0.01em',
                    }}
                    onMouseEnter={e => {
                      if (!isBooked && !isSelected) {
                        e.currentTarget.style.background = '#000000';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.borderColor = '#000000';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isBooked && !isSelected) {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.color = '#000000';
                        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)';
                      }
                    }}
                  >
                    {slot.startTime}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div style={{
        display: 'flex', gap: '1rem', paddingTop: '0.5rem',
        borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: '0.25rem',
      }}>
        {[
          { color: '#000', label: 'Selected' },
          { color: '#fff', border: 'rgba(0,0,0,0.12)', label: 'Available' },
          { color: 'rgba(0,0,0,0.03)', label: 'Booked' },
        ].map(({ color, border, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '3px',
              background: color,
              border: `1px solid ${border || color}`,
            }} />
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.62rem', color: 'rgba(0,0,0,0.35)', fontWeight: 500,
            }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
