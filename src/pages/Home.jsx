import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useUIStore }  from '../store/uiStore.js';
import { t }          from '../lib/i18n.js';
import Button         from '../components/ui/Button.jsx';

// Animated dam SVG — ported from original
function DamSVG() {
  return (
    <svg width="300" height="120" viewBox="0 0 300 120"
      style={{ borderRadius: 8, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,.3))' }}>
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
      {/* Gate pillars */}
      {[60,82,104,126,148,170,192].map((x, i) => (
        <rect key={i} x={x} y="48" width="8" height="22" fill={`rgba(255,255,255,${i===3||i===6?.7:.55})`} rx="1" />
      ))}
      {/* Water ripple */}
      <path d="M0 75 Q25 70 50 75 Q75 80 100 75 Q125 70 150 75 Q175 80 200 75 Q225 70 250 75 Q275 80 300 75"
        fill="none" stroke="rgba(147,197,253,.6)" strokeWidth="1.5">
        <animate attributeName="d" dur="3s" repeatCount="indefinite"
          values="M0 75 Q25 70 50 75 Q75 80 100 75 Q125 70 150 75 Q175 80 200 75 Q225 70 250 75 Q275 80 300 75;M0 78 Q25 73 50 78 Q75 83 100 78 Q125 73 150 78 Q175 83 200 78 Q225 73 250 78 Q275 83 300 78;M0 75 Q25 70 50 75 Q75 80 100 75 Q125 70 150 75 Q175 80 200 75 Q225 70 250 75 Q275 80 300 75" />
      </path>
      {/* Animated open gate */}
      <rect x="126" y="55" width="8" height="30" fill="#22C55E" opacity=".8" rx="1">
        <animate attributeName="height" dur="3s" repeatCount="indefinite" values="30;18;30" />
        <animate attributeName="y"      dur="3s" repeatCount="indefinite" values="55;67;55" />
      </rect>
      <text x="8" y="115" fill="rgba(255,255,255,.35)" fontSize="9" fontFamily="DM Mono">UJANI DAM · 27 GATES · LIVE</text>
    </svg>
  );
}

const STAT_CARDS = [
  { val: '23',  label: 'DAMS',      mr: 'धरणे'   },
  { val: '284', label: 'GATES',     mr: 'दरवाजे'  },
  { val: '47',  label: 'OFFICERS',  mr: 'अधिकारी' },
  { val: '6',   label: 'DISTRICTS', mr: 'जिल्हे'  },
];

const FEATURE_CARDS = [
  { icon: '🏛️', bg: '#DBEAFE', titleKey: 'damInfo',   mrKey: 'damInfoMr',   note: 'Public · Water levels, officers', to: '/pub',  locked: false },
  { icon: '📊', bg: '#D1FAE5', titleKey: 'dashboard', mrKey: 'dashboardMr', note: '🔒 Login required',                to: '/dash', locked: true  },
  { icon: '📋', bg: '#FEF3C7', titleKey: 'commands',  mrKey: 'commandsMr',  note: '🔒 Division Officer+',            to: '/cmd',  locked: true  },
  { icon: '⚙️', bg: '#EDE9FE', titleKey: 'execution', mrKey: 'executionMr', note: '🔒 Field Officer+',               to: '/exec', locked: true  },
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
      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-[#1A3870] min-h-[440px] flex flex-col items-center justify-center px-5 py-9 text-center relative overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[.015]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 60px,rgba(255,255,255,1) 60px,rgba(255,255,255,1) 61px),repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(255,255,255,1) 60px,rgba(255,255,255,1) 61px)' }} />

        {/* Live badge */}
        <div className="inline-flex items-center gap-[7px] bg-[rgba(192,144,32,.18)] border border-[rgba(192,144,32,.35)] rounded-full px-[14px] py-[5px] text-[11.5px] font-semibold text-gold-400 tracking-[.5px] mb-[18px]">
          <span className="w-[7px] h-[7px] rounded-full bg-[#4ADE80] shrink-0 animate-pulse-dot" />
          LIVE MONITORING ACTIVE
        </div>

        {/* Heading */}
        <h1 className="text-[26px] font-bold text-white font-serif leading-[1.25] mb-[6px] tracking-[.3px]">
          {t('heroTitle', lang).split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </h1>
        <div className="dv text-[17px] text-white/70 mb-[10px]">{t('heroSub', lang)}</div>
        <p className="text-[13px] text-white/50 max-w-[360px] mx-auto mb-[22px] leading-[1.65]">{t('heroDesc', lang)}</p>

        {/* Dam illustration */}
        <div className="mb-[26px]"><DamSVG /></div>

        {/* CTA buttons */}
        <div className="flex gap-[10px] flex-wrap justify-center mb-4">
          <button
            onClick={() => navigate('/pub')}
            className="inline-flex items-center gap-[6px] border border-white/30 text-white bg-transparent rounded-[5px] px-4 py-[9px] text-[13px] font-semibold cursor-pointer hover:bg-white/10 transition-all"
          >
            🏛️ {t('viewDamInfo', lang)}
          </button>
          <Button variant="gold" onClick={() => navigate('/login')}>
            🔑 {t('officerLogin', lang)} <span className="opacity-70">→</span>
          </Button>
        </div>

        <div className="text-[11.5px] text-white/35 flex items-center gap-[5px]">
          🔒 <span>{t('heroNote', lang)}</span>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-4 bg-surface border-t-[3px] border-gold-600 border-b border-border sm:grid-cols-4 grid-cols-2">
        {STAT_CARDS.map((s, i) => (
          <div key={i} className={`py-[14px] px-3 text-center ${i < 3 ? 'border-r border-border' : ''} ${i >= 2 ? 'max-sm:border-t max-sm:border-border' : ''}`}>
            <div className="text-[22px] font-bold text-navy-950 font-mono">{s.val}</div>
            <div className="text-[11px] text-muted mt-[3px] uppercase tracking-[.5px]">{s.label}</div>
            <div className="dv text-[10px] text-xs mt-[2px]">{s.mr}</div>
          </div>
        ))}
      </div>

      {/* ── Feature cards ── */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {FEATURE_CARDS.map((fc, i) => (
          <div
            key={i}
            onClick={() => goTo(fc.to, fc.locked)}
            className="bg-surface border border-border rounded-lg p-[14px_16px] shadow-card flex gap-3 items-start cursor-pointer hover:shadow-md hover:-translate-y-[2px] hover:border-navy-800 transition-all"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[18px] shrink-0" style={{ background: fc.bg }}>
              {fc.icon}
            </div>
            <div>
              <div className="text-[13.5px] font-bold text-navy-950">{t(fc.titleKey, lang)}</div>
              <div className="dv text-[12px] text-muted mt-[3px]">{t(fc.mrKey, lang === 'en' ? 'en' : 'mr')}</div>
              <div className="text-[11px] text-xs mt-[5px]">{fc.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
