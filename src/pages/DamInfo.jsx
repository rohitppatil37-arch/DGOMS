import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/index.js';
import { useUIStore } from '../store/uiStore.js';
import { DISTRICT_MR } from '../lib/constants.js';

// ── Tiny inline SVG helper ────────────────────────────────────────────────
function Ico({ d, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

// ── KPI config ────────────────────────────────────────────────────────────
const KPI_CFG = {
  blue:   { bar: 'from-[#1E3FA8] to-[#6A8FE8]', icon: ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M2 12s3.333-4 10-4 10 4 10 4'] },
  green:  { bar: 'from-[#0F5132] to-[#22C55E]',  icon: ['M3 3v18h18', 'M7 16v-4', 'M11 16V8', 'M15 16v-6', 'M19 16V3'] },
  amber:  { bar: 'from-[#7A4800] to-[#F59E0B]',  icon: ['M20 17.58A5 5 0 0018 8h-1.26A8 8 0 104 15.25', 'M8 19v1', 'M12 19v2', 'M16 19v1'] },
  purple: { bar: 'from-[#5B21B6] to-[#A78BFA]',  icon: ['M4 21V8M8 21V8M12 21V8M16 21V8M20 21V8', 'M2 8l10-5 10 5'] },
};

function KpiCard({ label, labelMr, value, unit, color, lang }) {
  const { bar, icon } = KPI_CFG[color];
  return (
    <div className="bg-surface border border-border rounded-lg p-3 relative overflow-hidden shadow-xs group">
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${bar}`} />
      {/* watermark icon */}
      <div className="absolute top-2.5 right-2.5 opacity-[0.07] text-navy-950">
        <Ico d={icon} size={24} />
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[.6px] mt-0.5 mb-2 leading-none"
           style={{ color: 'var(--color-xs)' }}>
        {lang === 'mr' ? labelMr : label}
      </div>
      <div className="text-[22px] font-bold text-navy-950 font-mono leading-none">
        {value ?? '–'}
        {unit && <span className="text-[11px] font-sans font-medium text-muted ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}

// ── Storage level bar ─────────────────────────────────────────────────────
function StorageBar({ pct, frl, lang }) {
  const fill = Math.min(Math.max(parseFloat(pct) || 0, 0), 100);
  const mr = lang === 'mr';
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10.5px] font-medium text-muted">
          {mr ? 'साठा पातळी' : 'Storage Level'}
        </span>
        <span className="text-[11.5px] font-bold text-navy-950 font-mono">
          {fill > 0 ? fill.toFixed(1) + '%' : '–'}
        </span>
      </div>
      <div className="h-3 bg-border-2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-500 via-amber-400 to-red-500 transition-[width] duration-700 ease-out"
          style={{ width: `${fill}%` }}
        />
      </div>
      <div className="flex justify-between text-[10.5px] mt-1.5" style={{ color: 'var(--color-xs)' }}>
        <span>0%</span>
        <span>FRL: {frl ?? '–'} m</span>
        <span>100%</span>
      </div>
    </div>
  );
}

// ── Section heading with accent bar ──────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-[3px] h-3.5 rounded-full bg-gold-600 shrink-0" />
      <span className="text-[10px] font-bold uppercase tracking-[.8px]" style={{ color: 'var(--color-xs)' }}>
        {children}
      </span>
    </div>
  );
}

// ── Dam info panel ────────────────────────────────────────────────────────
function DamInfoPanel({ dam, lang }) {
  const mr      = lang === 'mr';
  const name    = mr ? dam.nameMr : dam.nameEn;
  const river   = mr ? (dam.riverMr || dam.riverEn || '') : (dam.riverEn || '');
  const gtype   = mr ? (dam.gtypeMr || dam.gtypeEn || '–') : (dam.gtypeEn || '–');
  const contacts = (dam.contacts ?? []).filter(c => c.name);

  const details = [
    { k: 'frl',   label: mr ? 'पूर्ण साठा पातळी' : 'FRL',            val: dam.frl      ? dam.frl + ' m'                              : '–' },
    { k: 'mwl',   label: mr ? 'कमाल जल पातळी'    : 'MWL',            val: dam.mwl      ? dam.mwl + ' m'                              : '–' },
    { k: 'cap',   label: mr ? 'एकूण साठा'         : 'Total Capacity', val: dam.capacity ? dam.capacity + (mr ? ' दलघमी' : ' MCM')     : '–' },
    { k: 'gt',    label: mr ? 'दरवाजाचा प्रकार'  : 'Gate Type',      val: gtype                                                           },
    { k: 'catch', label: mr ? 'जलग्रहण क्षेत्र'  : 'Catchment Area', val: dam.catchment || '–'                                        },
  ];

  const officers = [
    { k: 'cd', label: mr ? 'नागरी विभाग'        : 'Civil Division',      val: dam.civilDiv },
    { k: 'cs', label: mr ? 'नागरी उपविभाग'      : 'Civil Sub-Division',  val: dam.civilSub },
    { k: 'md', label: mr ? 'यांत्रिक विभाग'     : 'Mech. Division',      val: dam.mechDiv  },
    { k: 'ms', label: mr ? 'यांत्रिक उपविभाग'  : 'Mech. Sub-Division',  val: dam.mechSub  },
    { k: 'ed', label: mr ? 'विद्युत विभाग'      : 'Elec. Division',      val: dam.elecDiv  },
    { k: 'es', label: mr ? 'विद्युत उपविभाग'   : 'Elec. Sub-Division',  val: dam.elecSub  },
  ];

  return (
    <div className="flex flex-col gap-3 animate-fade-up min-w-0">

      {/* ── Main card ─────────────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">

        {/* Dam header strip */}
        <div className="bg-navy-950 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className={`text-[18px] font-bold text-white leading-snug ${mr ? 'dv' : 'font-serif'}`}>
                {name}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {river && (
                  <span className="text-[12px] text-white/60 flex items-center gap-1">
                    <Ico d="M12 22s-8-6.5-8-12a8 8 0 0116 0c0 5.5-8 12-8 12z" size={11} />
                    {river}
                  </span>
                )}
                {dam.district && (
                  <span className="text-[12px] text-white/60 flex items-center gap-1">
                    <Ico d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" size={11} />
                    {mr ? (DISTRICT_MR[dam.district] || dam.district) : dam.district}
                  </span>
                )}
                {dam.division && (
                  <span className="text-[11px] text-white/40">{dam.division}</span>
                )}
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/25 text-[10.5px] font-semibold text-green-400 shrink-0 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" />
              {mr ? 'थेट माहिती' : 'Live Data'}
            </span>
          </div>
        </div>

        {/* KPIs + storage bar */}
        <div className="px-5 py-4 border-b border-border-2">
          <div className="grid grid-cols-4 gap-2">
            <KpiCard label="Water Level" labelMr="जलपातळी" value={dam.waterLevel || '–'}             unit="m"   color="blue"   lang={lang} />
            <KpiCard label="Storage"     labelMr="साठा"     value={dam.storage ? dam.storage + '%' : '–'}         color="green"  lang={lang} />
            <KpiCard label="Rainfall"    labelMr="पाऊस"     value={dam.rainfall || '–'}               unit="mm"  color="amber"  lang={lang} />
            <KpiCard label="Gates Open"  labelMr="दरवाजे"  value={dam.gates || '–'}                              color="purple" lang={lang} />
          </div>
          <StorageBar pct={dam.storage} frl={dam.frl} lang={lang} />
        </div>

        {/* Division details + Officers — side by side */}
        <div className="grid grid-cols-2 divide-x divide-border-2">

          <div className="px-5 py-4">
            <SectionTitle>{mr ? 'विभाग तपशील' : 'Division Details'}</SectionTitle>
            <table className="w-full">
              <tbody>
                {details.map(({ k, label, val }, idx) => (
                  <tr key={k} className={idx % 2 === 0 ? 'bg-surface' : 'bg-surface-2'}>
                    <td className={`py-1.5 px-2 text-[11.5px] text-muted align-top w-[48%] leading-snug first:rounded-l last:rounded-l ${mr ? 'dv' : ''}`}>
                      {label}
                    </td>
                    <td className="py-1.5 px-2 text-[12px] font-semibold text-tx leading-snug last:rounded-r">
                      {val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4">
            <SectionTitle>{mr ? 'प्रभारी अधिकारी' : 'Officers in Charge'}</SectionTitle>
            <table className="w-full">
              <tbody>
                {officers.map(({ k, label, val }, idx) => (
                  <tr key={k} className={idx % 2 === 0 ? 'bg-surface' : 'bg-surface-2'}>
                    <td className={`py-1.5 px-2 text-[11.5px] text-muted align-top w-[48%] leading-snug ${mr ? 'dv' : ''}`}>
                      {label}
                    </td>
                    <td className={`py-1.5 px-2 text-[12px] font-semibold text-tx leading-snug ${mr ? 'dv' : ''}`}>
                      {val || '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Contacts card ──────────────────────────────────────────── */}
      {contacts.length > 0 && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
          <div className="px-5 py-3 border-b border-border-2 flex items-center gap-2">
            <div className="w-[3px] h-3.5 rounded-full bg-gold-600 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-[.8px]" style={{ color: 'var(--color-xs)' }}>
              {mr ? 'अधिकारी संपर्क' : 'Officer Contacts'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px]">
              <thead>
                <tr className="bg-navy-950/90 border-b border-navy-800">
                  <th className="text-[10.5px] font-semibold text-white/70 px-5 py-2.5 text-left tracking-[.4px] uppercase">
                    {mr ? 'नाव' : 'Name'}
                  </th>
                  <th className="text-[10.5px] font-semibold text-white/70 px-4 py-2.5 text-left tracking-[.4px] uppercase">
                    {mr ? 'पदनाम' : 'Designation'}
                  </th>
                  <th className="text-[10.5px] font-semibold text-white/70 px-4 py-2.5 text-left tracking-[.4px] uppercase">
                    {mr ? 'मोबाइल' : 'Mobile'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c, i) => (
                  <tr key={i} className={`border-b border-border-2 last:border-b-0 hover:bg-surface-2 transition-colors ${i % 2 === 1 ? 'bg-surface-2/50' : ''}`}>
                    <td className="px-5 py-2.5 text-[13px] font-medium text-tx dv">{c.name}</td>
                    <td className="px-4 py-2.5 text-[12px] text-muted">{c.desig || '–'}</td>
                    <td className="px-4 py-2.5">
                      {c.mobile
                        ? <a href={`tel:${c.mobile}`} className="text-[13px] font-mono text-bl-800 hover:underline">{c.mobile}</a>
                        : <span className="text-[13px] text-muted">–</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Selector tile ─────────────────────────────────────────────────────────
function Tile({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`text-left border rounded-lg px-3 py-2.5 w-full transition-all font-sans cursor-pointer ${
        active
          ? 'border-navy-800 bg-navy-950/[.05] shadow-xs ring-1 ring-navy-800/30'
          : 'border-border bg-surface-2 hover:border-navy-700/60 hover:bg-surface hover:shadow-xs'
      }`}
    >
      {children}
    </button>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────
function Skeleton({ rows = 4, cols = 2 }) {
  return (
    <div className={`grid gap-1.5 ${cols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-[46px] bg-border-2 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

// ── Empty state panel ─────────────────────────────────────────────────────
function EmptyPanel({ noData, lang }) {
  const mr = lang === 'mr';
  return (
    <div className="bg-surface border border-border rounded-xl py-16 px-8 text-center shadow-xs min-w-0">
      {/* SVG illustration */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-950/[.06] mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-navy-950/40">
          <path d="M2 20h20" />
          <path d="M5 20V9l7-5 7 5v11" />
          <path d="M9 20v-6h6v6" />
          <path d="M9 11h2M13 11h2" />
          <path d="M2 9h3M19 9h3" />
        </svg>
      </div>
      <div className="text-[14px] font-bold text-navy-950 mb-2">
        {mr ? 'धरण निवडा' : 'Select a Dam'}
      </div>
      <div className={`text-[12.5px] text-muted leading-relaxed ${mr ? '' : 'dv'}`}>
        {mr
          ? 'तपशील पाहण्यासाठी डाव्या बाजूने जिल्हा व धरण निवडा.'
          : 'जिल्हा व धरण निवडा — तपशील येथे दिसेल.'}
      </div>
      {noData && (
        <div className="mt-5 text-[12px] text-am-800 bg-am-50 border border-am-800/20 rounded-lg px-4 py-3 text-left">
          <div className="font-semibold mb-0.5">
            {mr ? 'अद्याप कोणतेही धरण जोडलेले नाही.' : 'No dams have been added yet.'}
          </div>
          <div className="opacity-60 text-[11px] mt-0.5">Login → Admin → Dams → + Add Dam</div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function DamInfo() {
  const { lang, setCurrentDam, setCurrentDist } = useUIStore();
  const [selDistOverride, setSelDistOverride] = useState(null);
  const [selDamOverride,  setSelDamOverride]  = useState(null);

  const { data: dams = [], isLoading } = useQuery({
    queryKey: ['dams'],
    queryFn:  () => api.getDams(),
    select:   res => (res.dams ?? []).filter(d => d.status === 'active'),
  });

  // Group by district
  const districtMap = {};
  dams.forEach(dam => {
    if (!districtMap[dam.district]) districtMap[dam.district] = [];
    districtMap[dam.district].push(dam);
  });
  const districts = Object.keys(districtMap);

  // Effective selection: user's override, falling back to the first
  // district/dam once data loads — derived during render instead of
  // mirrored into state via an effect, so it's always in sync with `dams`.
  const selDist  = selDistOverride ?? districts[0] ?? null;
  const distDams = selDist ? (districtMap[selDist] ?? []) : [];
  const selDam   = selDamOverride
    ? (distDams.find(d => d.id === selDamOverride) ?? distDams[0] ?? null)
    : (distDams[0] ?? null);

  // Sync the effective selection to the shared UI store (ticker/header read this)
  useEffect(() => {
    setCurrentDist(selDist);
    setCurrentDam(selDam?.id ?? null);
  }, [selDist, selDam, setCurrentDist, setCurrentDam]);

  const isMr = lang === 'mr';

  function onDistClick(dk) {
    setSelDistOverride(dk);
    setSelDamOverride(null);
  }

  function onDamClick(dam) {
    setSelDamOverride(dam.id);
  }

  return (
    <div>
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="bg-surface border-b border-border px-5 py-3.5 flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-navy-950/[.07] shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-navy-950">
            <path d="M2 20h20" />
            <path d="M5 20V9l7-5 7 5v11" />
            <path d="M9 20v-6h6v6" />
            <path d="M9 11h2M13 11h2" />
          </svg>
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-navy-950 font-serif leading-none">
            {isMr ? 'धरण माहिती' : 'Dam Information'}
          </h3>
          <div className={`text-[11.5px] text-muted mt-1 leading-none ${isMr ? '' : 'dv'}`}>
            {isMr ? 'Dam Information — सार्वजनिक विभाग' : 'धरण माहिती — सार्वजनिक विभाग · Public Section'}
          </div>
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────── */}
      <div className="p-4 grid gap-3 items-start" style={{ gridTemplateColumns: '300px 1fr' }}>

        {/* Left: selectors */}
        <div className="flex flex-col gap-3">

          {/* District card */}
          <div className="bg-surface border border-border rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-[3px] h-3.5 rounded-full bg-gold-600 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-[.8px]" style={{ color: 'var(--color-xs)' }}>
                {isMr ? 'जिल्हा निवडा' : 'Select District'}
              </span>
            </div>

            {isLoading && <Skeleton rows={4} cols={2} />}

            {!isLoading && districts.length === 0 && (
              <div className="text-[13px] text-muted py-1">
                {isMr ? 'अद्याप कोणताही जिल्हा उपलब्ध नाही.' : 'No districts available yet.'}
                <span className="block text-[11px] mt-1.5" style={{ color: 'var(--color-xs)' }}>
                  Login → Admin → Dams → + Add Dam
                </span>
              </div>
            )}

            {!isLoading && districts.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5">
                {districts.map(dk => (
                  <Tile key={dk} active={selDist === dk} onClick={() => onDistClick(dk)}>
                    <span className="block text-[13px] font-bold text-navy-950 leading-snug">
                      {isMr ? (DISTRICT_MR[dk] || dk) : dk}
                    </span>
                    <span className="block text-[10px] text-muted mt-0.5">
                      {isMr ? dk : (DISTRICT_MR[dk] || '')}
                    </span>
                    <span className="inline-flex items-center gap-1 mt-1">
                      <span className="text-[10px] font-semibold text-bl-800 bg-bl-50 px-1.5 py-0.5 rounded">
                        {districtMap[dk].length} {isMr ? 'धरण' : `dam${districtMap[dk].length > 1 ? 's' : ''}`}
                      </span>
                    </span>
                  </Tile>
                ))}
              </div>
            )}
          </div>

          {/* Dam card */}
          <div className="bg-surface border border-border rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-[3px] h-3.5 rounded-full bg-gold-600 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-[.8px]" style={{ color: 'var(--color-xs)' }}>
                {isMr ? 'धरण निवडा' : 'Select Dam'}
              </span>
            </div>

            {!selDist && (
              <p className="text-[13px] text-muted">
                {isMr ? 'आधी जिल्हा निवडा.' : 'Select a district first.'}
              </p>
            )}
            {selDist && distDams.length === 0 && (
              <p className="text-[13px] text-muted">
                {isMr ? 'या जिल्ह्यात अद्याप धरण नाही.' : 'No dams in this district yet.'}
              </p>
            )}

            {distDams.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {distDams.map(dam => {
                  const hasSt = dam.storage && parseFloat(dam.storage) > 0;
                  return (
                    <Tile key={dam.id} active={selDam?.id === dam.id} onClick={() => onDamClick(dam)}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className={`block text-[13px] font-bold text-navy-950 leading-snug truncate ${isMr ? 'dv' : ''}`}>
                            {isMr ? dam.nameMr : dam.nameEn}
                          </span>
                          <span className={`block text-[11px] text-muted mt-0.5 truncate ${isMr ? '' : 'dv'}`}>
                            {isMr ? (dam.riverMr || dam.riverEn) : dam.riverEn}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {hasSt && (
                            <span className="text-[10px] font-bold font-mono text-navy-950 bg-bl-50 px-1.5 py-0.5 rounded border border-bl-800/15">
                              {parseFloat(dam.storage).toFixed(0)}%
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-[9.5px] text-gr-700 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
                            Live
                          </span>
                        </div>
                      </div>
                    </Tile>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: dam info panel */}
        <div className="min-w-0">
          {selDam
            ? <DamInfoPanel dam={selDam} lang={lang} />
            : <EmptyPanel noData={dams.length === 0 && !isLoading} lang={lang} />
          }
        </div>
      </div>
    </div>
  );
}
