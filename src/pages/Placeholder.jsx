import { useNavigate } from 'react-router-dom';

const PAGE_META = {
  'Dashboard':  { icon: '📊', color: '#1E40AF', bg: '#EFF6FF', desc: 'Real-time dam monitoring & analytics' },
  'Commands':   { icon: '📋', color: '#6D28D9', bg: '#F5F3FF', desc: 'Issue and track gate operation commands' },
  'Execution':  { icon: '⚙️', color: '#0369A1', bg: '#E0F2FE', desc: 'Field execution and gate control' },
  'Logbook':    { icon: '📖', color: '#065F46', bg: '#ECFDF5', desc: 'Operation logs and audit trail' },
  'Alerts':     { icon: '🔔', color: '#B45309', bg: '#FFFBEB', desc: 'Flood alerts and notifications' },
  'Admin':      { icon: '🛡️', color: '#9D174D', bg: '#FDF2F8', desc: 'System administration and user management' },
  'Dam Info':   { icon: '🏛️', color: '#1E3A8A', bg: '#EFF6FF', desc: 'Dam specifications and live water data' },
};

export default function Placeholder({ title }) {
  const navigate  = useNavigate();
  const meta = PAGE_META[title] ?? { icon: '🚧', color: '#64748B', bg: '#F8FAFC', desc: 'Coming soon' };

  return (
    <div className="flex flex-col items-center justify-center min-h-[460px] px-6 py-16">
      <div className="text-center max-w-sm mx-auto animate-fade-up">

        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-[36px] mx-auto mb-6 shadow-card"
          style={{ background: meta.bg }}>
          {meta.icon}
        </div>

        {/* Title */}
        <h2 className="text-[22px] font-bold text-navy-950 font-serif mb-2">{title}</h2>
        <p className="text-[14px] text-muted leading-relaxed mb-2">{meta.desc}</p>

        {/* Status pill */}
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-semibold mt-1 mb-8"
          style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.color}22` }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: meta.color }} />
          Under Development
          <span className="dv font-normal opacity-70">· विकासाधीन</span>
        </div>

        {/* Back button */}
        <div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted border border-border rounded-lg px-5 py-2.5 hover:text-tx hover:border-navy-800 hover:bg-surface-2 transition-all cursor-pointer bg-surface"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
