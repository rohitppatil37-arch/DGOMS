import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/index.js';
import { supabase } from '../lib/supabase.js';
import { useUIStore } from '../store/uiStore.js';
import { cmdRef } from '../lib/format.js';
import StatusBadge from '../components/ui/StatusBadge.jsx';

const FC = 'border-[1.5px] border-border rounded-lg px-3 py-2 text-[12.5px] font-sans text-tx bg-surface outline-none focus:border-navy-800 focus:shadow-[0_0_0_3px_rgba(29,49,96,.08)] transition-all';

function isoDate(d) { return d.toISOString().slice(0, 10); }
function todayIso() { return isoDate(new Date()); }
function daysAgoIso(n) { const d = new Date(); d.setDate(d.getDate() - n); return isoDate(d); }

export default function Logbook() {
  const { lang } = useUIStore();
  const mr = lang === 'mr';
  const qc = useQueryClient();
  const [view, setView] = useState('cmd'); // 'cmd' | 'gate'
  const [from, setFrom] = useState(daysAgoIso(30));
  const [to, setTo]     = useState(todayIso());
  const [damFilter, setDamFilter] = useState('');

  const { data: dams = [] } = useQuery({
    queryKey: ['dams'],
    queryFn:  () => api.getDams(),
    select:   r => r.dams ?? [],
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
    return o ? (mr ? o.nameMr : o.nameEn) : '–';
  };
  const damName = (id) => {
    const d = dams.find(d => d.id === id);
    return d ? d.nameEn : '–';
  };

  const filtered = useMemo(() => {
    const fromT = new Date(from + 'T00:00:00').getTime();
    const toT   = new Date(to   + 'T23:59:59').getTime();
    return commands.filter(c => {
      const t = new Date(c.issued_at).getTime();
      if (t < fromT || t > toT) return false;
      if (damFilter && c.dam_id !== damFilter) return false;
      return true;
    }).sort((a, b) => new Date(b.issued_at) - new Date(a.issued_at));
  }, [commands, from, to, damFilter]);

  const gateLog = useMemo(() => filtered.filter(c => c.status === 'executed'), [filtered]);

  return (
    <div>
      <div className="bg-surface border-b border-border px-5 py-3.5">
        <h3 className="text-[16px] font-bold text-navy-950 font-serif leading-none">
          {mr ? 'नोंदवह्या' : 'Logbooks'}
        </h3>
        <div className="text-[11px] text-muted mt-1">
          {mr ? 'नोंदवह्या व शासकीय रजिस्टर' : 'Operation logs and audit trail'}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <button onClick={() => setView('cmd')}
            className={`text-[12.5px] font-semibold rounded-lg px-3.5 py-2 cursor-pointer transition-all font-sans border
              ${view === 'cmd' ? 'bg-navy-950 text-white border-navy-950' : 'bg-surface border-border text-tx hover:border-navy-800'}`}>
            📋 {mr ? 'आदेश' : 'Commands'}
          </button>
          <button onClick={() => setView('gate')}
            className={`text-[12.5px] font-semibold rounded-lg px-3.5 py-2 cursor-pointer transition-all font-sans border
              ${view === 'gate' ? 'bg-navy-950 text-white border-navy-950' : 'bg-surface border-border text-tx hover:border-navy-800'}`}>
            🚧 {mr ? 'दरवाजा नोंद' : 'Gate Log'}
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <input className={FC} type="date" value={from} onChange={e => setFrom(e.target.value)} />
          <span className="text-[12px] text-muted">{mr ? 'ते' : 'to'}</span>
          <input className={FC} type="date" value={to} onChange={e => setTo(e.target.value)} />
          <select className={FC} value={damFilter} onChange={e => setDamFilter(e.target.value)}>
            <option value="">{mr ? 'सर्व धरणे' : 'All Dams'}</option>
            {dams.map(d => <option key={d.id} value={d.id}>{d.nameEn}</option>)}
          </select>
        </div>

        <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-10 text-center text-[13px] text-muted">Loading…</div>
          ) : view === 'cmd' ? (
            filtered.length === 0 ? (
              <div className="py-10 text-center text-[13px] text-muted">{mr ? 'या कालावधीत आदेश नाहीत' : 'No commands in this range'}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" style={{ minWidth: '780px' }}>
                  <thead>
                    <tr className="bg-navy-950">
                      {['ID', 'Date/Time', 'Dam', 'Gate', 'Operation', 'Issued By', 'Accepted By', 'Status'].map(h => (
                        <th key={h} className="text-[10.5px] font-semibold text-white/70 px-3 py-2.5 text-left tracking-[.3px] uppercase first:pl-5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c, i) => (
                      <tr key={c.id} className={`border-b border-border-2 last:border-0 hover:bg-surface-2 transition-colors ${i % 2 === 1 ? 'bg-surface-2/40' : ''}`}>
                        <td className="pl-5 pr-3 py-2.5 text-[11px] font-mono font-semibold text-navy-950">{cmdRef(c.id)}</td>
                        <td className="px-3 py-2.5 text-[11.5px] font-mono text-muted">{new Date(c.issued_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-3 py-2.5 text-[12px]">{damName(c.dam_id)}</td>
                        <td className="px-3 py-2.5 text-[12px]">{c.gate || '–'}</td>
                        <td className="px-3 py-2.5 text-[12px]">{c.type} {c.value || ''}</td>
                        <td className="px-3 py-2.5 text-[12px]">{officerName(c.issued_by)}</td>
                        <td className="px-3 py-2.5 text-[12px]">{c.accepted_by ? officerName(c.accepted_by) : '–'}</td>
                        <td className="px-3 py-2.5"><StatusBadge status={c.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            gateLog.length === 0 ? (
              <div className="py-10 text-center text-[13px] text-muted">{mr ? 'या कालावधीत अंमलबजावणी नाही' : 'No executions in this range'}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" style={{ minWidth: '640px' }}>
                  <thead>
                    <tr className="bg-navy-950">
                      {['Date', 'Time', 'Dam', 'Gate', 'Op', 'Value', 'Executed By'].map(h => (
                        <th key={h} className="text-[10.5px] font-semibold text-white/70 px-3 py-2.5 text-left tracking-[.3px] uppercase first:pl-5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gateLog.map((c, i) => (
                      <tr key={c.id} className={`border-b border-border-2 last:border-0 hover:bg-surface-2 transition-colors ${i % 2 === 1 ? 'bg-surface-2/40' : ''}`}>
                        <td className="pl-5 pr-3 py-2.5 text-[12px]">{new Date(c.executed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="px-3 py-2.5 text-[11.5px] font-mono text-muted">{new Date(c.executed_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-3 py-2.5 text-[12px]">{damName(c.dam_id)}</td>
                        <td className="px-3 py-2.5 text-[12px]">{c.gate || '–'}</td>
                        <td className="px-3 py-2.5 text-[12px]">{c.type}</td>
                        <td className="px-3 py-2.5 text-[12px]">{c.value || '–'}</td>
                        <td className="px-3 py-2.5 text-[12px]">{officerName(c.executed_by)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
