import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Utensils, Car, Building2, MapPin, Package } from 'lucide-react';
import { useStore } from '../stores/useStore';

const CATEGORY_COLORS: Record<string, string> = {
  food: '#4ADE80',
  transport: '#C084FC',
  accommodation: '#818CF8',
  activity: '#60A5FA',
  other: '#8892A4',
};

const CATEGORY_ICONS: Record<string, typeof Utensils> = {
  food: Utensils,
  transport: Car,
  accommodation: Building2,
  activity: MapPin,
  other: Package,
};

export default function Expenses() {
  const { t } = useTranslation();
  const { scanExpense, fetchExpenses, currentTrip } = useStore();
  const [receiptText, setReceiptText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [typingDisplay, setTypingDisplay] = useState('');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [byCategory, setByCategory] = useState<Record<string, number>>({});

  useEffect(() => { loadExpenses(); }, [currentTrip]);

  const loadExpenses = async () => {
    try {
      const data = await fetchExpenses(currentTrip?.id);
      setExpenses(data.expenses);
      setTotal(data.total);
      setByCategory(data.byCategory);
    } catch {}
  };

  const handleScan = async () => {
    if (!receiptText.trim()) return;
    setScanning(true);
    setTypingDisplay('');
    try {
      const data = await scanExpense(receiptText, currentTrip?.id);
      const display = `${t(`expenses.${data.extracted.category}`)} · ${data.extracted.currency} ${data.extracted.amount.toFixed(2)} · ${data.extracted.description}`;
      for (let i = 0; i <= display.length; i++) {
        await new Promise((r) => setTimeout(r, 25));
        setTypingDisplay(display.substring(0, i));
      }
      await loadExpenses();
    } catch {}
    setScanning(false);
  };

  const pieData = Object.entries(byCategory).map(([key, value]) => ({
    name: t(`expenses.${key}`),
    value: Number(value.toFixed(2)),
    color: CATEGORY_COLORS[key] || '#8892A4',
    key,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: '#0F1320', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px' }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#F0F2F8' }}>{payload[0].name}</p>
          <p style={{ fontSize: 13, color: payload[0].payload.color, fontFamily: 'DM Mono, monospace' }}>${payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#F0F2F8', marginBottom: 4 }}>
          {t('expenses.title')}
        </h1>
        <p style={{ fontSize: 14, color: '#8892A4' }}>AI-powered receipt scanning with instant categorization</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <div className="lg:grid" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
          {/* Left: Scanner + List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Scanner */}
            <div style={{ background: '#0F1320', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F0F2F8', marginBottom: 12 }}>
                {t('expenses.scanReceipt')}
              </h2>
              <textarea
                value={receiptText}
                onChange={(e) => setReceiptText(e.target.value)}
                placeholder={t('expenses.pasteReceipt')}
                rows={5}
                style={{
                  width: '100%', minHeight: 120, padding: 16, fontSize: 13, color: '#8892A4',
                  background: '#161B2E', border: '1px dashed rgba(255,255,255,0.10)',
                  borderRadius: 12, outline: 'none', resize: 'vertical',
                  fontFamily: 'DM Mono, monospace', transition: 'all 150ms ease-out',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(245,158,11,0.4)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; }}
              />
              <button
                onClick={handleScan}
                disabled={scanning || !receiptText.trim()}
                style={{
                  width: '100%', height: 44, borderRadius: 10, border: 'none',
                  background: '#F59E0B', color: '#000', fontWeight: 600, fontSize: 14,
                  cursor: (scanning || !receiptText.trim()) ? 'default' : 'pointer',
                  fontFamily: 'DM Sans, sans-serif', marginTop: 12,
                  opacity: (scanning || !receiptText.trim()) ? 0.4 : 1,
                  transition: 'all 150ms ease-out',
                }}
                onMouseEnter={(e) => { if (!scanning && receiptText.trim()) { e.currentTarget.style.background = '#FBBF24'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F59E0B'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {scanning ? '⏳ Scanning…' : `📷 ${t('expenses.scan')}`}
              </button>

              {typingDisplay && (
                <div style={{
                  marginTop: 12, padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
                }}>
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#F59E0B' }}>
                    {typingDisplay}<span style={{ animation: 'blink 1s infinite' }}>|</span>
                  </p>
                </div>
              )}
            </div>

            {/* Expense List */}
            <div style={{ background: '#0F1320', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F0F2F8' }}>
                  {t('expenses.history')}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: '#4A5568', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                    {t('expenses.total')}
                  </span>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 16, color: '#F59E0B' }}>
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {expenses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Package size={24} strokeWidth={1.5} style={{ color: '#4A5568', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 13, color: '#4A5568' }}>No expenses yet. Scan a receipt to get started.</p>
                  </div>
                ) : (
                  expenses.map((exp: any, i: number) => {
                    const Icon = CATEGORY_ICONS[exp.category] || Package;
                    const color = CATEGORY_COLORS[exp.category] || '#8892A4';
                    return (
                      <div
                        key={exp.id || i}
                        style={{
                          display: 'flex', alignItems: 'center', padding: '14px 0',
                          borderBottom: i < expenses.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginRight: 12, flexShrink: 0,
                        }}>
                          <Icon size={14} strokeWidth={1.5} style={{ color }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, color: '#F0F2F8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                            {exp.description}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                            <span style={{
                              fontSize: 11, fontWeight: 500, padding: '1px 6px', borderRadius: 9999,
                              background: `${color}15`, color,
                            }}>
                              {t(`expenses.${exp.category}`)}
                            </span>
                            <span style={{ fontSize: 11, color: '#4A5568' }}>
                              {new Date(exp.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 16, color: '#F0F2F8', flexShrink: 0, marginLeft: 12 }}>
                          {exp.currency} {exp.amount.toFixed(2)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right: Chart */}
          <div>
            <div style={{ background: '#0F1320', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F0F2F8', marginBottom: 16 }}>
                {t('expenses.breakdown')}
              </h2>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData} cx="50%" cy="50%"
                        innerRadius={60} outerRadius={90}
                        paddingAngle={3} dataKey="value"
                        startAngle={90} endAngle={-270}
                        animationDuration={800}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginTop: 16 }}>
                    {pieData.map((entry, i) => {
                      const Icon = CATEGORY_ICONS[entry.key] || Package;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: '#8892A4' }}>{entry.name}</span>
                          </div>
                          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#F0F2F8' }}>${entry.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Package size={24} strokeWidth={1.5} style={{ color: '#4A5568', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 13, color: '#4A5568' }}>Chart appears after scanning receipts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
    </div>
  );
}
