import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Plane, Clock } from 'lucide-react';
import { useStore } from '../stores/useStore';

export default function Disruption() {
  const { t } = useTranslation();
  const { currentTrip, triggerDisruption } = useStore();
  const [resolution, setResolution] = useState<any>(null);
  const [phase, setPhase] = useState<'idle' | 'detecting' | 'finding' | 'resolved'>('idle');
  const [selectedAlt, setSelectedAlt] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [disruptType, setDisruptType] = useState<'cancelled' | 'delayed' | 'missed'>('cancelled');

  const flight = currentTrip?.flights?.[0];

  const handleTrigger = async () => {
    if (!currentTrip || !flight) return;
    setPhase('detecting');
    await new Promise((r) => setTimeout(r, 2000));
    setPhase('finding');
    try {
      const data = await triggerDisruption(currentTrip.id, flight.id, disruptType);
      setResolution(data);
      await new Promise((r) => setTimeout(r, 800));
      setPhase('resolved');
    } catch { setPhase('idle'); }
  };

  const selectStyle: React.CSSProperties = {
    height: 44, padding: '0 16px', fontSize: 14, color: '#F0F2F8',
    background: '#161B2E', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer', transition: 'all 150ms ease-out',
  };

  return (
    <div style={{ padding: '28px 24px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#F0F2F8', marginBottom: 4 }}>
          {t('disruption.title')}
        </h1>
        <p style={{ fontSize: 14, color: '#8892A4' }}>Real-time flight disruption handling with instant rebooking</p>
      </div>

      {/* Current Flight Card */}
      {flight && (
        <div style={{
          background: '#0F1320', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14, padding: '24px 28px', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4A5568' }}>
              {t('disruption.currentFlight')}
            </span>
            <span style={{
              padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 500,
              background: phase !== 'idle' ? 'rgba(239,68,68,0.10)' : 'rgba(34,197,94,0.10)',
              color: phase !== 'idle' ? '#F87171' : '#4ADE80',
              border: phase !== 'idle' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(34,197,94,0.2)',
            }}>
              {phase === 'idle' ? '● Confirmed' : `● ${disruptType.charAt(0).toUpperCase() + disruptType.slice(1)}`}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Origin */}
            <div style={{ flex: '0 0 auto' }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 36, color: '#F0F2F8', lineHeight: 1 }}>{flight.origin}</p>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#8892A4', marginTop: 4 }}>
                {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Route */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px' }}>
              <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 0 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', border: '1.5px solid #8892A4', flexShrink: 0 }} />
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <Plane size={14} strokeWidth={1.5} style={{ color: '#8892A4', flexShrink: 0, margin: '0 4px' }} />
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', border: '1.5px solid #8892A4', flexShrink: 0 }} />
              </div>
              <p style={{ fontSize: 12, color: '#4A5568', marginTop: 6 }}>{flight.airline} · {flight.flightNumber}</p>
            </div>

            {/* Destination */}
            <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 36, color: '#F0F2F8', lineHeight: 1 }}>{flight.destination}</p>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#8892A4', marginTop: 4 }}>
                {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      {phase === 'idle' && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <select value={disruptType} onChange={(e) => setDisruptType(e.target.value as any)} style={selectStyle}>
            <option value="cancelled">Cancelled</option>
            <option value="delayed">Delayed</option>
            <option value="missed">Missed Connection</option>
          </select>
          <button
            onClick={handleTrigger}
            disabled={!flight}
            style={{
              height: 44, padding: '0 20px', borderRadius: 10, border: 'none',
              background: '#EF4444', color: '#fff', fontWeight: 600, fontSize: 14,
              cursor: flight ? 'pointer' : 'default', fontFamily: 'DM Sans, sans-serif',
              opacity: flight ? 1 : 0.4, transition: 'all 150ms ease-out',
            }}
            onMouseEnter={(e) => { if (flight) { e.currentTarget.style.background = '#F87171'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            ⚡ {t('disruption.simulate')}
          </button>
        </div>
      )}

      {/* Detecting */}
      <AnimatePresence>
        {phase === 'detecting' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              background: 'rgba(239,68,68,0.08)',
              borderTop: '1px solid rgba(239,68,68,0.2)', borderBottom: '1px solid rgba(239,68,68,0.2)',
              padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
            }}
          >
            <AlertTriangle size={18} strokeWidth={1.5} style={{ color: '#EF4444', animation: 'pulse 2s ease-in-out infinite' }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: '#F87171', flex: 1 }}>
              Flight {flight?.flightNumber} disrupted — {disruptType} detected.
            </p>
            <span style={{ fontSize: 12, color: '#4A5568' }}>{new Date().toLocaleTimeString()}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finding */}
      <AnimatePresence>
        {phase === 'finding' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '40px 0' }}
          >
            <Clock size={24} strokeWidth={1.5} style={{ color: '#8892A4', margin: '0 auto 12px', animation: 'spin 2s linear infinite' }} />
            <p style={{ fontSize: 14, color: '#8892A4' }}>{t('disruption.findingAlternatives')}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resolution */}
      <AnimatePresence>
        {phase === 'resolved' && resolution && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Disruption banner */}
            <div style={{
              background: 'rgba(239,68,68,0.08)',
              borderTop: '1px solid rgba(239,68,68,0.2)', borderBottom: '1px solid rgba(239,68,68,0.2)',
              padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
            }}>
              <AlertTriangle size={18} strokeWidth={1.5} style={{ color: '#EF4444' }} />
              <p style={{ fontSize: 14, fontWeight: 500, color: '#F87171', flex: 1 }}>
                Flight {flight?.flightNumber} disrupted — {disruptType} detected. {resolution.alternativeFlights.length} alternatives found.
              </p>
              <span style={{ fontSize: 12, color: '#4A5568' }}>{new Date().toLocaleTimeString()}</span>
            </div>

            {/* Alternative Flight Cards */}
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F0F2F8', marginBottom: 12 }}>
              {t('disruption.alternativeFlights')}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {resolution.alternativeFlights.map((alt: any, i: number) => {
                const isSelected = selectedAlt === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    onClick={() => setSelectedAlt(i)}
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, #0F1320 60%)'
                        : '#0F1320',
                      border: isSelected
                        ? '1px solid rgba(245,158,11,0.35)'
                        : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 14, padding: '20px 24px', cursor: 'pointer',
                      boxShadow: isSelected ? '0 0 0 1px rgba(245,158,11,0.15)' : 'none',
                      transition: 'all 150ms ease-out',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                  >
                    {/* Top badge */}
                    {i === 0 && (
                      <span style={{
                        display: 'inline-block', marginBottom: 10,
                        background: 'rgba(245,158,11,0.12)', color: '#F59E0B',
                        fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 9999,
                      }}>
                        ⭐ Best match
                      </span>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F0F2F8', marginBottom: 4 }}>
                          {alt.flightNumber}
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 400, fontSize: 13, color: '#8892A4', marginLeft: 8 }}>{alt.airline}</span>
                        </p>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#8892A4' }}>
                          {alt.origin} → {alt.destination}
                        </p>
                        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#4A5568', marginTop: 4 }}>
                          {new Date(alt.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → {new Date(alt.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 24, color: '#F0F2F8' }}>
                          ${alt.price}
                        </p>
                        {alt.duration && <p style={{ fontSize: 12, color: '#4A5568', marginTop: 2 }}>{alt.duration}</p>}
                        {alt.score != null && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginTop: 6 }}>
                            <div style={{ width: 60, height: 4, borderRadius: 2, background: '#1E2640', overflow: 'hidden' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${alt.score}%` }}
                                transition={{ duration: 0.8, delay: i * 0.08 + 0.3 }}
                                style={{ height: '100%', background: '#F59E0B', borderRadius: 2 }}
                              />
                            </div>
                            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#8892A4' }}>{alt.score}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Updated details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              <div style={{ background: '#0F1320', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4A5568', marginBottom: 8 }}>
                  {t('disruption.updatedHotel')}
                </p>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#F0F2F8' }}>
                  {new Date(resolution.updatedHotelCheckIn).toLocaleString()}
                </p>
              </div>
              <div style={{ background: '#0F1320', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4A5568', marginBottom: 8 }}>
                  {t('disruption.updatedCab')}
                </p>
                <p style={{ fontSize: 13, color: '#F0F2F8' }}>{resolution.updatedCabBooking.pickup} → {resolution.updatedCabBooking.dropoff}</p>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#4A5568', marginTop: 4 }}>
                  {new Date(resolution.updatedCabBooking.time).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowQR(true)}
                style={{
                  flex: 1, height: 44, borderRadius: 10, border: 'none', background: '#F59E0B',
                  color: '#000', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', transition: 'all 150ms ease-out',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FBBF24'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F59E0B'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                ✅ {t('disruption.confirmPay')}
              </button>
              <button
                onClick={() => { setPhase('idle'); setResolution(null); setShowQR(false); }}
                style={{
                  height: 44, padding: '0 20px', borderRadius: 10,
                  background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#F87171', fontWeight: 500, fontSize: 14, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', transition: 'all 150ms ease-out',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; e.currentTarget.style.background = 'rgba(239,68,68,0.10)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
              >
                {t('disruption.cancel')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Modal — boarding pass */}
      <AnimatePresence>
        {showQR && resolution?.qrCodeData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(9,12,20,0.85)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{
                width: '100%', maxWidth: 560, background: '#0F1320',
                border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: 28,
                display: 'flex', gap: 24, flexWrap: 'wrap',
              }}
            >
              {/* Left: QR */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto' }}>
                <div style={{ background: 'white', borderRadius: 12, padding: 12 }}>
                  <img src={resolution.qrCodeData} alt="QR Code" style={{ width: 180, height: 180, display: 'block' }} />
                </div>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#4A5568', marginTop: 10, textAlign: 'center' }}>
                  {resolution.confirmationToken}
                </p>
              </div>

              {/* Dashed divider */}
              <div style={{ width: 1, borderLeft: '1px dashed rgba(255,255,255,0.10)', alignSelf: 'stretch' }} />

              {/* Right: Summary */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F0F2F8', marginBottom: 16 }}>
                  Boarding Pass
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  <div>
                    <p style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#4A5568', marginBottom: 2 }}>Flight</p>
                    <p style={{ fontSize: 14, color: '#F0F2F8', fontWeight: 500 }}>{resolution.selectedFlight?.flightNumber} · ${resolution.selectedFlight?.price}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#4A5568', marginBottom: 2 }}>Hotel Check-in</p>
                    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#F0F2F8' }}>{new Date(resolution.updatedHotelCheckIn).toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#4A5568', marginBottom: 2 }}>Cab</p>
                    <p style={{ fontSize: 13, color: '#F0F2F8' }}>{resolution.updatedCabBooking?.pickup} → {resolution.updatedCabBooking?.dropoff}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowQR(false)} style={{
                    flex: 1, height: 40, borderRadius: 10, border: 'none', background: '#F59E0B',
                    color: '#000', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', transition: 'all 150ms ease-out',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FBBF24'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#F59E0B'; }}
                  >
                    Done
                  </button>
                  <button onClick={() => setShowQR(false)} style={{
                    height: 40, padding: '0 14px', borderRadius: 10,
                    background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#F87171', fontWeight: 500, fontSize: 13, cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', transition: 'all 150ms ease-out',
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse animation for detecting */}
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
