import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane as PlaneIcon, Building2, Shield, MapPin, Utensils, Coffee, Users, Car, Clock } from 'lucide-react';
import { useStore } from '../stores/useStore';

const EVENT_STYLES: Record<string, { bg: string; color: string; Icon: typeof MapPin }> = {
  activity:    { bg: 'rgba(99,102,241,0.15)',  color: '#818CF8', Icon: MapPin },
  sightseeing: { bg: 'rgba(99,102,241,0.15)',  color: '#818CF8', Icon: MapPin },
  food:        { bg: 'rgba(34,197,94,0.12)',   color: '#4ADE80', Icon: Utensils },
  break:       { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B', Icon: Coffee },
  meeting:     { bg: 'rgba(59,130,246,0.12)',  color: '#60A5FA', Icon: Users },
  transport:   { bg: 'rgba(168,85,247,0.12)',  color: '#C084FC', Icon: Car },
  shopping:    { bg: 'rgba(236,72,153,0.12)',  color: '#F472B6', Icon: MapPin },
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { currentTrip, trips, fetchTrips, fetchTrip, buildItinerary, createTrip, loading } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [dest, setDest] = useState('Singapore');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { fetchTrips(); }, []);
  useEffect(() => { if (trips.length > 0 && !currentTrip) fetchTrip(trips[0].id); }, [trips]);

  const handleCreate = async () => {
    if (!dest || !startDate || !endDate) return;
    const tripId = await createTrip({ destination: dest, startDate, endDate });
    await fetchTrip(tripId);
    setShowCreate(false);
  };

  const handleGenerate = async () => {
    if (!currentTrip) return;
    setGenerating(true);
    try { await buildItinerary(currentTrip.id); await fetchTrip(currentTrip.id); } catch {}
    setGenerating(false);
  };

  const daysRemaining = currentTrip ? Math.max(0, Math.ceil((new Date(currentTrip.startDate).getTime() - Date.now()) / 86400000)) : 0;
  const itinerary = currentTrip?.itinerary || [];

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 48, padding: '0 16px', fontSize: 15, color: '#F0F2F8',
    background: '#161B2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
    outline: 'none', fontFamily: 'DM Sans, sans-serif', transition: 'all 150ms ease-out',
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
      {/* Sidebar */}
      <aside
        className="hidden md:block"
        style={{
          width: 200, background: '#0F1320', borderRight: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0, position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto',
        }}
      >
        {currentTrip && (
          <>
            {/* Trip header */}
            <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F0F2F8', marginBottom: 8 }}>
                {t('dashboard.title')}
              </h2>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '4px 8px',
              }}>
                <MapPin size={12} style={{ color: '#8892A4' }} strokeWidth={1.5} />
                <span style={{ fontSize: 13, color: '#8892A4' }}>{currentTrip.destination}</span>
              </div>
              <p style={{ fontSize: 11, color: '#4A5568', marginTop: 6 }}>
                {new Date(currentTrip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – {new Date(currentTrip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Days remaining */}
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#4A5568', marginBottom: 4 }}>
                {t('dashboard.daysRemaining')}
              </p>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 32, color: '#F59E0B' }}>{daysRemaining}</span>
            </div>

            {/* Day list */}
            <div style={{ padding: '8px 0' }}>
              {itinerary.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedDay(i)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px',
                    fontFamily: 'DM Sans, sans-serif', border: 'none', cursor: 'pointer',
                    background: selectedDay === i ? 'rgba(245,158,11,0.08)' : 'transparent',
                    borderLeft: selectedDay === i ? '2px solid #F59E0B' : '2px solid transparent',
                    transition: 'all 150ms ease-out',
                  }}
                  onMouseEnter={(e) => { if (selectedDay !== i) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={(e) => { if (selectedDay !== i) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500, color: selectedDay === i ? '#F59E0B' : '#F0F2F8', display: 'block' }}>
                    {t('dashboard.dayOf', { num: i + 1 })}
                  </span>
                  <span style={{ fontSize: 11, color: '#4A5568', display: 'block', marginTop: 2 }}>
                    {new Date(itinerary[i].date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '28px 24px' }}>
        {/* Page title + actions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#F0F2F8', marginBottom: 4 }}>
              {t('dashboard.title')}
            </h1>
            {currentTrip && (
              <p style={{ fontSize: 14, color: '#8892A4' }}>
                📍 {currentTrip.destination} · {new Date(currentTrip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – {new Date(currentTrip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={handleGenerate}
              disabled={!currentTrip || generating}
              style={{
                padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
                background: 'rgba(245,158,11,0.06)', color: '#F59E0B',
                border: '1px solid rgba(245,158,11,0.3)',
                opacity: (!currentTrip || generating) ? 0.4 : 1,
                transition: 'all 150ms ease-out',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.6)'; e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; }}
            >
              {generating ? '⏳ Generating…' : `✨ ${t('dashboard.generateItinerary')}`}
            </button>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                background: 'none', border: 'none', fontSize: 13, color: '#4A5568',
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                transition: 'color 150ms ease-out',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#8892A4'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#4A5568'; }}
            >
              + {t('dashboard.createTrip')}
            </button>
          </div>
        </div>

        {/* Stat chips */}
        {currentTrip && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { Icon: PlaneIcon, label: t('dashboard.flights'), value: String(currentTrip.flights?.length || 0) },
              { Icon: Building2, label: t('dashboard.hotels'), value: String(currentTrip.hotels?.length || 0) },
              { Icon: Shield, label: t('disruption.status'), value: 'active', isStatus: true },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: '#0F1320', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, padding: '10px 16px',
                }}
              >
                <stat.Icon size={16} strokeWidth={1.5} style={{ color: '#8892A4' }} />
                <div>
                  <p style={{ fontSize: 11, textTransform: 'uppercase' as const, color: '#4A5568', letterSpacing: '0.05em' }}>{stat.label}</p>
                  {stat.isStatus ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#F0F2F8' }}>Active</span>
                    </div>
                  ) : (
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#F0F2F8', marginTop: 2 }}>{stat.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile day selector */}
        <div className="md:hidden" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 8 }}>
          {itinerary.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              style={{
                padding: '8px 14px', borderRadius: 8, whiteSpace: 'nowrap' as const,
                fontSize: 13, fontWeight: 500, fontFamily: 'DM Sans, sans-serif',
                background: selectedDay === i ? 'rgba(245,158,11,0.08)' : '#0F1320',
                color: selectedDay === i ? '#F59E0B' : '#8892A4',
                border: selectedDay === i ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer', transition: 'all 150ms ease-out',
              }}
            >
              Day {i + 1}
            </button>
          ))}
        </div>

        {/* Itinerary */}
        <AnimatePresence mode="wait">
          {itinerary.length > 0 ? (
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {(itinerary[selectedDay]?.events || []).map((event: any, j: number, arr: any[]) => {
                const style = EVENT_STYLES[event.type] || EVENT_STYLES.activity;
                const EventIcon = style.Icon;
                const isBreathing = event.isBreathingRoom;

                return (
                  <div key={j}>
                    {/* Card */}
                    <div
                      style={{
                        background: '#0F1320', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 12, overflow: 'hidden', display: 'flex',
                        transition: 'all 150ms ease-out', cursor: 'default',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {/* Time column */}
                      <div style={{
                        width: 72, background: '#161B2E', borderRight: '1px solid rgba(255,255,255,0.06)',
                        padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 4, flexShrink: 0,
                      }}>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#F0F2F8', lineHeight: 1 }}>
                          {event.time}
                        </span>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#4A5568' }}>
                          {event.duration_minutes}min
                        </span>
                      </div>

                      {/* Type icon */}
                      <div style={{ padding: '16px 0 16px 16px', display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', background: style.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <EventIcon size={16} strokeWidth={1.5} style={{ color: style.color }} />
                        </div>
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, padding: 16, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                          <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#F0F2F8' }}>
                            {event.title}
                          </h3>
                          {isBreathing && (
                            <span style={{
                              background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.2)',
                              color: '#F59E0B', fontSize: 11, fontWeight: 500, padding: '2px 8px',
                              borderRadius: 9999,
                            }}>
                              Breathing room
                            </span>
                          )}
                          {event.isGapSuggestion && (
                            <span style={{
                              background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.2)',
                              color: '#818CF8', fontSize: 11, fontWeight: 500, padding: '2px 8px',
                              borderRadius: 9999,
                            }}>
                              Gap suggestion
                            </span>
                          )}
                        </div>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 400, fontSize: 13, color: '#8892A4', lineHeight: 1.5 }}>
                          {event.description}
                        </p>
                        {event.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                            <MapPin size={12} strokeWidth={1.5} style={{ color: '#4A5568' }} />
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#4A5568' }}>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Connector line */}
                    {j < arr.length - 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 0 0 36px' }}>
                        <div style={{ width: 1, height: 16, borderLeft: '1px dashed rgba(255,255,255,0.08)' }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              background: '#0F1320', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
            }}>
              <MapPin size={24} strokeWidth={1.5} style={{ color: '#4A5568', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, color: '#8892A4' }}>{trips.length === 0 ? t('dashboard.noTrips') : 'Click "Generate Itinerary" to build your trip plan'}</p>
            </div>
          )}
        </AnimatePresence>

        {/* Create Trip Modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(9,12,20,0.8)', backdropFilter: 'blur(8px)' }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 12 }}
                transition={{ duration: 0.2 }}
                style={{ width: '100%', maxWidth: 420, background: '#0F1320', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28 }}
              >
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#F0F2F8', marginBottom: 20 }}>
                  {t('dashboard.createTrip')}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#8892A4', marginBottom: 8 }}>
                      {t('dashboard.destination')}
                    </label>
                    <input value={dest} onChange={(e) => setDest(e.target.value)} style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(245,158,11,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#8892A4', marginBottom: 8 }}>
                        {t('dashboard.startDate')}
                      </label>
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = 'rgba(245,158,11,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#8892A4', marginBottom: 8 }}>
                        {t('dashboard.endDate')}
                      </label>
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = 'rgba(245,158,11,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button onClick={handleCreate} style={{
                      flex: 1, height: 44, borderRadius: 10, border: 'none', background: '#F59E0B',
                      color: '#000', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif', transition: 'all 150ms ease-out',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#FBBF24'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#F59E0B'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {t('common.save')}
                    </button>
                    <button onClick={() => setShowCreate(false)} style={{
                      flex: 1, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)', color: '#8892A4', fontWeight: 500,
                      fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                      transition: 'all 150ms ease-out',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#F0F2F8'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#8892A4'; }}
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
