import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, LayoutDashboard, Zap, Receipt } from 'lucide-react';
import { useStore } from './stores/useStore';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Disruption from './pages/Disruption';
import Expenses from './pages/Expenses';
import './i18n/i18n';

type Page = 'dashboard' | 'disruption' | 'expenses';

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'hi', flag: '🇮🇳', label: 'HI' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'ja', flag: '🇯🇵', label: 'JP' },
];

const NAV_ITEMS: { key: Page; icon: typeof LayoutDashboard; label: string }[] = [
  { key: 'dashboard', icon: LayoutDashboard, label: 'nav.dashboard' },
  { key: 'disruption', icon: Zap, label: 'nav.disruption' },
  { key: 'expenses', icon: Receipt, label: 'nav.expenses' },
];

export default function App() {
  const { t, i18n } = useTranslation();
  const { user, fetchMe, logout } = useStore();
  const [page, setPage] = useState<Page>('dashboard');
  const [onboarded, setOnboarded] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tripmind-token');
    if (token) {
      fetchMe().then(() => { setOnboarded(true); setChecking(false); }).catch(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  const handleLang = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('tripmind-lang', code);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#090C14' }}>
        <div className="flex flex-col items-center gap-3">
          <Plane size={24} strokeWidth={1.5} style={{ color: '#F59E0B' }} />
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#F59E0B' }}>TripMind</p>
          <p style={{ fontSize: 13, color: '#4A5568' }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!user || !onboarded) {
    return <Onboarding onComplete={() => setOnboarded(true)} />;
  }

  return (
    <div className="min-h-screen" style={{ background: '#090C14' }}>
      {/* Topbar */}
      <nav
        style={{
          height: 56, background: 'rgba(9,12,20,0.85)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        {/* Left: Logo + Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plane size={18} strokeWidth={1.5} style={{ color: '#F59E0B' }} />
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 16, color: '#F59E0B' }}>TripMind</span>
          </div>

          {/* Separator */}
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />

          {/* Nav Tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = page === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setPage(item.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 12px', borderRadius: 8, border: 'none',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500,
                    color: isActive ? '#F0F2F8' : '#8892A4',
                    background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                    cursor: 'pointer', transition: 'all 150ms ease-out',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#F0F2F8'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#8892A4'; }}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  <span className="hidden md:inline">{t(item.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Lang + User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Language pills */}
          <div style={{ display: 'flex', gap: 2 }}>
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => handleLang(l.code)}
                style={{
                  background: i18n.language === l.code ? 'rgba(245,158,11,0.12)' : 'transparent',
                  border: 'none', padding: '3px 6px', fontSize: 11, borderRadius: 4,
                  color: i18n.language === l.code ? '#F59E0B' : '#4A5568',
                  fontWeight: i18n.language === l.code ? 500 : 400,
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  transition: 'all 150ms ease-out',
                }}
                onMouseEnter={(e) => { if (i18n.language !== l.code) e.currentTarget.style.color = '#8892A4'; }}
                onMouseLeave={(e) => { if (i18n.language !== l.code) e.currentTarget.style.color = '#4A5568'; }}
              >
                {l.flag}
              </button>
            ))}
          </div>

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(245,158,11,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 500, color: '#F59E0B',
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden lg:inline" style={{ fontSize: 13, color: '#8892A4' }}>{user.name}</span>
            <button
              onClick={logout}
              style={{
                background: 'none', border: 'none', fontSize: 13, color: '#4A5568',
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                transition: 'color 150ms ease-out',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#8892A4'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#4A5568'; }}
            >
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          height: 48, background: '#0F1320',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = page === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              style={{
                background: 'none', border: 'none', color: isActive ? '#F59E0B' : '#4A5568',
                cursor: 'pointer', padding: 8, transition: 'color 150ms ease-out',
              }}
            >
              <Icon size={20} strokeWidth={1.5} />
            </button>
          );
        })}
      </div>

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="pb-16 md:pb-0"
        >
          {page === 'dashboard' && <Dashboard />}
          {page === 'disruption' && <Disruption />}
          {page === 'expenses' && <Expenses />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
