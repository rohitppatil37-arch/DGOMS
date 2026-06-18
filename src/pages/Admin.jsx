import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';
import { useUIStore } from '../store/uiStore.js';
import { ROLE_LABELS, DEPT_LABELS, DISTRICTS, DISTRICT_MR } from '../lib/constants.js';
import Button from '../components/ui/Button.jsx';

// ── Form control base class ───────────────────────────────────────────────
const FC = 'w-full border-[1.5px] border-border rounded-lg px-3 py-2.5 text-[13px] font-sans text-tx bg-surface outline-none focus:border-navy-800 focus:shadow-[0_0_0_3px_rgba(29,49,96,.08)] transition-all';

// ── Field wrapper ─────────────────────────────────────────────────────────
function Field({ label, labelMr, required, children, half }) {
  return (
    <div className={half ? '' : 'mb-3'}>
      <label className="block text-[12px] font-semibold text-navy-950 mb-1.5 tracking-[.1px]">
        {label}{required && <span className="text-[#DC2626] ml-0.5">*</span>}
        {labelMr && <span className="dv text-[11px] text-muted font-normal block mt-px">{labelMr}</span>}
      </label>
      {children}
    </div>
  );
}

// ── Section title inside modals ───────────────────────────────────────────
function SecTitle({ children, sub }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <span className="text-[10px] font-bold uppercase tracking-[.9px] whitespace-nowrap" style={{ color: 'var(--color-xs)' }}>
        {children}
      </span>
      {sub && <span className="dv text-[10.5px] text-muted font-normal">{sub}</span>}
      <div className="flex-1 h-px bg-border-2 ml-0.5" />
    </div>
  );
}

// ── Modal overlay ─────────────────────────────────────────────────────────
function Overlay({ children, onClose, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-[300] overflow-y-auto py-6 px-3 flex items-start justify-center"
      style={{ background: 'rgba(11,26,53,.55)', backdropFilter: 'blur(3px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-surface rounded-2xl w-full overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,.28)] ${wide ? 'max-w-[720px]' : 'max-w-[500px]'}`}>
        {children}
      </div>
    </div>
  );
}

function ModalHead({ title, sub, onClose }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 bg-navy-950 border-b-[3px] border-gold-600">
      <div>
        <h3 className="text-[16px] font-bold text-white font-serif leading-tight">{title}</h3>
        {sub && <p className="dv text-[11px] text-white/55 mt-0.5">{sub}</p>}
      </div>
      <button onClick={onClose}
        className="w-8 h-8 rounded-full bg-white/15 border border-white/25 text-white text-[20px] leading-none flex items-center justify-center cursor-pointer hover:bg-white/28 transition-colors font-sans">
        ×
      </button>
    </div>
  );
}

function ErrBanner({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-2 bg-[#FFF1F2] border border-[#FCA5A5] rounded-lg px-4 py-3 text-[12.5px] text-[#B91C1C]">
      ⚠️ <span>{msg}</span>
    </div>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────
function KpiCard({ label, labelMr, value, unit, icon, gradient }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 shadow-xs relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl" style={{ background: gradient }} />
      <div className="text-[22px] mb-2.5">{icon}</div>
      <div className="text-[10px] font-bold uppercase tracking-[.7px] text-muted mb-1">{label}</div>
      <div className="dv text-[10px] text-muted/70 mb-2">{labelMr}</div>
      <div className="text-[30px] font-bold text-navy-950 font-mono leading-none">
        {value ?? '–'}
        <span className="text-[12px] text-muted font-sans font-medium ml-1">{unit}</span>
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold
      ${active ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#22C55E]' : 'bg-[#94A3B8]'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

// ── OFFICER MODAL ─────────────────────────────────────────────────────────
const EMPTY_OFFICER = {
  nameEn: '', nameMr: '', email: '', mobile: '',
  role: 'field', dept: 'civil', district: '', division: '', status: 'active',
};

function OfficerModal({ initial, onClose, onSaved }) {
  const { id: actorId } = useAuthStore();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState(() => initial ? { ...EMPTY_OFFICER, ...initial } : { ...EMPTY_OFFICER });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    setErr('');
    if (!form.nameEn.trim()) { setErr('Name (English) is required'); return; }
    const email = form.email.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('Valid email address is required'); return; }
    setBusy(true);
    const payload = { ...form, email, nameMr: form.nameMr || form.nameEn, actorId };
    const res = isEdit
      ? await api.updateOfficer({ ...payload, id: initial.id })
      : await api.addOfficer(payload);
    if (!res.success) { setBusy(false); setErr(res.error || 'Save failed. Please try again.'); return; }

    if (!isEdit) {
      const inv = await api.inviteOfficer(email);
      setBusy(false);
      if (!inv.success) {
        toast.warning(`Officer added, but invite email failed: ${inv.error}`);
      } else {
        toast.success(`Officer added — invite email sent to ${email}`);
      }
    } else {
      setBusy(false);
      toast.success('Officer updated');
    }
    onSaved();
  }

  return (
    <Overlay onClose={onClose}>
      <ModalHead
        title={isEdit ? 'Edit Officer' : 'Add Officer'}
        sub={isEdit ? form.nameEn : 'नवीन अधिकारी नोंदणी'}
        onClose={onClose}
      />
      <div className="px-5 py-4 overflow-y-auto max-h-[72vh]">
        <div className="mb-3">
          <Field label="Name" required>
            <input className={FC} value={form.nameEn} onChange={e => set('nameEn', e.target.value)} placeholder="Er. Suresh Patil" />
          </Field>
        </div>

        <div className="mb-3">
          <Field label="Email Address" labelMr="ईमेल पत्ता" required>
            <input className={FC} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="officer@water.maharashtra.gov.in" />
          </Field>
        </div>

        <div className="mb-3">
          <Field label="Mobile Number" labelMr="मोबाईल क्रमांक">
            <input className={FC} type="tel" value={form.mobile} onChange={e => set('mobile', e.target.value)} placeholder="9421200001" maxLength={10} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <Field label="Role" labelMr="भूमिका" required>
            <select className={FC} value={form.role} onChange={e => set('role', e.target.value)}>
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.en}</option>
              ))}
            </select>
          </Field>
          <Field label="Department" labelMr="विभाग" required>
            <select className={FC} value={form.dept} onChange={e => set('dept', e.target.value)}>
              {Object.entries(DEPT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.en}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <Field label="District" labelMr="जिल्हा">
            <select className={FC} value={form.district} onChange={e => set('district', e.target.value)}>
              <option value="">— Select District —</option>
              {DISTRICTS.map(d => (
                <option key={d} value={d}>{d} / {DISTRICT_MR[d] || d}</option>
              ))}
            </select>
          </Field>
          <Field label="Division / Office" labelMr="कार्यालय">
            <input className={FC} value={form.division} onChange={e => set('division', e.target.value)} placeholder="e.g. Nashik Division" />
          </Field>
        </div>

        {isEdit && (
          <div className="mb-3">
            <Field label="Status" labelMr="स्थिती">
              <select className={FC} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active / सक्रिय</option>
                <option value="inactive">Inactive / निष्क्रिय</option>
              </select>
            </Field>
          </div>
        )}

        {err && <div className="mt-1"><ErrBanner msg={err} /></div>}
      </div>

      <div className="px-5 py-4 bg-surface-2 border-t border-border flex justify-end gap-3">
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="primary" size="sm" loading={busy} onClick={save}>
          {isEdit ? '✓ Update Officer' : '+ Add Officer'}
        </Button>
      </div>
    </Overlay>
  );
}

// ── DAM MODAL ─────────────────────────────────────────────────────────────
const EMPTY_DAM = {
  nameEn: '', nameMr: '', riverEn: '', riverMr: '',
  district: 'Nashik', dept: 'civil', division: '', subDivision: '',
  frl: '', mwl: '', sillLevel: '', capacity: '', catchment: '',
  civilDiv: '', civilSub: '', mechDiv: '', mechSub: '',
  elecDiv: '', elecSub: '',
  status: 'active',
};

const EMPTY_CONTACTS = [
  { name: '', desig: '', mobile: '' },
  { name: '', desig: '', mobile: '' },
  { name: '', desig: '', mobile: '' },
];

function DamModal({ initial, onClose, onSaved }) {
  const { id: actorId } = useAuthStore();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState(() => initial ? { ...EMPTY_DAM, ...initial } : { ...EMPTY_DAM });

  // Gate types: dynamic array of { typeEn, typeMr, count }
  const [gateTypes, setGateTypes] = useState(() => {
    if (initial?.gateTypes?.length) return initial.gateTypes.map(g => ({ ...g }));
    // Convert legacy single-type fields on edit
    if (initial?.gtypeEn) return [{ typeEn: initial.gtypeEn, typeMr: initial.gtypeMr || '', count: String(initial.gates || '') }];
    return [{ typeEn: '', typeMr: '', count: '' }];
  });

  const [contacts, setContacts] = useState(() => {
    if (initial?.contacts?.length) {
      const filled = initial.contacts.slice(0, 3).map(c => ({
        name: c.name || '', desig: c.desig || '', mobile: c.mobile || '',
      }));
      while (filled.length < 3) filled.push({ name: '', desig: '', mobile: '' });
      return filled;
    }
    return EMPTY_CONTACTS.map(c => ({ ...c }));
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function setContact(i, k, v) {
    setContacts(c => c.map((row, idx) => idx === i ? { ...row, [k]: v } : row));
  }
  function setGateType(i, k, v) {
    setGateTypes(g => g.map((row, idx) => idx === i ? { ...row, [k]: v } : row));
  }
  function addGateType() { setGateTypes(g => [...g, { typeEn: '', typeMr: '', count: '' }]); }
  function removeGateType(i) { setGateTypes(g => g.filter((_, idx) => idx !== i)); }

  const totalGates = gateTypes.reduce((s, g) => s + (parseInt(g.count) || 0), 0);

  async function save() {
    setErr('');
    if (!form.nameEn.trim()) { setErr('Dam Name (English) is required'); return; }
    if (!form.frl && form.frl !== 0) { setErr('FRL (Full Reservoir Level) is required'); return; }
    setBusy(true);
    const validGateTypes = gateTypes.filter(g => g.typeEn.trim());
    const payload = {
      ...form,
      nameMr: form.nameMr || form.nameEn,
      riverMr: form.riverMr || form.riverEn,
      gateTypes: validGateTypes,
      contacts: contacts.filter(c => c.name.trim()),
      actorId,
    };
    const res = isEdit
      ? await api.updateDam({ ...payload, id: initial.id })
      : await api.addDam(payload);
    setBusy(false);
    if (!res.success) { setErr(res.error || 'Save failed. Please try again.'); return; }
    toast.success(isEdit ? `${form.nameEn} updated` : `${form.nameEn} added successfully`);
    onSaved();
  }

  const numFC = FC + ' [appearance:textfield]';

  return (
    <Overlay onClose={onClose} wide>
      <ModalHead
        title={isEdit ? `Edit: ${form.nameEn}` : 'Add Dam'}
        sub={isEdit ? form.nameMr : 'नवीन धरण माहिती जोडा'}
        onClose={onClose}
      />

      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 190px)' }}>

        {/* ── Section 1: Basic Info ── */}
        <div className="px-5 py-4 border-b border-border-2">
          <SecTitle sub="मूलभूत माहिती">🏛️ Basic Information</SecTitle>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field label="Dam Name (English)" required half>
              <input className={FC} value={form.nameEn} onChange={e => set('nameEn', e.target.value)} placeholder="e.g. Gangapur Dam" />
            </Field>
            <Field label="River Name (English)" half>
              <input className={FC} value={form.riverEn} onChange={e => set('riverEn', e.target.value)} placeholder="e.g. Godavari" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field label="District" labelMr="जिल्हा" required half>
              <select className={FC} value={form.district} onChange={e => set('district', e.target.value)}>
                {DISTRICTS.map(d => (
                  <option key={d} value={d}>{d} / {DISTRICT_MR[d] || d}</option>
                ))}
              </select>
            </Field>
            <Field label="Department" labelMr="विभाग प्रकार" required half>
              <select className={FC} value={form.dept} onChange={e => set('dept', e.target.value)}>
                {Object.entries(DEPT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.en} / {v.mr}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Division" labelMr="विभाग कार्यालय" half>
              <input className={FC} value={form.division} onChange={e => set('division', e.target.value)} placeholder="e.g. Nashik Division" />
            </Field>
            <Field label="Sub-Division" labelMr="उपविभाग कार्यालय" half>
              <input className={FC} value={form.subDivision} onChange={e => set('subDivision', e.target.value)} placeholder="e.g. Gangapur Sub-Division" />
            </Field>
          </div>
        </div>

        {/* ── Section 2: Technical Details ── */}
        <div className="px-5 py-4 border-b border-border-2">
          <SecTitle sub="तांत्रिक तपशील">⚙️ Technical Details</SecTitle>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <Field label="FRL (m)" labelMr="पूर्ण साठा पातळी" required half>
              <input className={numFC} type="number" step="0.01" value={form.frl} onChange={e => set('frl', e.target.value)} placeholder="583.50" />
            </Field>
            <Field label="MWL (m)" labelMr="कमाल जल पातळी" half>
              <input className={numFC} type="number" step="0.01" value={form.mwl} onChange={e => set('mwl', e.target.value)} placeholder="584.30" />
            </Field>
            <Field label="Sill Level (m)" labelMr="उंबरठा पातळी" half>
              <input className={numFC} type="number" step="0.01" value={form.sillLevel} onChange={e => set('sillLevel', e.target.value)} placeholder="578.50" />
            </Field>
          </div>

          {/* Gate types — dynamic rows, BEFORE total gates */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[12px] font-semibold text-navy-950">Gate Types</span>
              <span className="dv text-[10.5px] text-muted">दरवाजाचे प्रकार</span>
              <button type="button" onClick={addGateType}
                className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-navy-800 bg-surface-2 border border-border rounded-lg px-2.5 py-1 hover:bg-navy-950 hover:text-white transition-all cursor-pointer font-sans">
                + Add Gate Type
              </button>
            </div>
            <div className="grid gap-2 mb-1.5 px-0.5" style={{ gridTemplateColumns: '1fr 72px 28px' }}>
              <span className="text-[10px] font-bold uppercase tracking-[.5px] text-muted">Gate Type</span>
              <span className="text-[10px] font-bold uppercase tracking-[.5px] text-muted text-center">Count</span>
              <span />
            </div>
            <div className="space-y-2">
              {gateTypes.map((g, i) => (
                <div key={i} className="grid gap-2 items-center" style={{ gridTemplateColumns: '1fr 72px 28px' }}>
                  <input className={FC} value={g.typeEn} onChange={e => setGateType(i, 'typeEn', e.target.value)} placeholder="e.g. Radial Gates" />
                  <input className={numFC + ' text-center'} type="number" min="0" value={g.count} onChange={e => setGateType(i, 'count', e.target.value)} placeholder="10" />
                  {gateTypes.length > 1 ? (
                    <button type="button" onClick={() => removeGateType(i)}
                      className="w-7 h-7 rounded-md bg-[#FFF1F2] border border-[#FCA5A5] text-[#DC2626] hover:bg-[#DC2626] hover:text-white transition-colors cursor-pointer text-[16px] flex items-center justify-center font-sans leading-none">
                      ×
                    </button>
                  ) : <div />}
                </div>
              ))}
            </div>
            {totalGates > 0 && (
              <div className="flex items-center gap-2 mt-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-3 py-2 text-[12px] text-[#1E40AF]">
                <span>Total gates (auto-calculated):</span>
                <strong className="font-mono text-[14px]">{totalGates}</strong>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Total Capacity (MCM)" labelMr="एकूण साठा (दलघमी)" half>
              <input className={numFC} type="number" step="0.01" value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="e.g. 227.02" />
            </Field>
            <Field label="Catchment Area" labelMr="जलग्रहण क्षेत्र" half>
              <input className={FC} value={form.catchment} onChange={e => set('catchment', e.target.value)} placeholder="e.g. 1,952 sq.km" />
            </Field>
          </div>
        </div>

        {/* ── Section 3: Officers in Charge ── */}
        <div className="px-5 py-4 border-b border-border-2">
          <SecTitle sub="प्रभारी अधिकारी">👤 Officers in Charge</SecTitle>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field label="Civil Division Officer" half>
              <input className={FC} value={form.civilDiv} onChange={e => set('civilDiv', e.target.value)} placeholder="Er. Suresh Patil" />
            </Field>
            <Field label="Civil Sub-Division Officer" half>
              <input className={FC} value={form.civilSub} onChange={e => set('civilSub', e.target.value)} placeholder="Er. Rekha Bhosale" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field label="Mechanical Division Officer" half>
              <input className={FC} value={form.mechDiv} onChange={e => set('mechDiv', e.target.value)} placeholder="Er. Vijay Jadhav" />
            </Field>
            <Field label="Mechanical Sub-Division Officer" half>
              <input className={FC} value={form.mechSub} onChange={e => set('mechSub', e.target.value)} placeholder="Er. Santosh Gaikwad" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Electrical Division Officer" half>
              <input className={FC} value={form.elecDiv} onChange={e => set('elecDiv', e.target.value)} placeholder="Er. Prakash Joshi" />
            </Field>
            <Field label="Electrical Sub-Division Officer" half>
              <input className={FC} value={form.elecSub} onChange={e => set('elecSub', e.target.value)} placeholder="Er. Anita Deshmukh" />
            </Field>
          </div>
        </div>

        {/* ── Section 4: Contact Persons ── */}
        <div className="px-5 py-4">
          <SecTitle sub="संपर्क व्यक्ती">📞 Contact Persons</SecTitle>
          <p className="text-[11.5px] text-muted mb-3">Shown on the public Dam Info page with mobile numbers. Empty rows are ignored.</p>
          <div className="grid grid-cols-3 gap-2 mb-1.5 px-0.5">
            <span className="text-[10.5px] font-bold uppercase tracking-[.5px] text-muted">Name</span>
            <span className="text-[10.5px] font-bold uppercase tracking-[.5px] text-muted">Designation</span>
            <span className="text-[10.5px] font-bold uppercase tracking-[.5px] text-muted">Mobile</span>
          </div>
          <div className="space-y-2">
            {contacts.map((c, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <input className={FC} value={c.name} onChange={e => setContact(i, 'name', e.target.value)} placeholder={`Contact person ${i + 1}`} />
                <input className={FC} value={c.desig} onChange={e => setContact(i, 'desig', e.target.value)} placeholder="Civil Div. Officer" />
                <input className={FC} type="tel" maxLength={10} value={c.mobile} onChange={e => setContact(i, 'mobile', e.target.value)} placeholder="9421200001" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="px-5 py-4 bg-surface-2 border-t border-border flex items-center justify-between gap-3">
        {err
          ? <div className="flex-1 mr-2"><ErrBanner msg={err} /></div>
          : <div />
        }
        <div className="flex items-center gap-3 shrink-0">
          {isEdit && (
            <Field label="Status" half>
              <select className={FC + ' !py-2'} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" loading={busy} onClick={save}>
            💾 {isEdit ? 'Update Dam' : 'Save Dam'}
            <span className="dv text-[10.5px] opacity-75 ml-1">{isEdit ? 'अपडेट करा' : 'जतन करा'}</span>
          </Button>
        </div>
      </div>
    </Overlay>
  );
}

// ── OFFICERS TAB ──────────────────────────────────────────────────────────
const ROLE_CHIP = {
  superadmin:  'bg-[#FBF0D0] text-[#7A4800]',
  division:    'bg-[#EFF6FF] text-[#1E40AF]',
  subdivision: 'bg-[#D1FAE5] text-[#065F46]',
  field:       'bg-[#F1F5F9] text-[#475569]',
};
const DEPT_CHIP = {
  civil:      'bg-[#EFF6FF] text-[#1E40AF]',
  mechanical: 'bg-[#EDE9FE] text-[#5B21B6]',
  electrical: 'bg-[#FEF3C7] text-[#7A4800]',
};

function OfficersTab({ lang }) {
  const mr = lang === 'mr';
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);

  const { data: officers = [], isLoading } = useQuery({
    queryKey: ['officersFull'],
    queryFn: () => api.getOfficersFull(),
    select: r => r.officers ?? [],
  });

  function onSaved() {
    setModal(null);
    qc.invalidateQueries({ queryKey: ['officers'] });
    qc.invalidateQueries({ queryKey: ['officersFull'] });
  }

  return (
    <div>
      {modal && (
        <OfficerModal
          initial={modal.officer}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-border-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-[3px] h-3.5 rounded-full bg-gold-600" />
            <span className="text-[10px] font-bold uppercase tracking-[.8px]" style={{ color: 'var(--color-xs)' }}>
              {mr ? 'अधिकारी' : 'Officers'}
            </span>
            {!isLoading && (
              <span className="text-[10.5px] font-semibold text-muted bg-surface-2 border border-border px-2 py-0.5 rounded-full">
                {officers.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setModal({ officer: null })}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-navy-950 bg-surface-2 border border-border rounded-lg px-3 py-1.5 hover:bg-navy-950 hover:text-white hover:border-navy-950 transition-all cursor-pointer font-sans">
            + {mr ? 'अधिकारी जोडा' : 'Add Officer'}
          </button>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-[13px] text-muted">Loading officers…</div>
        ) : officers.length === 0 ? (
          <div className="py-14 text-center">
            <div className="text-[30px] mb-3">👤</div>
            <div className="text-[13px] font-bold text-navy-950 mb-1">No officers registered yet</div>
            <div className="dv text-[12px] text-muted mb-4">अद्याप कोणताही अधिकारी नाही</div>
            <button onClick={() => setModal({ officer: null })}
              className="text-[12px] font-semibold text-navy-950 bg-navy-950/5 border border-navy-950/20 rounded-lg px-4 py-2 cursor-pointer hover:bg-navy-950 hover:text-white transition-all font-sans">
              + Add First Officer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '580px' }}>
              <thead>
                <tr className="bg-navy-950">
                  {['Name / नाव', 'Role', 'Dept', 'District', 'Status', ''].map(h => (
                    <th key={h} className="text-[10.5px] font-semibold text-white/70 px-4 py-3 text-left tracking-[.3px] uppercase first:pl-5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {officers.map((o, i) => (
                  <tr key={o.id} className={`border-b border-border-2 last:border-0 hover:bg-surface-2 transition-colors ${i % 2 === 1 ? 'bg-surface-2/40' : ''}`}>
                    <td className="pl-5 pr-4 py-3">
                      <div className="text-[13px] font-semibold text-navy-950">{o.nameEn}</div>
                      <div className="dv text-[11px] text-muted mt-0.5">{o.nameMr}</div>
                      <div className="text-[10.5px] text-muted/60 mt-0.5 font-mono">{o.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${ROLE_CHIP[o.role] || 'bg-[#F1F5F9] text-[#475569]'}`}>
                        {ROLE_LABELS[o.role]?.en || o.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${DEPT_CHIP[o.dept] || 'bg-[#F1F5F9] text-[#475569]'}`}>
                        {DEPT_LABELS[o.dept]?.en || o.dept}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-muted">{o.district || '–'}</td>
                    <td className="px-4 py-3"><StatusBadge active={o.status === 'active'} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setModal({ officer: o })}
                        className="text-[11.5px] font-semibold text-muted bg-surface-2 border border-border rounded-lg px-3 py-1 hover:border-navy-800 hover:text-navy-950 transition-all cursor-pointer font-sans">
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DAMS TAB ──────────────────────────────────────────────────────────────
function DamsTab({ lang }) {
  const mr = lang === 'mr';
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);

  const { data: dams = [], isLoading } = useQuery({
    queryKey: ['dams'],
    queryFn: () => api.getDams(),
    select: r => r.dams ?? [],
  });

  function onSaved() {
    setModal(null);
    qc.invalidateQueries({ queryKey: ['dams'] });
  }

  return (
    <div>
      {modal && (
        <DamModal
          initial={modal.dam}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-border-2 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-[3px] h-3.5 rounded-full bg-gold-600" />
              <span className="text-[10px] font-bold uppercase tracking-[.8px]" style={{ color: 'var(--color-xs)' }}>
                {mr ? 'धरण व्यवस्थापन' : 'Dam Management'}
              </span>
              {!isLoading && (
                <span className="text-[10.5px] font-semibold text-muted bg-surface-2 border border-border px-2 py-0.5 rounded-full">
                  {dams.length}
                </span>
              )}
            </div>
            <p className="text-[11.5px] text-muted mt-0.5 ml-5">
              {mr ? 'धरण माहिती जोडा — सार्वजनिक पानावर दिसेल.' : 'Add dams — data appears on the public Dam Info page.'}
            </p>
          </div>
          <button
            onClick={() => setModal({ dam: null })}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-navy-950 bg-surface-2 border border-border rounded-lg px-3 py-1.5 hover:bg-navy-950 hover:text-white hover:border-navy-950 transition-all cursor-pointer font-sans whitespace-nowrap">
            🏛️ + {mr ? 'धरण जोडा' : 'Add Dam'}
          </button>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-[13px] text-muted">Loading dams…</div>
        ) : dams.length === 0 ? (
          <div className="py-14 text-center">
            <div className="text-[30px] mb-3">🏛️</div>
            <div className="text-[13px] font-bold text-navy-950 mb-1">No dams added yet</div>
            <div className="dv text-[12px] text-muted mb-4">अद्याप कोणतेही धरण जोडलेले नाही</div>
            <button onClick={() => setModal({ dam: null })}
              className="text-[12px] font-semibold text-navy-950 bg-navy-950/5 border border-navy-950/20 rounded-lg px-4 py-2 cursor-pointer hover:bg-navy-950 hover:text-white transition-all font-sans">
              🏛️ + Add First Dam
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '640px' }}>
              <thead>
                <tr className="bg-navy-950">
                  {['Name / नाव', 'District', 'River', 'Gates', 'FRL', 'Status', ''].map(h => (
                    <th key={h} className="text-[10.5px] font-semibold text-white/70 px-4 py-3 text-left tracking-[.3px] uppercase first:pl-5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dams.map((d, i) => (
                  <tr key={d.id} className={`border-b border-border-2 last:border-0 hover:bg-surface-2 transition-colors ${i % 2 === 1 ? 'bg-surface-2/40' : ''}`}>
                    <td className="pl-5 pr-4 py-3">
                      <div className="text-[13px] font-semibold text-navy-950">{d.nameEn}</div>
                      <div className="dv text-[11px] text-muted mt-0.5">{d.nameMr}</div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-muted">{d.district}</td>
                    <td className="px-4 py-3 text-[12px] text-muted">{d.riverEn || '–'}</td>
                    <td className="px-4 py-3 text-[12.5px] font-mono text-navy-950 text-center">{d.gates || '–'}</td>
                    <td className="px-4 py-3 text-[12.5px] font-mono text-navy-950">{d.frl ? d.frl + ' m' : '–'}</td>
                    <td className="px-4 py-3"><StatusBadge active={d.status === 'active'} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setModal({ dam: d })}
                        className="text-[11.5px] font-semibold text-muted bg-surface-2 border border-border rounded-lg px-3 py-1 hover:border-navy-800 hover:text-navy-950 transition-all cursor-pointer font-sans">
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN ADMIN PAGE ───────────────────────────────────────────────────────
const TABS = [
  { id: 'officers', en: '👤 Officers', mr: '👤 अधिकारी' },
  { id: 'dams',     en: '🏛️ Dams',    mr: '🏛️ धरणे' },
];

export default function Admin() {
  const { lang } = useUIStore();
  const mr = lang === 'mr';
  const [tab, setTab] = useState('officers');

  const { data: officers = [] } = useQuery({
    queryKey: ['officers'],
    queryFn: () => api.getOfficers(),
    select: r => r.officers ?? [],
  });

  const { data: dams = [] } = useQuery({
    queryKey: ['dams'],
    queryFn: () => api.getDams(),
    select: r => r.dams ?? [],
  });

  const totalGates = dams.reduce((s, d) => s + (parseInt(d.gates) || 0), 0);

  return (
    <div>
      {/* Page header */}
      <div className="bg-surface border-b border-border px-5 py-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-navy-950/[.07] border border-navy-950/10 flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-navy-950">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M12 8v4l3 3" />
          </svg>
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-navy-950 font-serif leading-none">
            {mr ? 'प्रशासन नियंत्रण पॅनेल' : 'Admin Control Panel'}
          </h3>
          <div className="text-[11px] text-muted mt-1 leading-none">
            {mr ? 'Admin Panel — Super Admin Only' : 'Super Admin only · Manage dams, officers, and system'}
          </div>
        </div>
        <div className="ml-auto shrink-0">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-[#FBF0D0] text-[#7A4800] border border-[#F59E0B]/30">
            ⭐ Super Admin
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <KpiCard
            label={mr ? 'अधिकारी' : 'Officers'}
            labelMr={mr ? 'Officers Registered' : 'नोंदणीकृत अधिकारी'}
            value={officers.length}
            unit="registered"
            icon="👤"
            gradient="linear-gradient(90deg, #1E3FA8, #6A8FE8)"
          />
          <KpiCard
            label={mr ? 'सक्रिय धरणे' : 'Active Dams'}
            labelMr={mr ? 'Active Dams' : 'सक्रिय धरणे'}
            value={dams.filter(d => d.status === 'active').length}
            unit={`of ${dams.length} total`}
            icon="🏛️"
            gradient="linear-gradient(90deg, #0F5132, #22C55E)"
          />
          <KpiCard
            label={mr ? 'एकूण दरवाजे' : 'Total Gates'}
            labelMr={mr ? 'Total Gates' : 'एकूण दरवाजे'}
            value={totalGates}
            unit="gates"
            icon="🚪"
            gradient="linear-gradient(90deg, #7A4800, #F59E0B)"
          />
        </div>

        {/* Tab strip */}
        <div className="flex border-b border-border mb-4 overflow-x-auto gap-0.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap border-b-2 -mb-px transition-all cursor-pointer bg-transparent font-sans
                ${tab === t.id
                  ? 'text-navy-950 border-gold-600'
                  : 'text-muted border-transparent hover:text-navy-950 hover:bg-surface-2'}`}>
              {mr ? t.mr : t.en}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'officers' && <OfficersTab lang={lang} />}
        {tab === 'dams'     && <DamsTab lang={lang} />}
      </div>
    </div>
  );
}
