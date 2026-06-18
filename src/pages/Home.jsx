import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useUIStore }  from '../store/uiStore.js';
import { t }          from '../lib/i18n.js';
import Button         from '../components/ui/Button.jsx';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';

const CHART_DATA = [
  { day: 'Mon', ujani: 72, koyna: 85, mulshi: 61 },
  { day: 'Tue', ujani: 74, koyna: 83, mulshi: 64 },
  { day: 'Wed', ujani: 71, koyna: 87, mulshi: 67 },
  { day: 'Thu', ujani: 76, koyna: 89, mulshi: 65 },
  { day: 'Fri', ujani: 78, koyna: 86, mulshi: 69 },
  { day: 'Sat', ujani: 80, koyna: 88, mulshi: 72 },
  { day: 'Sun', ujani: 79, koyna: 91, mulshi: 71 },
];

const SERIES = [
  { key: 'ujani',  label: 'Ujani',  color: '#E8B84B', strokeWidth: 2   },
  { key: 'koyna',  label: 'Koyna',  color: '#60A5FA', strokeWidth: 1.5 },
  { key: 'mulshi', label: 'Mulshi', color: '#4ADE80', strokeWidth: 1.5 },
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(6,16,32,.95)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 10, marginBottom: 5, letterSpacing: '.5px' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>
          {p.name}: {p.value}%
        </div>
      ))}
    </div>
  );
}

function DamChart() {
  const last = CHART_DATA[CHART_DATA.length - 1];
  return (
    <div style={{
      width: '100%', borderRadius: 14,
      background: 'rgba(6,16,32,.65)',
      border: '1px solid rgba(255,255,255,.08)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 40px rgba(0,0,0,.45)',
      overflow: 'hidden',
    }}>
      {/* Panel header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span className="w-2 h-2 rounded-full bg-[#4ADE80] shrink-0 animate-pulse-dot" />
          <span style={{ color: 'rgba(255,255,255,.7)', fontSize: 11, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase' }}>
            Storage Level — 7-Day Trend
          </span>
        </div>
        <span style={{ color: 'rgba(255,255,255,.22)', fontSize: 10, letterSpacing: '.3px' }}>% Capacity</span>
      </div>

      {/* Chart */}
      <div style={{ padding: '8px 8px 0' }}>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={CHART_DATA} margin={{ top: 4, right: 10, bottom: 0, left: -8 }}>
            <defs>
              {SERIES.map(s => (
                <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={s.color} stopOpacity={0.38} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0}    />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,.28)', fontSize: 10.5 }} axisLine={false} tickLine={false} />
            <YAxis domain={[55, 96]} tick={{ fill: 'rgba(255,255,255,.18)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={34} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,.1)', strokeWidth: 1 }} />
            {SERIES.map(s => (
              <Area key={s.key} type="monotone" dataKey={s.key} name={s.label}
                stroke={s.color} strokeWidth={s.strokeWidth}
                fill={`url(#g-${s.key})`} dot={false}
                activeDot={{ r: 4, fill: s.color, strokeWidth: 0 }} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '8px 18px 12px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
        {SERIES.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 18, height: 2, background: s.color, borderRadius: 1, opacity: .9 }} />
            <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 10.5 }}>{s.label}</span>
            <span style={{ color: s.color, fontSize: 11.5, fontWeight: 700, fontFamily: 'monospace' }}>{last[s.key]}%</span>
          </div>
        ))}
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,.15)', fontSize: 9.5, letterSpacing: '.5px' }}>PUNE DIV · DEMO</span>
      </div>
    </div>
  );
}

const STATS = [
  { val: '23',  label: 'Dams',      mr: 'धरणे',    accent: '#E8B84B', sub: 'Pune Division'   },
  { val: '284', label: 'Gates',     mr: 'दरवाजे',   accent: '#60A5FA', sub: 'Auto & Manual'   },
  { val: '47',  label: 'Officers',  mr: 'अधिकारी',  accent: '#4ADE80', sub: 'Field & HQ'      },
  { val: '6',   label: 'Districts', mr: 'जिल्हे',   accent: '#F472B6', sub: 'Active coverage' },
];

export default function Home() {
  const navigate = useNavigate();
  const { lang } = useUIStore();
  const { loggedIn } = useAuthStore();

  return (
    <div className="flex-1 flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="flex-1 bg-linear-to-br from-navy-950 via-navy-900 to-[#1A3870] flex items-center justify-center px-8 py-10 relative overflow-hidden">

        {/* Soft radial glow behind text */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 35% 50%, rgba(232,184,75,.07) 0%, transparent 70%)' }} />

        {/* Centered content wrapper */}
        <div className="w-full max-w-5xl flex flex-row items-center gap-14 z-10">

        {/* ── Left: text content ─────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col items-start">

          {/* Live monitoring badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 bg-[rgba(232,184,75,.12)] border border-[rgba(232,184,75,.28)] rounded-full px-4 py-1.75 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] shrink-0 animate-pulse-dot" />
            <span className="text-[11px] font-semibold text-gold-400 tracking-[.6px] uppercase">Live Monitoring Active</span>
          </div>

          {/* Heading */}
          <h1 className="animate-fade-up delay-100 text-[38px] font-bold text-white font-serif leading-[1.15] mb-2 tracking-[.2px]">
            {t('heroTitle', lang).split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h1>

          <div className="animate-fade-up delay-150 dv text-[16px] text-white/55 mb-5">
            {t('heroSub', lang)}
          </div>

          <p className="animate-fade-up delay-150 text-[13.5px] text-white/45 max-w-110 mb-8 leading-[1.75]">
            {t('heroDesc', lang)}
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-up delay-250 flex gap-3 flex-wrap mb-6">
            <button
              onClick={() => navigate('/pub')}
              className="inline-flex items-center gap-2 border border-white/25 text-white/85 bg-white/5 rounded-lg px-5 py-2.5 text-[13.5px] font-semibold cursor-pointer hover:bg-white/10 hover:border-white/40 transition-all"
            >
              🏛️ {t('viewDamInfo', lang)}
            </button>
            {loggedIn ? (
              <Button variant="gold" onClick={() => navigate('/dash')}>
                📊 {lang === 'mr' ? 'डॅशबोर्ड' : 'Go to Dashboard'} →
              </Button>
            ) : (
              <Button variant="gold" onClick={() => navigate('/login')}>
                🔑 {t('officerLogin', lang)} →
              </Button>
            )}
          </div>

          {!loggedIn && (
            <div className="animate-fade-up delay-300 text-[11.5px] text-white/28 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                <path d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z" />
                <path d="M17 11V7a5 5 0 00-10 0v4" />
              </svg>
              <span>{t('heroNote', lang)}</span>
            </div>
          )}
        </div>

        {/* ── Right: chart ───────────────────────────────────────── */}
        <div className="animate-fade-up delay-200 w-125 shrink-0">
          <DamChart />
        </div>

        </div>{/* end centered wrapper */}
      </div>

      {/* ── Stats bar ────────────────────────────────────────────────── */}
      <div className="bg-surface border-t-[3px] border-t-gold-600 border-b border-b-border">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={i}
              className={`py-7 px-6 text-center relative
                ${i < 3 ? 'sm:border-r sm:border-border' : ''}
                ${i < 2 ? 'border-b sm:border-b-0 border-border' : ''}`}
            >
              {/* Colored top accent per stat */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.75 rounded-b-full opacity-60"
                style={{ background: s.accent }} />
              <div className="text-[38px] font-bold font-mono leading-none mb-2"
                style={{ color: s.accent }}>
                {s.val}
              </div>
              <div className="text-[12px] font-semibold text-navy-950 uppercase tracking-[.6px]">{s.label}</div>
              <div className="dv text-[11.5px] text-muted mt-0.5">{s.mr}</div>
              <div className="text-[10.5px] text-muted/55 mt-2 tracking-[.2px]">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
