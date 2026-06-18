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

function isToday(iso) {
  if (!iso) return false;
  const d = new Date(iso), n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

function CmdRow({ c, officerName, mr, action }) {
  return (
    <div className="bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-[11.5px] font-bold text-navy-950 font-mono">{cmdRef(c.id)}</div>
        <div className="text-[12.5px] text-tx mt-0.5">{c.gate || '–'} · {c.type} {c.value || ''}</div>
        <div className="text-[11px] text-muted mt-0.5">
          {mr ? 'जारी:' : 'By:'} {officerName(c.issued_by)} · {new Date(c.issued_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </div>
        {c.details && <div className="text-[11px] text-muted italic mt-0.5">📝 {c.details}</div>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {action}
        <StatusBadge status={c.status} />
      </div>
    </div>
  );
}

export default function Execution() {
  const { id: officerId, nameEn, role } = useAuthStore();
  const { lang } = useUIStore();
  const mr = lang === 'mr';
  const qc = useQueryClient();
  const canAccept = !!PERMS[role]?.accept;
  const canExec   = !!PERMS[role]?.exec;
  const [busyId, setBusyId] = useState(null);

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

  const pending  = commands.filter(c => c.status === 'pending');
  const accepted = commands.filter(c => c.status === 'accepted');
  const executedToday = commands.filter(c => c.status === 'executed' && isToday(c.executed_at));

  async function accept(id) {
    setBusyId(id);
    const res = await api.acceptCommand({ cmdId: id, officerId });
    setBusyId(null);
    if (!res.success) { toast.error(res.error || 'Failed to accept'); return; }
    toast.success(`${cmdRef(id)} accepted`);
    qc.invalidateQueries({ queryKey: ['commands'] });
  }

  async function execute(id) {
    if (!confirm(mr ? 'ही आदेश अंमलात आणायची आहे का?' : 'Confirm execution of this command?')) return;
    setBusyId(id);
    const res = await api.executeCommand({ cmdId: id, officerId });
    setBusyId(null);
    if (!res.success) { toast.error(res.error || 'Failed to execute'); return; }
    toast.success(`${cmdRef(id)} executed`);
    qc.invalidateQueries({ queryKey: ['commands'] });
  }

  return (
    <div>
      <div className="bg-surface border-b border-border px-5 py-3.5 flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-bold text-navy-950 font-serif leading-none">
            {mr ? 'गेट अंमलबजावणी' : 'Gate Execution'}
          </h3>
          <div className="text-[11px] text-muted mt-1">
            {mr ? 'आदेश स्वीकारा आणि अंमलात आणा' : 'Accept commands and confirm field execution'}
          </div>
        </div>
        {nameEn && <div className="text-[12px] text-muted">{nameEn}</div>}
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* ── 1. Awaiting Acceptance ──────────────────────────────────── */}
        <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border-2 flex items-center gap-2">
            <div className="w-[3px] h-3.5 rounded-full bg-gold-600 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-[.8px]" style={{ color: 'var(--color-xs)' }}>
              {mr ? '१. स्वीकृतीची प्रतीक्षा' : '1. Awaiting Acceptance'}
            </span>
            <span className="text-[10.5px] font-semibold text-muted bg-surface-2 border border-border px-2 py-0.5 rounded-full">{pending.length}</span>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {!canAccept && pending.length > 0 && (
              <div className="flex items-center gap-2 bg-[#EBF0FF] border border-[#BFDBFE] rounded-lg px-3.5 py-2 text-[12px] text-[#1E3FA8] mb-1">
                ℹ️ {mr ? 'फक्त उपविभाग अधिकारी स्वीकारू शकतात.' : 'Only Sub-Division Officers can accept commands.'}
              </div>
            )}
            {isLoading ? (
              <p className="text-[13px] text-muted">Loading…</p>
            ) : pending.length === 0 ? (
              <p className="text-[13px] text-muted">{mr ? 'प्रलंबित आदेश नाहीत.' : 'No commands awaiting acceptance.'}</p>
            ) : pending.map(c => (
              <CmdRow key={c.id} c={c} officerName={officerName} mr={mr} action={
                canAccept && (
                  <Button variant="success" size="xs" loading={busyId === c.id} onClick={() => accept(c.id)}>
                    ✓ {mr ? 'स्वीकार' : 'Accept'}
                  </Button>
                )
              } />
            ))}
          </div>
        </div>

        {/* ── 2. Ready to Execute ─────────────────────────────────────── */}
        <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border-2 flex items-center gap-2">
            <div className="w-[3px] h-3.5 rounded-full bg-gold-600 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-[.8px]" style={{ color: 'var(--color-xs)' }}>
              {mr ? '२. अंमलबजावणीसाठी तयार' : '2. Ready to Execute'}
            </span>
            <span className="text-[10.5px] font-semibold text-muted bg-surface-2 border border-border px-2 py-0.5 rounded-full">{accepted.length}</span>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {!canExec && accepted.length > 0 && (
              <div className="flex items-center gap-2 bg-[#EBF0FF] border border-[#BFDBFE] rounded-lg px-3.5 py-2 text-[12px] text-[#1E3FA8] mb-1">
                ℹ️ {mr ? 'फक्त क्षेत्रीय अधिकारी अंमलबजावणी करू शकतात.' : 'Only Field Officers can execute commands.'}
              </div>
            )}
            {isLoading ? (
              <p className="text-[13px] text-muted">Loading…</p>
            ) : accepted.length === 0 ? (
              <p className="text-[13px] text-muted">{mr ? 'अंमलबजावणीसाठी कोणताही आदेश नाही.' : 'No commands ready for execution.'}</p>
            ) : accepted.map(c => (
              <CmdRow key={c.id} c={c} officerName={officerName} mr={mr} action={
                canExec && (
                  <Button variant="primary" size="xs" loading={busyId === c.id} onClick={() => execute(c.id)}>
                    ⚙️ {mr ? 'अंमल' : 'Execute'}
                  </Button>
                )
              } />
            ))}
          </div>
        </div>

        {/* ── 3. Execution Log — Today ────────────────────────────────── */}
        <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden lg:col-span-2">
          <div className="px-5 py-3.5 border-b border-border-2 flex items-center gap-2">
            <div className="w-[3px] h-3.5 rounded-full bg-gold-600 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-[.8px]" style={{ color: 'var(--color-xs)' }}>
              {mr ? '३. अंमलबजावणी नोंद — आज' : '3. Execution Log — Today'}
            </span>
            <span className="text-[10.5px] font-semibold text-muted bg-surface-2 border border-border px-2 py-0.5 rounded-full">{executedToday.length}</span>
          </div>
          {executedToday.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-muted">{mr ? 'आज कोणतीही अंमलबजावणी नाही' : 'No executions yet today'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: '480px' }}>
                <thead>
                  <tr className="bg-navy-950">
                    {['ID', 'Gate', 'Op', 'Executed By', 'Time'].map(h => (
                      <th key={h} className="text-[10.5px] font-semibold text-white/70 px-3 py-2.5 text-left tracking-[.3px] uppercase first:pl-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {executedToday.map((c, i) => (
                    <tr key={c.id} className={`border-b border-border-2 last:border-0 ${i % 2 === 1 ? 'bg-surface-2/40' : ''}`}>
                      <td className="pl-5 pr-3 py-2.5 text-[11px] font-mono font-semibold text-navy-950">{cmdRef(c.id)}</td>
                      <td className="px-3 py-2.5 text-[12px]">{c.gate || '–'}</td>
                      <td className="px-3 py-2.5 text-[12px]">{c.type} {c.value || ''}</td>
                      <td className="px-3 py-2.5 text-[12px]">{officerName(c.executed_by)}</td>
                      <td className="px-3 py-2.5 text-[11.5px] font-mono text-muted">{new Date(c.executed_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
