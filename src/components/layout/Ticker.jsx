import { useUIStore } from "../../store/uiStore.js";
import { t } from "../../lib/i18n.js";

export default function Ticker({ damData }) {
  const { lang } = useUIStore();
  const live = damData?.live ?? {};
  const name = damData
    ? lang === "mr"
      ? damData.mr?.name
      : damData.en?.name
    : null;

  return (
    <div className="bg-navy-950 border-b border-white/[.07] flex overflow-x-auto scrollbar-none items-stretch">
      {/* LIVE badge */}
      <div className="flex items-center gap-2 px-5 py-2 shrink-0 bg-[#6B0000]/80 border-r border-white/6">
        <span className="w-2 h-2 rounded-full bg-[#4ade80] shrink-0 animate-pulse-dot" />
        <span className="text-[10.5px] font-bold text-white/90 tracking-[1px] uppercase">
          {t("live", lang)}
        </span>
      </div>

      {/* Data items */}
      <TickerItem
        label={name ? `${name} — Water Level` : t("waterLevel", lang)}
      >
        <span className="text-[#7DD3FC] font-bold text-[13px] font-mono">
          {live.wl ?? "—"} m
        </span>
      </TickerItem>

      <TickerItem label={t("storage", lang)}>
        <span className="text-[#7DD3FC] font-bold text-[13px] font-mono">
          {live.st ?? "—"}%
        </span>
      </TickerItem>

      <TickerItem label={t("rain", lang)}>
        <span className="text-[#7DD3FC] font-bold text-[13px] font-mono">
          {live.rn ?? "—"} mm
        </span>
      </TickerItem>

      <TickerItem label={t("gates", lang)}>
        <span className="text-[#7DD3FC] font-bold text-[13px] font-mono">
          {damData?.gates ?? "—"}
        </span>
      </TickerItem>

      {live.alert && (
        <TickerItem>
          <span className="text-[#FCD34D] font-semibold text-[12px]">
            ⚠ &nbsp;{live.alert}
          </span>
        </TickerItem>
      )}
    </div>
  );
}

function TickerItem({ label, children }) {
  return (
    <div className="px-5 py-2 flex items-center gap-2.5 shrink-0 whitespace-nowrap border-r border-white/6">
      {label && (
        <span className="text-[11px] text-white/38 font-medium uppercase tracking-[.6px]">
          {label}
        </span>
      )}
      {label && <span className="text-white/18 text-[11px]">·</span>}
      {children}
    </div>
  );
}
