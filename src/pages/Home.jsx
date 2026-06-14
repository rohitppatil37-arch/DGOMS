import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useUIStore }  from '../store/uiStore.js';
import { t }          from '../lib/i18n.js';
import Button         from '../components/ui/Button.jsx';

function DamSVG() {
  return (
    <svg width="340" height="130" viewBox="0 0 300 120"
      style={{ borderRadius: 10, filter: 'drop-shadow(0 6px 24px rgba(0,0,0,.4))' }}>
      <defs>
        <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1A3870" />
          <stop offset="100%" stopColor="#1D4ED8" stopOpacity=".6" />
        </linearGradient>
        <linearGradient id="waterG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>
      <rect width="300" height="120" fill="url(#skyG)" />
      <polygon points="0,70 40,30 80,70"   fill="#2563EB" opacity=".5" />
      <polygon points="15,70 65,18 115,70" fill="#3B82F6" opacity=".55" />
      <polygon points="190,70 240,22 300,70" fill="#2563EB" opacity=".5" />
      <polygon points="175,70 235,16 300,70" fill="#3B82F6" opacity=".55" />
      <rect x="0"   y="60" width="220" height="60" fill="url(#waterG)" opacity=".9" />
      <rect x="110" y="42" width="80"  height="28" fill="url(#waterG)" opacity=".7" />
      <rect x="220" y="60" width="80"  height="60" fill="url(#waterG)" opacity=".9" />
      {[60,82,104,126,148,170,192].map((x, i) => (
        <rect key={i} x={x} y="48" width="8" height="22" fill={`rgba(255,255,255,${i===3||i===6?.7:.55})`} rx="1" />
      ))}
      <path d="M0 75 Q25 70 50 75 Q75 80 100 75 Q125 70 150 75 Q175 80 200 75 Q225 70 250 75 Q275 80 300 75"
        fill="none" stroke="rgba(147,197,253,.6)" strokeWidth="1.5">
        <animate attributeName="d" dur="3s" repeatCount="indefinite"
          values="M0 75 Q25 70 50 75 Q75 80 100 75 Q125 70 150 75 Q175 80 200 75 Q225 70 250 75 Q275 80 300 75;M0 78 Q25 73 50 78 Q75 83 100 78 Q125 73 150 78 Q175 83 200 78 Q225 73 250 78 Q275 83 300 78;M0 75 Q25 70 50 75 Q75 80 100 75 Q125 70 150 75 Q175 80 200 75 Q225 70 250 75 Q275 80 300 75" />
      </path>
      <rect x="126" y="55" width="8" height="30" fill="#22C55E" opacity=".8" rx="1">
        <animate attributeName="height" dur="3s" repeatCount="indefinite" values="30;18;30" />
        <animate attributeName="y"      dur="3s" repeatCount="indefinite" values="55;67;55" />
      </rect>
      <text x="8" y="115" fill="rgba(255,255,255,.3)" fontSize="9" fontFamily="DM Mono">UJANI DAM · 27 GATES · LIVE</text>
    </svg>
  );
}

const STATS = [
  { val: '23',  label: 'Dams',      mr: 'धरणे',    accent: '#E8B84B' },
  { val: '284', label: 'Gates',     mr: 'दरवाजे',   accent: '#60A5FA' },
  { val: '47',  label: 'Officers',  mr: 'अधिकारी',  accent: '#4ADE80' },
  { val: '6',   label: 'Districts', mr: 'जिल्हे',   accent: '#F472B6' },
];

const FEATURE_CARDS = [
  {
    icon: '🏛️',
    bg: 'linear-gradient(135deg,#DBEAFE,#EFF6FF)',
    border: '#BFDBFE',
    titleKey: 'damInfo',
    mrKey: 'damInfoMr',
    desc: 'Water levels, gate info & officers',
    badge: 'Public',
    badgeColor: '#16A34A',
    badgeBg: '#DCFCE7',
    to: '/pub',
    locked: false,
  },
  {
    icon: '📊',
    bg: 'linear-gradient(135deg,#D1FAE5,#ECFDF5)',
    border: '#A7F3D0',
    titleKey: 'dashboard',
    mrKey: 'dashboardMr',
    desc: 'Real-time dam monitoring dashboard',
    badge: 'Login required',
    badgeColor: '#B45309',
    badgeBg: '#FEF3C7',
    to: '/dash',
    locked: true,
  },
  {
    icon: '📋',
    bg: 'linear-gradient(135deg,#FEF3C7,#FFFBEB)',
    border: '#FDE68A',
    titleKey: 'commands',
    mrKey: 'commandsMr',
    desc: 'Issue & track gate operation commands',
    badge: 'Division Officer+',
    badgeColor: '#7C3AED',
    badgeBg: '#EDE9FE',
    to: '/cmd',
    locked: true,
  },
  {
    icon: '⚙️',
    bg: 'linear-gradient(135deg,#EDE9FE,#F5F3FF)',
    border: '#DDD6FE',
    titleKey: 'execution',
    mrKey: 'executionMr',
    desc: 'Execute gate operations in the field',
    badge: 'Field Officer+',
    badgeColor: '#0369A1',
    badgeBg: '#E0F2FE',
    to: '/exec',
    locked: true,
  },
];

export default function Home({ dams }) {
  const navigate  = useNavigate();
  const { loggedIn } = useAuthStore();
  const { lang }  = useUIStore();

  function goTo(to, locked) {
    if (locked && !loggedIn) navigate('/login');
    else navigate(to);
  }

  return (
    <div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="bg-linear-to-br from-navy-950 via-navy-900 to-[#1A3870] flex flex-col items-center justify-center px-6 pt-10 pb-8 text-center relative overflow-hidden">

        {/* Soft radial glow — subtle depth, no visual clutter */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(232,184,75,.07) 0%, transparent 70%)' }} />

        {/* Live monitoring badge */}
        <div className="animate-fade-up inline-flex items-center gap-2 bg-[rgba(232,184,75,.12)] border border-[rgba(232,184,75,.28)] rounded-full px-4 py-1.75 mb-7">
          <span className="w-2 h-2 rounded-full bg-[#4ADE80] shrink-0 animate-pulse-dot" />
          <span className="text-[11px] font-semibold text-gold-400 tracking-[.6px] uppercase">Live Monitoring Active</span>
        </div>

        {/* Heading */}
        <h1 className="animate-fade-up delay-100 text-[30px] sm:text-[36px] font-bold text-white font-serif leading-[1.2] mb-3 tracking-[.2px] max-w-175">
          {t('heroTitle', lang).split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </h1>

        <div className="animate-fade-up delay-150 dv text-[17px] text-white/60 mb-3">
          {t('heroSub', lang)}
        </div>

        <p className="animate-fade-up delay-150 text-[13.5px] text-white/45 max-w-105 mx-auto mb-10 leading-[1.7]">
          {t('heroDesc', lang)}
        </p>

        {/* Dam illustration */}
        <div className="animate-fade-up delay-200 mb-10">
          <DamSVG />
        </div>

        {/* CTA buttons */}
        <div className="animate-fade-up delay-250 flex gap-3 flex-wrap justify-center mb-5">
          <button
            onClick={() => navigate('/pub')}
            className="inline-flex items-center gap-2 border border-white/25 text-white/85 bg-white/5 rounded-lg px-5 py-2.5 text-[13.5px] font-semibold cursor-pointer hover:bg-white/10 hover:border-white/40 transition-all"
          >
            🏛️ {t('viewDamInfo', lang)}
          </button>
          <Button variant="gold" onClick={() => navigate('/login')}>
            🔑 {t('officerLogin', lang)} →
          </Button>
        </div>

        <div className="animate-fade-up delay-300 text-[11.5px] text-white/28 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
            <path d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z" />
            <path d="M17 11V7a5 5 0 00-10 0v4" />
          </svg>
          <span>{t('heroNote', lang)}</span>
        </div>
      </div>

      {/* ── Stats bar ────────────────────────────────────────────────── */}
      <div className="bg-surface border-t-[3px] border-t-gold-600 border-b border-b-border">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={i}
              className={`py-6 px-6 text-center relative
                ${i < 3 ? 'sm:border-r sm:border-border' : ''}
                ${i < 2 ? 'border-b sm:border-b-0 border-border' : ''}`}
            >
              {/* Colored top accent per stat */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.75 rounded-b-full opacity-70"
                style={{ background: s.accent }} />
              <div className="text-[30px] font-bold font-mono leading-none mb-1.5"
                style={{ color: s.accent }}>
                {s.val}
              </div>
              <div className="text-[11.5px] font-semibold text-navy-950 uppercase tracking-[.6px]">{s.label}</div>
              <div className="dv text-[11px] text-muted mt-0.5">{s.mr}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Feature cards ─────────────────────────────────────────────── */}
      <div className="px-5 pt-8 pb-10">
        <div className="mb-6 text-center">
          <h2 className="text-[13px] font-bold text-muted uppercase tracking-[1.2px]">System Modules</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-300 mx-auto">
          {FEATURE_CARDS.map((fc, i) => (
            <div
              key={i}
              onClick={() => goTo(fc.to, fc.locked)}
              className="rounded-xl p-6 cursor-pointer transition-all card-lift border"
              style={{ background: fc.bg, borderColor: fc.border }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-[26px] mb-4 bg-white/60 shadow-xs">
                {fc.icon}
              </div>

              {/* Title */}
              <div className="text-[15px] font-bold text-navy-950 mb-0.5">
                {t(fc.titleKey, lang)}
              </div>
              <div className="dv text-[12px] text-muted mb-3">
                {t(fc.mrKey, lang === 'en' ? 'en' : 'mr')}
              </div>

              {/* Description */}
              <div className="text-[12.5px] text-muted/80 leading-[1.55] mb-4">{fc.desc}</div>

              {/* Access badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.25 text-[11px] font-semibold"
                style={{ color: fc.badgeColor, background: fc.badgeBg }}>
                {fc.locked && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z" />
                    <path d="M17 11V7a5 5 0 00-10 0v4" />
                  </svg>
                )}
                {fc.badge}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
