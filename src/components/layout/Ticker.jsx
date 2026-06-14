import { useUIStore } from '../../store/uiStore.js';
import { t }         from '../../lib/i18n.js';

export default function Ticker({ damData }) {
  const { lang } = useUIStore();
  const live = damData?.live ?? {};
  const name = damData ? (lang === 'mr' ? damData.mr?.name : damData.en?.name) : null;

  return (
    <div className="bg-navy-950 border-b border-white/8 flex overflow-x-auto scrollbar-none">
      {/* LIVE badge */}
      <div className="bg-[#8B0000] text-white px-[13px] py-[7px] text-[11px] font-bold flex items-center gap-[5px] shrink-0 tracking-[.5px]">
        <span className="w-[7px] h-[7px] rounded-full bg-[#4ade80] shrink-0 animate-pulse-dot" />
        {t('live', lang)}
      </div>

      {/* Water level */}
      <TickerItem label={name ? `${name} WL` : t('waterLevel', lang)}>
        <span className="text-[#93C5FD] font-bold text-[13px] font-mono">{live.wl ?? '—'} m</span>
      </TickerItem>

      {/* Storage */}
      <TickerItem label={t('storage', lang)}>
        <span className="text-[#93C5FD] font-bold text-[13px] font-mono">{live.st ?? '—'}%</span>
      </TickerItem>

      {/* Rain */}
      <TickerItem label={t('rain', lang)}>
        <span className="text-[#93C5FD] font-bold text-[13px] font-mono">{live.rn ?? '—'} mm</span>
      </TickerItem>

      {/* Gates */}
      <TickerItem label={t('gates', lang)}>
        <span className="text-[#93C5FD] font-bold text-[13px] font-mono">{damData?.gates ?? '—'}</span>
      </TickerItem>

      {/* Alert (shown only when level is high) */}
      {live.alert && (
        <TickerItem>
          <span className="text-[#FBBF24] font-medium">⚠ &nbsp;{live.alert}</span>
        </TickerItem>
      )}
    </div>
  );
}

function TickerItem({ label, children }) {
  return (
    <div className="px-[14px] py-[7px] text-[12px] text-white/75 border-r border-white/8 flex items-center gap-[5px] shrink-0 whitespace-nowrap">
      {label && <span>{label}:</span>}
      {children}
    </div>
  );
}
