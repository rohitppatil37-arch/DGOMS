import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../api/index.js';
import { supabase } from '../lib/supabase.js';
import { useAuthStore } from '../store/authStore.js';
import { useUIStore } from '../store/uiStore.js';
import { PERMS } from '../lib/constants.js';
import { cmdRef } from '../lib/format.js';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';

const FC = 'w-full border-[1.5px] border-border rounded-lg px-3 py-2.5 text-[13px] font-sans text-tx bg-surface outline-none focus:border-navy-800 focus:shadow-[0_0_0_3px_rgba(29,49,96,.08)] transition-all';

const OPERATIONS = [
  { value: 'lift',      en: 'Lift',      mr: 'उघडणे' },
  { value: 'lower',     en: 'Lower',     mr: 'खाली करणे' },
  { value: 'close',     en: 'Close',     mr: 'बंद करणे' },
  { value: 'emergency', en: 'Emergency', mr: 'आणीबाणी' },
];

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

export default function Commands() {
  const { id: officerId, nameEn, role } = useAuthStore();
  const { lang, currentDam, setCurrentDam } = useUIStore();
  const mr = lang === 'mr';
  const qc = useQueryClient();
  const canIssue = !!PERMS[role]?.cmd;

  const { data: dams = [] } = useQuery({
    queryKey: ['dams'],
    queryFn:  () => api.getDams(),
    select:   r => (r.dams ?? []).filter(d => d.status === 'active'),
  });

  const { data: officers = [] } = useQuery({
    queryKey: ['officers'],
    queryFn:  () => api.getOfficers(),
    select:   r => r.officers ?? [],
  });

  const { data: commands = [], isLoading } = useQuery({
    queryKey: ['commands'],
    queryFn:  () => api.getCommands(),
    select:   r => r.commands ?? [],
  });

  // Realtime: refresh the register instantly when any command changes
  useEffect(() => {
    const channel = supabase
      .channel('public:commands')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commands' }, () => {
        qc.invalidateQueries({ queryKey: ['commands'] });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [qc]);

  const officerName = (id) => {
    const o = officers.find(o => o.id === id);
    if (!o) return '–';
    return mr ? o.nameMr : o.nameEn;
  };

  const dam = dams.find(d => d.id === currentDam) || null;
  const gateCount = dam ? (parseInt(dam.gates) || 0) : 0;

  const [gate, setGate]         = useState('');
  const [operation, setOp]      = useState('lift');
  const [value, setValue]       = useState('');
  const [justification, setJus] = useState('');
  const [busy, setBusy]         = useState(false);
  const [busyEmg, setBusyEmg]   = useState(false);

  useEffect(() => { setGate(''); }, [currentDam]);

  async function issue() {
    if (!currentDam)  { toast.error('Select a dam first'); return; }
    if (!gate)        { toast.error('Select a gate'); return; }
    if (!value.trim()){ toast.error('Enter a value'); return; }
    setBusy(true);
    const res = await api.issueCommand({
      damId: currentDam, gate, type: operation, value: value.trim(),
      details: justification.trim() || null, issuedBy: officerId,
    });
    setBusy(false);
    if (!res.success) { toast.error(res.error || 'Failed to issue command'); return; }
    toast.success(`${cmdRef(res.cmdId)} issued`);
    setValue(''); setJus('');
    qc.invalidateQueries({ queryKey: ['commands'] });
  }

  async function emergency() {
    if (!currentDam) { toast.error('Select a dam first'); return; }
    if (!confirm(mr
      ? 'आणीबाणी सूचना सर्व नोंदणीकृत अधिकाऱ्यांना पाठवायची आहे का?'
      : 'Send an EMERGENCY alert to all registered officers?')) return;
    setBusyEmg(true);
    const res = await api.sendAlert({
      damId: currentDam, issuedBy: officerId, type: 'emergency',
      message: justification.trim() || `Emergency — ${dam?.nameEn || 'dam'} requires immediate action`,
    });
    setBusyEmg(false);
    if (!res.success) { toast.error(res.error || 'Failed to send alert'); return; }
    toast.success('Emergency alert sent');
  }

  const pending = commands.filter(c => c.status === 'pending');

  return (
    <div>
      <div className="bg-surface border-b border-border px-5 py-3.5">
        <h3 className="text-[16px] font-bold text-navy-950 font-serif leading-none">
          {mr ? 'गेट संचालन आदेश' : 'Gate Operation Command'}
        </h3>
        <div className="text-[11px] text-muted mt-1">
          {mr ? 'गेट उघडणे / बंद करण्याचा आदेश जारी करा' : 'Issue and track gate operation commands'}
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* ── Issue Command ───────────────────────────────────────────── */}
        <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border-2 flex items-center gap-2">
            <div className="w-[3px] h-3.5 rounded-full bg-gold-600 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-[.8px]" style={{ color: 'var(--color-xs)' }}>
              {mr ? 'आदेश जारी करा' : 'Issue Command'}
            </span>
          </div>
          <div className="p-5">
            {!canIssue && (
              <div className="flex items-center gap-2 bg-[#FEF3C7] border border-[#FDE68A] rounded-lg px-3.5 py-2.5 text-[12.5px] text-[#7A4800] mb-3.5">
                ⚠️ {mr ? 'तुमच्या भूमिकेला आदेश जारी करण्याचा अधिकार नाही.' : 'Your role cannot issue commands. Contact a Division Officer.'}
              </div>
            )}

            <Field label={mr ? 'धरण' : 'Dam'} sub="required">
              <select className={FC} value={currentDam || ''} onChange={e => setCurrentDam(e.target.value || null)}>
                <option value="">{mr ? '— धरण निवडा —' : '— Select dam —'}</option>
                {dams.map(d => <option key={d.id} value={d.id}>{d.nameEn} · {d.district}</option>)}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={mr ? 'गेट क्र.' : 'Gate No.'} sub="required">
                <select className={FC} value={gate} onChange={e => setGate(e.target.value)} disabled={!dam}>
                  <option value="">{mr ? '— निवडा —' : '— Select —'}</option>
                  {Array.from({ length: gateCount }, (_, i) => i + 1).map(n => (
                    <option key={n} value={`Gate ${String(n).padStart(2, '0')}`}>Gate {String(n).padStart(2, '0')}</option>
                  ))}
                </select>
              </Field>
              <Field label={mr ? 'कार्य' : 'Operation'}>
                <select className={FC} value={operation} onChange={e => setOp(e.target.value)}>
                  {OPERATIONS.map(o => <option key={o.value} value={o.value}>{mr ? o.mr : o.en}</option>)}
                </select>
              </Field>
            </div>

            <Field label={mr ? 'मूल्य (फूट)' : 'Value (ft)'} sub="required">
              <input className={FC} value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. 2.5" />
            </Field>

            <Field label={mr ? 'कारण' : 'Justification'}>
              <textarea className={FC} rows={2} value={justification} onChange={e => setJus(e.target.value)}
                placeholder={mr ? 'उदा. पूर विसर्ग — FRL जवळ' : 'e.g. Flood discharge — FRL approaching'} />
            </Field>

            <div className="flex gap-2 flex-wrap mt-1">
              <Button variant="primary" disabled={!canIssue} loading={busy} onClick={issue}>
                {mr ? 'आदेश जारी करा' : 'Issue Command'}
              </Button>
              <Button variant="danger" disabled={!canIssue} loading={busyEmg} onClick={emergency}>
                🚨 {mr ? 'आणीबाणी' : 'Emergency'}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Pending + Register ──────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border-2 flex items-center gap-2">
              <div className="w-[3px] h-3.5 rounded-full bg-gold-600 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-[.8px]" style={{ color: 'var(--color-xs)' }}>
                {mr ? 'प्रलंबित आदेश' : 'Pending Commands'}
              </span>
              <span className="text-[10.5px] font-semibold text-muted bg-surface-2 border border-border px-2 py-0.5 rounded-full">
                {pending.length}
              </span>
            </div>
            <div className="p-4">
              {pending.length === 0 ? (
                <p className="text-[13px] text-muted">{mr ? 'प्रलंबित आदेश नाहीत.' : 'No pending commands.'}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {pending.map(c => (
                    <div key={c.id} className="bg-[#FEF3C7] border border-[#FDE68A] rounded-lg px-3.5 py-2.5 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[11.5px] font-bold text-[#7A4800] font-mono">{cmdRef(c.id)}</div>
                        <div className="text-[12.5px] text-tx mt-0.5">{c.gate || '–'} · {c.type} {c.value || ''}</div>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border-2 flex items-center gap-2">
              <div className="w-[3px] h-3.5 rounded-full bg-gold-600 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-[.8px]" style={{ color: 'var(--color-xs)' }}>
                {mr ? 'आदेश नोंदवही' : 'Command Register'}
              </span>
            </div>
            {isLoading ? (
              <div className="py-8 text-center text-[13px] text-muted">Loading…</div>
            ) : commands.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-muted">{mr ? 'अद्याप कोणताही आदेश नाही' : 'No commands yet'}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" style={{ minWidth: '480px' }}>
                  <thead>
                    <tr className="bg-navy-950">
                      {['ID', 'Gate', 'Op', 'Issued By', 'Time', 'Status'].map(h => (
                        <th key={h} className="text-[10.5px] font-semibold text-white/70 px-3 py-2.5 text-left tracking-[.3px] uppercase first:pl-5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {commands.map((c, i) => (
                      <tr key={c.id} className={`border-b border-border-2 last:border-0 ${i % 2 === 1 ? 'bg-surface-2/40' : ''}`}>
                        <td className="pl-5 pr-3 py-2.5 text-[11px] font-mono font-semibold text-navy-950">{cmdRef(c.id)}</td>
                        <td className="px-3 py-2.5 text-[12px]">{c.gate || '–'}</td>
                        <td className="px-3 py-2.5 text-[12px]">{c.type} {c.value || ''}</td>
                        <td className="px-3 py-2.5 text-[12px]">{officerName(c.issued_by)}</td>
                        <td className="px-3 py-2.5 text-[11.5px] font-mono text-muted">{new Date(c.issued_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-3 py-2.5"><StatusBadge status={c.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
