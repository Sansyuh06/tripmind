import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane } from 'lucide-react';
import { useStore } from '../stores/useStore';

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'hi', flag: '🇮🇳', label: 'HI' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'ja', flag: '🇯🇵', label: 'JP' },
];

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const { t, i18n } = useTranslation();
  const { updateProfile, register, login } = useStore();
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState(localStorage.getItem('tripmind-lang') || 'en');
  const [purpose, setPurpose] = useState<'business' | 'leisure'>('leisure');
  const [dietary, setDietary] = useState('');
  const [seat, setSeat] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('demo@tripmind.app');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleLangSelect = (code: string) => {
    setLang(code);
    i18n.changeLanguage(code);
    localStorage.setItem('tripmind-lang', code);
  };

  const handleAuth = async () => {
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ email, password, name, preferredLang: lang, tripPurpose: purpose, dietaryPref: dietary, seatPreference: seat });
      }
      setStep(1);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Authentication failed');
    }
  };

  const handleSave = async () => {
    await updateProfile({ preferredLang: lang, tripPurpose: purpose, dietaryPref: dietary || undefined, seatPreference: seat || undefined });
    onComplete();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.08) 0%, transparent 60%),
                     radial-gradient(ellipse 60% 40% at 80% 80%, rgba(99,102,241,0.05) 0%, transparent 50%),
                     #090C14`,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='0.8' fill='rgba(255,255,255,0.04)'/%3E%3C/svg%3E"), 
                          radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.08) 0%, transparent 60%),
                          radial-gradient(ellipse 60% 40% at 80% 80%, rgba(99,102,241,0.05) 0%, transparent 50%)`,
        backgroundColor: '#090C14',
      }}
    >
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="w-full flex flex-col items-center"
            style={{ maxWidth: 420 }}
          >
            {/* Logo Block */}
            <div className="text-center mb-8">
              <Plane size={24} strokeWidth={1.5} className="mx-auto mb-3" style={{ color: '#F59E0B' }} />
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, letterSpacing: '-0.5px', color: '#F59E0B', lineHeight: 1.2 }}>
                TripMind
              </h1>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#8892A4', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 8 }}>
                {t('app.tagline')}
              </p>
            </div>

            {/* Auth Card */}
            <div
              className="w-full"
              style={{
                background: '#0F1320',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: 36,
              }}
            >
              {/* Top rule */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 28 }} />

              <AnimatePresence>
                {!isLogin && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden" style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8892A4', marginBottom: 8 }}>
                      {t('auth.name')}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%', height: 48, padding: '0 16px', fontSize: 15, color: '#F0F2F8',
                        background: '#161B2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                        outline: 'none', fontFamily: 'DM Sans, sans-serif',
                        transition: 'all 150ms ease-out',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(245,158,11,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8892A4', marginBottom: 8 }}>
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%', height: 48, padding: '0 16px', fontSize: 15, color: '#F0F2F8',
                    background: '#161B2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                    outline: 'none', fontFamily: 'DM Sans, sans-serif',
                    transition: 'all 150ms ease-out',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(245,158,11,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8892A4', marginBottom: 8 }}>
                  {t('auth.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%', height: 48, padding: '0 16px', fontSize: 15, color: '#F0F2F8',
                    background: '#161B2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                    outline: 'none', fontFamily: 'DM Sans, sans-serif',
                    transition: 'all 150ms ease-out',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(245,158,11,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {error && (
                <p style={{ fontSize: 13, color: '#F87171', marginTop: 12, marginBottom: 4 }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleAuth}
                style={{
                  width: '100%', height: 48, background: '#F59E0B', borderRadius: 10, border: 'none',
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#000',
                  letterSpacing: '0.01em', cursor: 'pointer', marginTop: 8,
                  transition: 'all 150ms ease-out',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FBBF24'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F59E0B'; e.currentTarget.style.transform = 'translateY(0)'; }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {isLogin ? t('auth.loginBtn') : t('auth.registerBtn')}
              </button>

              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#8892A4', fontFamily: 'DM Sans, sans-serif' }}>
                {isLogin ? t('auth.switchToRegister').replace('Register', '') : t('auth.switchToLogin').replace('Login', '')}
                <span
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  style={{ color: '#F59E0B', cursor: 'pointer', textDecoration: 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                >
                  {isLogin ? 'Register' : 'Login'}
                </span>
              </p>

              {/* Language switcher inside card */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginTop: 20, marginBottom: 16 }} />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleLangSelect(l.code)}
                    style={{
                      background: lang === l.code ? 'rgba(245,158,11,0.12)' : 'transparent',
                      border: 'none', padding: '4px 8px', fontSize: 12, borderRadius: 6,
                      color: lang === l.code ? '#F59E0B' : '#4A5568',
                      fontWeight: lang === l.code ? 500 : 400,
                      cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                      transition: 'all 150ms ease-out',
                    }}
                    onMouseEnter={(e) => { if (lang !== l.code) e.currentTarget.style.color = '#8892A4'; }}
                    onMouseLeave={(e) => { if (lang !== l.code) e.currentTarget.style.color = '#4A5568'; }}
                  >
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="prefs"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="w-full"
            style={{ maxWidth: 480 }}
          >
            <div style={{ background: '#0F1320', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 36 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, color: '#F0F2F8', marginBottom: 4 }}>
                {t('onboarding.subtitle')}
              </h2>
              <p style={{ fontSize: 14, color: '#8892A4', marginBottom: 28 }}>Configure your travel preferences</p>

              {/* Purpose */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#8892A4', marginBottom: 10 }}>
                  {t('onboarding.purpose')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {(['business', 'leisure'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPurpose(p)}
                      style={{
                        padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500,
                        background: purpose === p ? '#F59E0B' : '#161B2E',
                        color: purpose === p ? '#000' : '#F0F2F8',
                        border: purpose === p ? 'none' : '1px solid rgba(255,255,255,0.08)',
                        transition: 'all 150ms ease-out',
                      }}
                    >
                      {p === 'business' ? '💼 ' : '🏖️ '}{t(`onboarding.${p}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#8892A4', marginBottom: 10 }}>
                  {t('onboarding.dietary')}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['vegetarian', 'vegan', 'halal', 'kosher', 'noRestriction'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDietary(d)}
                      style={{
                        padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                        fontSize: 13, fontWeight: 500, fontFamily: 'DM Sans, sans-serif',
                        background: dietary === d ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)',
                        color: dietary === d ? '#F59E0B' : '#8892A4',
                        border: dietary === d ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(255,255,255,0.08)',
                        transition: 'all 150ms ease-out',
                      }}
                    >
                      {t(`onboarding.${d}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seat */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#8892A4', marginBottom: 10 }}>
                  {t('onboarding.seat')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[{ key: 'aisle', icon: '🚶' }, { key: 'window', icon: '🪟' }, { key: 'middle', icon: '💺' }].map(({ key, icon }) => (
                    <button
                      key={key}
                      onClick={() => setSeat(key)}
                      style={{
                        padding: '12px', borderRadius: 10, cursor: 'pointer',
                        fontSize: 13, fontWeight: 500, fontFamily: 'DM Sans, sans-serif',
                        background: seat === key ? 'rgba(245,158,11,0.12)' : '#161B2E',
                        color: seat === key ? '#F59E0B' : '#F0F2F8',
                        border: seat === key ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(255,255,255,0.08)',
                        transition: 'all 150ms ease-out',
                      }}
                    >
                      {icon} {t(`onboarding.${key}`)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                style={{
                  width: '100%', height: 48, background: '#F59E0B', borderRadius: 10, border: 'none',
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#000',
                  cursor: 'pointer', transition: 'all 150ms ease-out',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FBBF24'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F59E0B'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {t('onboarding.save')} →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
