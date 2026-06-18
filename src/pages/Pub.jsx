import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/index.js';
import { useUIStore } from '../store/uiStore.js';

// ── KPI card ─────────────────────────────────────────────────────────────
const KPI_BAR = {
  blue:   'from-[#1E3FA8] to-[#6A8FE8]',
  green:  'from-[#0F5132] to-[#22C55E]',
  amber:  'from-[#7A4800] to-[#F59E0B]',
  purple: 'from-[#5B21B6] to-[#A78BFA]',
};

function KpiCard({ label, labelMr, value, unit, color, lang }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-3 relative overflow-hidden shadow-xs">
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${KPI_BAR[color]}`} />
      <div className="text-[10px] font-bold uppercase tracking-[.6px] mt-0.5 mb-1.5 leading-none"
           style={{ color: 'var(--color-xs)' }}>
        {lang === 'mr' ? labelMr : label}
      </div>
      <div className="text-[20px] font-bold text-navy-950 font-mono leading-none">
        {value ?? '–'}
        {unit && (
          <span className="text-[11px] font-sans font-medium text-muted ml-0.5">{unit}</span>
        )}
      </div>
    </div>
  );
}

// ── Dam info panel ────────────────────────────────────────────────────────
function DamInfoPanel({ dam, lang }) {
  const mr       = lang === 'mr';
  const name     = mr ? dam.nameMr : dam.nameEn;
  const river    = mr ? (dam.riverMr || dam.riverEn || '') : (dam.riverEn || '');
  const gtype    = mr ? (dam.gtypeMr || dam.gtypeEn || '–') : (dam.gtypeEn || '–');
  const storagePct = Math.min(Math.max(parseFloat(dam.storage) || 0, 0), 100);
  const contacts = (dam.contacts ?? []).filter(c => c.name);

  const details = [
    { k: 'frl',   label: mr ? 'पूर्ण साठा पातळी' : 'FRL',           val: dam.frl     ? dam.frl  + ' m'                          : '–' },
    { k: 'mwl',   label: mr ? 'कमाल जल पातळी'    : 'MWL',           val: dam.mwl     ? dam.mwl  + ' m'                          : '–' },
    { k: 'cap',   label: mr ? 'एकूण साठा'         : 'Capacity',      val: dam.capacity ? dam.capacity + (mr ? ' दलघमी' : ' MCM') : '–' },
    { k: 'gt',    label: mr ? 'दरवाजाचा प्रकार'  : 'Gate Type',     val: gtype                                                       },
    { k: 'catch', label: mr ? 'जलग्रहण क्षेत्र'  : 'Catchment Area', val: dam.catchment || '–'                                    },
  ];

  const officers = [
    { k: 'cd', label: mr ? 'नागरी विभाग'       : 'Civil Div.',  val: dam.civilDiv },
    { k: 'cs', label: mr ? 'नागरी उपविभाग'     : 'Civil Sub.',  val: dam.civilSub },
    { k: 'md', label: mr ? 'यांत्रिक विभाग'    : 'Mech. Div.', val: dam.mechDiv  },
    { k: 'ms', label: mr ? 'यांत्रिक उपविभाग' : 'Mech. Sub.', val: dam.mechSub  },
  ];

  return (
    <div className="flex flex-col gap-3 animate-fade-up">

      {/* ── Main card ────────────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">

        {/* Header + KPIs + Level bar */}
        <div className="px-5 py-4 border-b border-border-2">

          {/* Dam title row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h2 className={`text-[18px] font-bold text-navy-950 font-serif leading-snug ${mr ? 'dv' : ''}`}>
                {name}
              </h2>
              <div className="text-[13px] text-muted mt-1 leading-tight">
                {[river, dam.district].filter(Boolean).join(' · ')}
              </div>
              {dam.division && (
                <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--color-xs)' }}>
                  {dam.division}
                </div>
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gr-50 text-gr-700 border border-gr-700/20 text-[10.5px] font-semibold shrink-0 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
              {mr ? 'थेट माहिती' : 'Live Data'}
            </span>
          </div>

          {/* 4 KPIs */}
          <div className="grid grid-cols-4 gap-2">
            <KpiCard label="Water Level" labelMr="जलपातळी"  value={dam.waterLevel || '–'}              unit="m"   color="blue"   lang={lang} />
            <KpiCard label="Storage"     labelMr="साठा"      value={dam.storage    ? dam.storage + '%' : '–'}      color="green"  lang={lang} />
            <KpiCard label="Rainfall"    labelMr="पाऊस"      value={dam.rainfall   || '–'}              unit="mm"  color="amber"  lang={lang} />
            <KpiCard label="Gates"       labelMr="दरवाजे"   value={dam.gates      || '–'}                          color="purple" lang={lang} />
          </div>

          {/* Storage level bar */}
          <div className="mt-4">
            <div className="h-2.5 bg-border-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 via-amber-400 to-red-500 transition-[width] duration-700"
                style={{ width: `${storagePct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] mt-1.5" style={{ color: 'var(--color-xs)' }}>
              <span>0%</span>
              <span className="text-muted">FRL: {dam.frl ?? '–'} m</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Division details + Officers — side by side */}
        <div className="grid grid-cols-2 divide-x divide-border-2">

          <div className="px-5 py-4">
            <div className="text-[10px] font-bold uppercase tracking-[.7px] mb-3" style={{ color: 'var(--color-xs)' }}>
              {mr ? 'विभाग तपशील' : 'Division Details'}
            </div>
            <table className="w-full">
              <tbody>
                {details.map(({ k, label, val }) => (
                  <tr key={k} className="border-b border-border-2 last:border-b-0">
                    <td className={`py-1.5 pr-2 text-[12px] text-muted align-top w-[46%] leading-snug ${mr ? 'dv' : ''}`}>
                      {label}
                    </td>
                    <td className="py-1.5 text-[12.5px] font-medium text-tx leading-snug">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4">
            <div className="text-[10px] font-bold uppercase tracking-[.7px] mb-3" style={{ color: 'var(--color-xs)' }}>
              {mr ? 'प्रभारी अधिकारी' : 'Officers in Charge'}
            </div>
            <table className="w-full">
              <tbody>
                {officers.map(({ k, label, val }) => (
                  <tr key={k} className="border-b border-border-2 last:border-b-0">
                    <td className={`py-1.5 pr-2 text-[12px] text-muted align-top w-[46%] leading-snug ${mr ? 'dv' : ''}`}>
                      {label}
                    </td>
                    <td className={`py-1.5 text-[12px] font-medium text-tx leading-snug ${mr ? 'dv' : ''}`}>
                      {val || '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Contacts card ────────────────────────────────────────── */}
      {contacts.length > 0 && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
          <div className="px-5 py-3 border-b border-border-2">
            <span className="text-[10px] font-bold uppercase tracking-[.7px]" style={{ color: 'var(--color-xs)' }}>
              {mr ? 'अधिकारी संपर्क' : 'Officer Contact'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px]">
              <thead>
                <tr className="bg-navy-950">
                  <th className="text-[11px] font-semibold text-white/80 px-5 py-2.5 text-left tracking-[.3px]">
                    {mr ? 'नाव' : 'Name'}
                  </th>
                  <th className="text-[11px] font-semibold text-white/80 px-4 py-2.5 text-left tracking-[.3px]">
                    {mr ? 'पदनाम' : 'Designation'}
                  </th>
                  <th className="text-[11px] font-semibold text-white/80 px-4 py-2.5 text-left tracking-[.3px]">
                    {mr ? 'मोबाइल' : 'Mobile'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c, i) => (
                  <tr key={i} className="border-b border-border-2 last:border-b-0 hover:bg-surface-2 transition-colors">
                    <td className="px-5 py-2.5 text-[13px] dv">{c.name}</td>
                    <td className="px-4 py-2.5 text-[12px] text-muted">{c.desig || '–'}</td>
                    <td className="px-4 py-2.5 text-[13px] font-mono text-tx">{c.mobile || '–'}</td>
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

// ── District / dam tile ───────────────────────────────────────────────────
function Tile({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`text-left border rounded-lg px-3 py-2.5 w-full cursor-pointer transition-all font-sans ${
        active
          ? 'border-navy-800 bg-bl-50 shadow-xs'
          : 'border-border bg-surface-2 hover:border-navy-600 hover:bg-surface hover:shadow-xs'
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
        <div key={i} className="h-11 bg-border-2 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

// ── Empty panel ───────────────────────────────────────────────────────────
function EmptyPanel({ noData, lang }) {
  const mr = lang === 'mr';
  return (
    <div className="bg-surface border border-border rounded-xl py-14 px-8 text-center shadow-xs">
      <div className="text-[40px] mb-3">🏛️</div>
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
          <div className="opacity-70">Login → Admin → Dams tab → + Add Dam</div>
        </div>
      )}
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────
function SectionHead({ en, mr, lang, sub }) {
  const isMr = lang === 'mr';
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[10px] font-bold uppercase tracking-[.7px]" style={{ color: 'var(--color-xs)' }}>
        {isMr ? mr : en}
      </span>
      <span className={`text-[9px] opacity-50 ${isMr ? '' : 'dv'}`}>
        {isMr ? (sub?.en ?? en) : (sub?.mr ?? mr)}
      </span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function Pub() {
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
      {/* Page header */}
      <div className="bg-surface border-b border-border px-5 py-3.5">
        <h3 className="text-[17px] font-bold text-navy-950 font-serif">
          {isMr ? 'धरण माहिती' : 'Dam Information'}
        </h3>
        <div className={`text-[12px] text-muted mt-1 ${isMr ? '' : 'dv'}`}>
          {isMr
            ? 'Dam Information — सार्वजनिक विभाग · Public Section'
            : 'धरण माहिती — सार्वजनिक विभाग · Public Section'}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="p-4 grid grid-cols-2 gap-3 items-start">

        {/* ── Left: selectors ─────────────────────────────────────── */}
        <div className="flex flex-col gap-3">

          {/* District card */}
          <div className="bg-surface border border-border rounded-xl p-4 shadow-xs">
            <SectionHead
              en="Select District" mr="जिल्हा निवडा"
              sub={{ en: '— District', mr: '— District' }}
              lang={lang}
            />
            {isLoading && <Skeleton rows={4} cols={2} />}
            {!isLoading && districts.length === 0 && (
              <p className="text-[13px] text-muted">
                {isMr ? 'अद्याप कोणताही जिल्हा उपलब्ध नाही.' : 'No districts available yet.'}
                <span className="block text-[11px] mt-1" style={{ color: 'var(--color-xs)' }}>
                  Login → Admin → Dams → + Add Dam
                </span>
              </p>
            )}
            {!isLoading && districts.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5">
                {districts.map(dk => (
                  <Tile key={dk} active={selDist === dk} onClick={() => onDistClick(dk)}>
                    <span className="block text-[13px] font-bold text-navy-950">{dk}</span>
                    <span className="block text-[10.5px] text-muted mt-0.5">
                      {districtMap[dk].length}
                      {isMr ? ' धरण' : ` dam${districtMap[dk].length > 1 ? 's' : ''}`}
                    </span>
                  </Tile>
                ))}
              </div>
            )}
          </div>

          {/* Dam card */}
          <div className="bg-surface border border-border rounded-xl p-4 shadow-xs">
            <SectionHead
              en="Select Dam" mr="धरण निवडा"
              sub={{ en: '— Dam', mr: '— Dam' }}
              lang={lang}
            />
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
                {distDams.map(dam => (
                  <Tile key={dam.id} active={selDam?.id === dam.id} onClick={() => onDamClick(dam)}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className={`block text-[13px] font-bold text-navy-950 leading-snug truncate ${isMr ? 'dv' : ''}`}>
                          {isMr ? dam.nameMr : dam.nameEn}
                        </span>
                        <span className={`block text-[11px] text-muted mt-0.5 truncate ${isMr ? '' : 'dv'}`}>
                          {isMr ? (dam.riverMr || dam.riverEn) : dam.riverEn}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[9.5px] text-gr-700 font-semibold shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
                        Live
                      </span>
                    </div>
                  </Tile>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: dam info panel ────────────────────────────────── */}
        <div>
          {selDam
            ? <DamInfoPanel dam={selDam} lang={lang} />
            : <EmptyPanel noData={dams.length === 0 && !isLoading} lang={lang} />
          }
        </div>
      </div>
    </div>
  );
}
