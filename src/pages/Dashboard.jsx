import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';
import { useUIStore } from '../store/uiStore.js';
import { ROLE_LABELS, DEPT_LABELS } from '../lib/constants.js';
import Button from '../components/ui/Button.jsx';

const FC = 'w-full border-[1.5px] border-border rounded-lg px-3 py-2.5 text-[13px] font-sans text-tx bg-surface outline-none focus:border-navy-800 focus:shadow-[0_0_0_3px_rgba(29,49,96,.08)] transition-all';
const numFC = FC + ' [appearance:textfield]';

function storageColor(pct) {
  const p = parseFloat(pct) || 0;
  return p >= 70 ? '#16A34A' : p >= 35 ? '#D97706' : '#DC2626';
}

function StorageBar({ pct }) {
  const p = Math.min(100, Math.max(0, parseFloat(pct) || 0));
  const color = storageColor(p);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden" style={{ minWidth: '60px' }}>
        <div className="h-full rounded-full transition-all" style={{ width: p + '%', background: color }} />
      </div>
      <span className="text-[12px] font-mono font-semibold w-9 text-right shrink-0" style={{ color }}>{p}%</span>
    </div>
  );
}

function Field({ label, sub, children }) {
  return (
    <div className="mb-3">
      <label className="block text-[12px] font-semibold text-navy-950 mb-1.5 tracking-[.1px]">
        {label}
        {sub && <span className="text-[11px] text-muted font-normal ml-1.5">{sub}</span>}
      </label>
      {children}
    </div>
  );
}

// ── Update Live Data Modal ─────────────────────────────────────────────────
function UpdateModal({ dam, onClose, onSaved }) {
  const [form, setForm] = useState({
    waterLevel:  String(dam.waterLevel  ?? ''),
    storage:     String(dam.storage     ?? ''),
    rainfall:    String(dam.rainfall    ?? ''),
    avgRainfall: String(dam.avgRainfall ?? ''),
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    setErr('');
    if (!form.waterLevel) { setErr('Water Level is required'); return; }
    setBusy(true);
    const res = await api.updateLiveData({
      id:          dam.id,
      waterLevel:  form.waterLevel,
      storage:     form.storage,
      rainfall:    form.rainfall,
      avgRainfall: form.avgRainfall,
    });
    setBusy(false);
    if (!res.success) { setErr(res.error || 'Update failed. Please try again.'); return; }
    toast.success(`${dam.nameEn} — live data updated`);
    onSaved();
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center px-4"
      style={{ background: 'rgba(11,26,53,.55)', backdropFilter: 'blur(3px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface rounded-2xl w-full max-w-[420px] shadow-[0_16px_48px_rgba(0,0,0,.28)] overflow-hidden animate-fade-up">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-navy-950 border-b-[3px] border-gold-600">
          <div>
            <h3 className="text-[15px] font-bold text-white font-serif leading-tight">Update Live Data</h3>
            <p className="text-[11px] text-white/55 mt-0.5">{dam.nameEn} · {dam.district}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 border border-white/25 text-white text-[20px] leading-none flex items-center justify-center cursor-pointer hover:bg-white/28 transition-colors font-sans">
            ×
          </button>
        </div>

        {/* FRL reference */}
        {(dam.frl || dam.mwl) && (
          <div className="mx-5 mt-4 bg-surface-2 border border-border-2 rounded-lg px-3.5 py-2.5 flex items-center gap-4 text-[12px]">
            {dam.frl  && <span className="text-muted">FRL <strong className="text-navy-950 font-mono">{dam.frl} m</strong></span>}
            {dam.mwl  && <span className="text-muted">MWL <strong className="text-navy-950 font-mono">{dam.mwl} m</strong></span>}
            {dam.sillLevel && <span className="text-muted">Sill <strong className="text-navy-950 font-mono">{dam.sillLevel} m</strong></span>}
          </div>
        )}

        <div className="px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Water Level (m)" sub="required">
              <input className={numFC} type="number" step="0.01"
                value={form.waterLevel} onChange={e => set('waterLevel', e.target.value)}
                placeholder={dam.frl ? String(dam.frl) : '0.00'} />
            </Field>
            <Field label="Storage (%)" sub="0 – 100">
              <input className={numFC} type="number" step="0.1" min="0" max="100"
                value={form.storage} onChange={e => set('storage', e.target.value)}
                placeholder="e.g. 68" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Today's Rainfall (mm)">
              <input className={numFC} type="number" step="0.1" min="0"
                value={form.rainfall} onChange={e => set('rainfall', e.target.value)}
                placeholder="e.g. 14" />
            </Field>
            <Field label="Avg Rainfall (mm)">
              <input className={numFC} type="number" step="0.1" min="0"
                value={form.avgRainfall} onChange={e => set('avgRainfall', e.target.value)}
                placeholder="e.g. 920" />
            </Field>
          </div>

          {err && (
            <div className="flex items-center gap-2 bg-[#FFF1F2] border border-[#FCA5A5] rounded-lg px-4 py-2.5 text-[12.5px] text-[#B91C1C] mt-1">
              ⚠️ {err}
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 bg-surface-2 border-t border-border flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" loading={busy} onClick={save}>
            💧 Save Update
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, unit, sub, gradient }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 shadow-xs relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl" style={{ background: gradient }} />
      <div className="text-[20px] mb-2">{icon}</div>
      <div className="text-[10px] font-bold uppercase tracking-[.7px] text-muted mb-1">{label}</div>
      <div className="text-[28px] font-bold text-navy-950 font-mono leading-none">
        {value ?? '–'}
        {unit && <span className="text-[12px] text-muted font-sans font-medium ml-1">{unit}</span>}
      </div>
      {sub && <div className="text-[11px] text-muted mt-1">{sub}</div>}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────
export default function Dashboard() {
  const { nameEn, role, dept, district } = useAuthStore();
  const { lang } = useUIStore();
  const mr = lang === 'mr';
  const qc = useQueryClient();
  const [updateDam, setUpdateDam] = useState(null);
  const [search, setSearch] = useState('');

  const { data: dams = [], isLoading } = useQuery({
    queryKey: ['dams'],
    queryFn: () => api.getDams(),
    select: r => r.dams ?? [],
  });

  function onSaved() {
    setUpdateDam(null);
    qc.invalidateQueries({ queryKey: ['dams'] });
  }

  const activeDams = dams.filter(d => d.status === 'active');
  const avgStorage = activeDams.length
    ? Math.round(activeDams.reduce((s, d) => s + (parseFloat(d.storage) || 0), 0) / activeDams.length)
    : 0;
  const criticalCount = activeDams.filter(d => (parseFloat(d.storage) || 0) < 30).length;

  const filtered = search
    ? dams.filter(d =>
        d.nameEn.toLowerCase().includes(search.toLowerCase()) ||
        (d.district ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (d.riverEn  ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : dams;

  const roleLabel = ROLE_LABELS[role]?.en  || role  || '';
  const deptLabel = DEPT_LABELS[dept]?.en  || dept  || '';

  return (
    <div>
      {/* Page header */}
      <div className="bg-surface border-b border-border px-5 py-3.5 flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-bold text-navy-950 font-serif leading-none">
            {mr ? 'क्षेत्र माहिती' : 'Field Dashboard'}
          </h3>
          <div className="text-[11px] text-muted mt-1">
            {mr ? 'धरण जलपातळी, साठा व पाऊस अपडेट करा' : 'Update water level, storage and rainfall for each dam'}
          </div>
        </div>
        {nameEn && (
          <div className="text-right">
            <div className="text-[13px] font-semibold text-navy-950">{nameEn}</div>
            <div className="text-[11px] text-muted">
              {[roleLabel, deptLabel, district].filter(Boolean).join(' · ')}
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatCard
            icon="🏛️" label="Active Dams"
            value={activeDams.length} unit="dams"
            gradient="linear-gradient(90deg,#1E3FA8,#6A8FE8)"
          />
          <StatCard
            icon="💧" label="Avg Storage"
            value={avgStorage} unit="%"
            sub={`across ${activeDams.length} active dams`}
            gradient="linear-gradient(90deg,#0F5132,#22C55E)"
          />
          <StatCard
            icon="⚠️" label="Critical (<30%)"
            value={criticalCount} unit="dams"
            sub={criticalCount > 0 ? 'Need attention' : 'All dams OK'}
            gradient="linear-gradient(90deg,#7A4800,#F59E0B)"
          />
        </div>

        {/* Dam table */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-border-2 flex items-center gap-3">
            <div className="w-[3px] h-3.5 rounded-full bg-gold-600 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-[.8px]" style={{ color: 'var(--color-xs)' }}>
              {mr ? 'धरण यादी' : 'Dam List'}
            </span>
            {!isLoading && (
              <span className="text-[10.5px] font-semibold text-muted bg-surface-2 border border-border px-2 py-0.5 rounded-full">
                {filtered.length}
              </span>
            )}
            <div className="ml-auto">
              <input
                className="border border-border rounded-lg px-3 py-1.5 text-[12px] font-sans text-tx bg-surface-2 outline-none focus:border-navy-800 transition-all w-52"
                placeholder="Search dam, district or river…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="py-10 text-center text-[13px] text-muted">Loading dams…</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-[13px] text-muted">No dams found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: '720px' }}>
                <thead>
                  <tr className="bg-navy-950">
                    {['Dam / District', 'Water Level', 'Storage', 'Rainfall (today)', 'Avg Rainfall', ''].map(h => (
                      <th key={h} className="text-[10.5px] font-semibold text-white/70 px-4 py-3 text-left tracking-[.3px] uppercase first:pl-5">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d, i) => {
                    const pct = parseFloat(d.storage) || 0;
                    const isCritical = pct < 30 && d.status === 'active';
                    return (
                      <tr key={d.id}
                        className={`border-b border-border-2 last:border-0 hover:bg-surface-2 transition-colors
                          ${isCritical ? 'bg-[#FFF7ED]' : i % 2 === 1 ? 'bg-surface-2/40' : ''}`}>
                        <td className="pl-5 pr-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-navy-950">{d.nameEn}</span>
                            {isCritical && (
                              <span className="text-[9.5px] font-bold uppercase tracking-[.5px] bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] px-1.5 py-0.5 rounded-full">
                                Low
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted mt-0.5">
                            {d.district}{d.riverEn ? ` · ${d.riverEn}` : ''}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {d.waterLevel != null ? (
                            <div>
                              <span className="text-[13px] font-mono font-semibold text-navy-950">{d.waterLevel} m</span>
                              {d.frl && (
                                <div className="text-[10.5px] text-muted mt-0.5">FRL {d.frl} m</div>
                              )}
                            </div>
                          ) : <span className="text-muted text-[12px]">–</span>}
                        </td>
                        <td className="px-4 py-3 min-w-[140px]">
                          {d.storage != null
                            ? <StorageBar pct={d.storage} />
                            : <span className="text-muted text-[12px]">–</span>}
                        </td>
                        <td className="px-4 py-3 text-[12.5px] font-mono text-navy-950">
                          {d.rainfall != null ? `${d.rainfall} mm` : '–'}
                        </td>
                        <td className="px-4 py-3 text-[12.5px] font-mono text-muted">
                          {d.avgRainfall != null ? `${d.avgRainfall} mm` : '–'}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setUpdateDam(d)}
                            className="text-[11.5px] font-semibold text-navy-800 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-3 py-1.5 hover:bg-navy-950 hover:text-white hover:border-navy-950 transition-all cursor-pointer font-sans whitespace-nowrap">
                            💧 Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {updateDam && (
        <UpdateModal dam={updateDam} onClose={() => setUpdateDam(null)} onSaved={onSaved} />
      )}
    </div>
  );
}
