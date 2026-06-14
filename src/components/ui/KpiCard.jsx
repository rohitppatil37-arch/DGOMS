const ACCENT = {
  blue:   { bar: 'from-bl-800 to-[#6A8FE8]', icon: 'bg-bl-50' },
  green:  { bar: 'from-gr-700 to-[#22C55E]', icon: 'bg-gr-50' },
  amber:  { bar: 'from-am-800 to-[#F59E0B]', icon: 'bg-am-50' },
  red:    { bar: 'from-rd-800 to-[#EF4444]', icon: 'bg-rd-50' },
  purple: { bar: 'from-pu-700 to-[#A78BFA]', icon: 'bg-pu-50' },
};

export default function KpiCard({ color = 'blue', icon, label, labelMr, value, unit, trend, trendDir }) {
  const a = ACCENT[color];
  return (
    <div className="bg-surface border border-border rounded-lg p-[14px] shadow-card relative overflow-hidden hover:shadow-md transition-shadow">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-lg bg-gradient-to-r ${a.bar}`} />

      {/* Icon */}
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[17px] mb-[10px] ${a.icon}`}>
        {icon}
      </div>

      {/* Label */}
      <div className="text-[11px] font-semibold text-muted uppercase tracking-[.6px] mb-[5px]">
        {label}
        {labelMr && <span className="dv text-[10px] normal-case tracking-normal font-normal block mt-[1px] text-muted">{labelMr}</span>}
      </div>

      {/* Value */}
      <div className="text-[26px] font-bold text-navy-950 leading-none font-mono">
        {value ?? '—'}
        {unit && <span className="text-[13px] text-muted font-medium font-sans ml-[2px]">{unit}</span>}
      </div>

      {/* Trend */}
      {trend && (
        <div className={`text-[11.5px] mt-[5px] font-medium ${trendDir === 'up' ? 'text-[#16A34A]' : trendDir === 'dn' ? 'text-[#DC2626]' : 'text-muted'}`}>
          {trend}
        </div>
      )}
    </div>
  );
}
