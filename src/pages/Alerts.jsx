import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/index.js';
import { supabase } from '../lib/supabase.js';
import { useUIStore } from '../store/uiStore.js';
import { cmdRef } from '../lib/format.js';

const ICON = {
  emergency: { ic: '🚨', bg: '#FDE8E8' },
  cmd:       { ic: '📋', bg: '#FEF3C7' },
  accepted:  { ic: '✅', bg: '#D1FAE5' },
  executed:  { ic: '⚙️', bg: '#EBF0FF' },
};

export default function Alerts() {
  const { lang } = useUIStore();
  const mr = lang === 'mr';
  const qc = useQueryClient();

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
  const { data: commands = [] } = useQuery({
    queryKey: ['commands'],
    queryFn:  () => api.getCommands(),
    select:   r => r.commands ?? [],
  });
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn:  () => api.getAlerts(),
    select:   r => r.alerts ?? [],
  });

  useEffect(() => {
    const channel = supabase
      .channel('public:alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
        qc.invalidateQueries({ queryKey: ['alerts'] });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [qc]);

  // Combine the dedicated alerts feed with derived issue/accept/execute events
  // from the commands table, so the page mirrors the full activity stream
  // instead of only the rare emergency broadcasts.
  const feed = useMemo(() => {
    const officerName = (id) => {
      const o = officers.find(o => o.id === id);
      return o ? (mr ? o.nameMr : o.nameEn) : (mr ? 'अज्ञात' : 'Unknown');
    };
    const damName = (id) => {
      const d = dams.find(d => d.id === id);
      return d ? d.nameEn : (mr ? 'धरण' : 'a dam');
    };

    const items = [];

    alerts.forEach(a => items.push({
      key: 'alert-' + a.id, type: 'emergency', time: a.issued_at,
      title: mr ? 'आणीबाणी सूचना' : 'Emergency Alert',
      body: a.message, who: officerName(a.issued_by),
    }));

    commands.forEach(c => {
      const gateOp = `${c.gate || '–'} · ${c.type} ${c.value || ''}`.trim();
      items.push({
        key: 'cmd-' + c.id, type: 'cmd', time: c.issued_at,
        title: mr ? `${cmdRef(c.id)} जारी` : `${cmdRef(c.id)} issued`,
        body: `${gateOp} — ${damName(c.dam_id)}`, who: officerName(c.issued_by),
      });
      if (c.accepted_at) items.push({
        key: 'acc-' + c.id, type: 'accepted', time: c.accepted_at,
        title: mr ? `${cmdRef(c.id)} स्वीकृत` : `${cmdRef(c.id)} accepted`,
        body: `${gateOp} — ${damName(c.dam_id)}`, who: officerName(c.accepted_by),
      });
      if (c.executed_at) items.push({
        key: 'exe-' + c.id, type: 'executed', time: c.executed_at,
        title: mr ? `${cmdRef(c.id)} अंमलात` : `${cmdRef(c.id)} executed`,
        body: `${gateOp} — ${damName(c.dam_id)}`, who: officerName(c.executed_by),
      });
    });

    return items.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 50);
  }, [alerts, commands, dams, officers, mr]);

  return (
    <div>
      <div className="bg-surface border-b border-border px-5 py-3.5">
        <h3 className="text-[16px] font-bold text-navy-950 font-serif leading-none">
          {mr ? 'सूचना व सतर्कता' : 'Notifications & Alerts'}
        </h3>
        <div className="text-[11px] text-muted mt-1">
          {mr ? 'आदेश व आणीबाणी सूचनांचा सजीव फीड' : 'Live feed of commands and emergency alerts'}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2.5 max-w-[720px]">
        {isLoading ? (
          <div className="py-10 text-center text-[13px] text-muted">Loading…</div>
        ) : feed.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-muted">
            {mr ? 'अद्याप कोणत्याही सूचना नाहीत' : 'No notifications yet'}
          </div>
        ) : feed.map(n => {
          const meta = ICON[n.type] || ICON.cmd;
          return (
            <div key={n.key} className="bg-surface border border-border rounded-xl shadow-xs px-4 py-3 flex gap-3 items-start">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[16px] shrink-0" style={{ background: meta.bg }}>
                {meta.ic}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-navy-950">{n.title}</div>
                <div className="text-[12px] text-muted mt-0.5">{n.body}</div>
                <div className="text-[11px] text-muted/70 mt-1">{n.who}</div>
              </div>
              <div className="text-[11px] text-muted shrink-0 font-mono whitespace-nowrap">
                {new Date(n.time).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
