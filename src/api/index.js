import { toast } from 'sonner';
import { supabase } from '../lib/supabase.js';

// ── Demo data ──────────────────────────────────────────────────────────

const _DEMO_DAMS_INIT = [
  // ── Nashik ──────────────────────────────────────────────────────────
  {
    id: 'demo-1',
    nameEn: 'Gangapur Dam',        nameMr: 'गंगापूर धरण',
    riverEn: 'Godavari',           riverMr: 'गोदावरी',
    district: 'Nashik',            division: 'Nashik Division',
    frl: '583.50',                 mwl: '584.30',
    gates: '10',                   gtypeEn: 'Radial Gates',     gtypeMr: 'रेडियल दरवाजे',
    capacity: '227.02',            catchment: '1,952 sq.km',
    waterLevel: '580.22',          storage: '68',               rainfall: '14',  avgRainfall: '920',
    civilDiv: 'Er. Suresh Patil',    civilSub: 'Er. Rekha Bhosale',
    mechDiv:  'Er. Vijay Jadhav',   mechSub:  'Er. Santosh Gaikwad',
    elecDiv:  'Er. Prakash Joshi',  elecSub:  'Er. Anita Deshmukh',
    contacts: [
      { name: 'Er. Suresh Patil',   desig: 'Executive Engineer, Civil',    mobile: '9421201001' },
      { name: 'Er. Vijay Jadhav',   desig: 'Executive Engineer, Mech.',    mobile: '9421201002' },
      { name: 'Er. Rekha Bhosale',  desig: 'Deputy Engineer, Civil',       mobile: '9421201003' },
    ],
    status: 'active',
  },
  {
    id: 'demo-2',
    nameEn: 'Darna Dam',           nameMr: 'दारणा धरण',
    riverEn: 'Darna',              riverMr: 'दारणा',
    district: 'Nashik',            division: 'Nashik Division',
    frl: '630.00',                 mwl: '631.00',
    gates: '6',                    gtypeEn: 'Crest Gates',      gtypeMr: 'क्रेस्ट दरवाजे',
    capacity: '130.25',            catchment: '843 sq.km',
    waterLevel: '625.40',          storage: '55',               rainfall: '8',   avgRainfall: '1050',
    civilDiv: 'Er. Anand Kulkarni',  civilSub: 'Er. Priti Desai',
    mechDiv:  'Er. Mahesh More',    mechSub:  'Er. Sunita Wagh',
    elecDiv:  'Er. Hemant Naik',    elecSub:  'Er. Sujata Bhole',
    contacts: [
      { name: 'Er. Anand Kulkarni', desig: 'Executive Engineer',           mobile: '9421202001' },
      { name: 'Er. Priti Desai',    desig: 'Deputy Engineer, Civil',       mobile: '9421202002' },
      { name: 'Er. Mahesh More',    desig: 'Deputy Engineer, Mech.',       mobile: '9421202003' },
    ],
    status: 'active',
  },
  // ── Pune ────────────────────────────────────────────────────────────
  {
    id: 'demo-3',
    nameEn: 'Khadakwasla Dam',     nameMr: 'खडकवासला धरण',
    riverEn: 'Mutha',              riverMr: 'मुठा',
    district: 'Pune',              division: 'Pune Division',
    frl: '593.21',                 mwl: '594.10',
    gates: '14',                   gtypeEn: 'Radial Gates',     gtypeMr: 'रेडियल दरवाजे',
    capacity: '115.00',            catchment: '895 sq.km',
    waterLevel: '590.55',          storage: '72',               rainfall: '22',  avgRainfall: '780',
    civilDiv: 'Er. Nitin Sharma',    civilSub: 'Er. Kavita Mane',
    mechDiv:  'Er. Rajesh Shinde',  mechSub:  'Er. Deepak Kadam',
    elecDiv:  'Er. Suhas Deshpande', elecSub: 'Er. Ranjana Bhosale',
    contacts: [
      { name: 'Er. Nitin Sharma',   desig: 'Superintending Engineer',      mobile: '9421203001' },
      { name: 'Er. Kavita Mane',    desig: 'Executive Engineer, Civil',    mobile: '9421203002' },
      { name: 'Er. Rajesh Shinde',  desig: 'Executive Engineer, Mech.',    mobile: '9421203003' },
    ],
    status: 'active',
  },
  {
    id: 'demo-4',
    nameEn: 'Pawana Dam',          nameMr: 'पवना धरण',
    riverEn: 'Pawana',             riverMr: 'पवना',
    district: 'Pune',              division: 'Pune Division',
    frl: '635.00',                 mwl: '636.00',
    gates: '4',                    gtypeEn: 'Crest Gates',      gtypeMr: 'क्रेस्ट दरवाजे',
    capacity: '114.11',            catchment: '262 sq.km',
    waterLevel: '631.20',          storage: '62',               rainfall: '18',  avgRainfall: '1200',
    civilDiv: 'Er. Anil Joshi',      civilSub: 'Er. Varsha Patil',
    mechDiv:  'Er. Manoj Pawar',    mechSub:  'Er. Lata Kale',
    elecDiv:  'Er. Nilesh Thakur',  elecSub:  'Er. Uma Sawant',
    contacts: [
      { name: 'Er. Anil Joshi',     desig: 'Executive Engineer',           mobile: '9421204001' },
      { name: 'Er. Varsha Patil',   desig: 'Deputy Engineer, Civil',       mobile: '9421204002' },
      { name: 'Er. Manoj Pawar',    desig: 'Deputy Engineer, Mech.',       mobile: '9421204003' },
    ],
    status: 'active',
  },
  // ── Satara ──────────────────────────────────────────────────────────
  {
    id: 'demo-5',
    nameEn: 'Koyna Dam',                nameMr: 'कोयना धरण',
    riverEn: 'Koyna',                   riverMr: 'कोयना',
    district: 'Satara',                 division: 'Koyna Division',
    frl: '659.00',                      mwl: '660.00',
    gates: '18',                        gtypeEn: 'Tainter Gates',    gtypeMr: 'टेंटर दरवाजे',
    capacity: '2797.40',                catchment: '891 sq.km',
    waterLevel: '654.30',               storage: '78',               rainfall: '35',  avgRainfall: '4500',
    civilDiv: 'Er. Pradeep Chougule',   civilSub: 'Er. Sanjana More',
    mechDiv:  'Er. Vishwas Sawant',     mechSub:  'Er. Rohit Rane',
    elecDiv:  'Er. Ashok Bhosale',      elecSub:  'Er. Suman Pawar',
    contacts: [
      { name: 'Er. Pradeep Chougule', desig: 'Superintending Engineer',    mobile: '9421205001' },
      { name: 'Er. Sanjana More',     desig: 'Executive Engineer, Civil',  mobile: '9421205002' },
      { name: 'Er. Vishwas Sawant',   desig: 'Executive Engineer, Mech.',  mobile: '9421205003' },
    ],
    status: 'active',
  },
  // ── Ahmednagar ──────────────────────────────────────────────────────
  {
    id: 'demo-6',
    nameEn: 'Bhandardara Dam',     nameMr: 'भंडारदरा धरण',
    riverEn: 'Pravara',            riverMr: 'प्रवरा',
    district: 'Ahmednagar',        division: 'Ahmednagar Division',
    frl: '706.40',                 mwl: '707.20',
    gates: '6',                    gtypeEn: 'Radial Gates',     gtypeMr: 'रेडियल दरवाजे',
    capacity: '321.90',            catchment: '294 sq.km',
    waterLevel: '702.15',          storage: '58',               rainfall: '28',  avgRainfall: '2500',
    civilDiv: 'Er. Sandeep Jagtap',  civilSub: 'Er. Neeta Salve',
    mechDiv:  'Er. Dinesh Thorat',  mechSub:  'Er. Geeta Kale',
    elecDiv:  'Er. Vinod Kulkarni', elecSub:  'Er. Priya Yadav',
    contacts: [
      { name: 'Er. Sandeep Jagtap', desig: 'Executive Engineer',           mobile: '9421206001' },
      { name: 'Er. Neeta Salve',    desig: 'Deputy Engineer, Civil',       mobile: '9421206002' },
      { name: 'Er. Dinesh Thorat',  desig: 'Deputy Engineer, Mech.',       mobile: '9421206003' },
    ],
    status: 'active',
  },
  {
    id: 'demo-7',
    nameEn: 'Mula Dam',            nameMr: 'मुळा धरण',
    riverEn: 'Mula',               riverMr: 'मुळा',
    district: 'Ahmednagar',        division: 'Ahmednagar Division',
    frl: '579.00',                 mwl: '580.00',
    gates: '10',                   gtypeEn: 'Tainter Gates',    gtypeMr: 'टेंटर दरवाजे',
    capacity: '681.70',            catchment: '2,168 sq.km',
    waterLevel: '574.80',          storage: '45',               rainfall: '6',   avgRainfall: '750',
    civilDiv: 'Er. Ramesh Dabhade',      civilSub: 'Er. Priya Nimbalkar',
    mechDiv:  'Er. Sunil Nandgaonkar',  mechSub:  'Er. Pooja Shelar',
    elecDiv:  'Er. Kedar Joshi',         elecSub:  'Er. Kaveri Patil',
    contacts: [
      { name: 'Er. Ramesh Dabhade',     desig: 'Executive Engineer',       mobile: '9421207001' },
      { name: 'Er. Priya Nimbalkar',    desig: 'Deputy Engineer, Civil',   mobile: '9421207002' },
      { name: 'Er. Sunil Nandgaonkar', desig: 'Deputy Engineer, Mech.',    mobile: '9421207003' },
    ],
    status: 'active',
  },
  // ── Aurangabad ──────────────────────────────────────────────────────
  {
    id: 'demo-8',
    nameEn: 'Jayakwadi Dam',       nameMr: 'जायकवाडी धरण',
    riverEn: 'Godavari',           riverMr: 'गोदावरी',
    district: 'Aurangabad',        division: 'Aurangabad Division',
    frl: '549.00',                 mwl: '550.00',
    gates: '27',                   gtypeEn: 'Radial Gates',     gtypeMr: 'रेडियल दरवाजे',
    capacity: '2909.00',           catchment: '21,750 sq.km',
    waterLevel: '543.60',          storage: '38',               rainfall: '5',   avgRainfall: '680',
    civilDiv: 'Er. Abhay Ghule',     civilSub: 'Er. Manisha Borde',
    mechDiv:  'Er. Ganesh Jadhav',  mechSub:  'Er. Sunanda Kulkarni',
    elecDiv:  'Er. Amol Ghadge',    elecSub:  'Er. Renuka Wagh',
    contacts: [
      { name: 'Er. Abhay Ghule',       desig: 'Superintending Engineer',   mobile: '9421208001' },
      { name: 'Er. Manisha Borde',     desig: 'Executive Engineer, Civil', mobile: '9421208002' },
      { name: 'Er. Ganesh Jadhav',     desig: 'Executive Engineer, Mech.', mobile: '9421208003' },
    ],
    status: 'active',
  },
  // ── Kolhapur ────────────────────────────────────────────────────────
  {
    id: 'demo-9',
    nameEn: 'Radhanagari Dam',     nameMr: 'राधानगरी धरण',
    riverEn: 'Bhogavati',          riverMr: 'भोगावती',
    district: 'Kolhapur',          division: 'Kolhapur Division',
    frl: '525.00',                 mwl: '526.00',
    gates: '8',                    gtypeEn: 'Crest Gates',      gtypeMr: 'क्रेस्ट दरवाजे',
    capacity: '408.98',            catchment: '490 sq.km',
    waterLevel: '521.30',          storage: '82',               rainfall: '48',  avgRainfall: '3200',
    civilDiv: 'Er. Milind Chavan',   civilSub: 'Er. Swati Patil',
    mechDiv:  'Er. Vikram Shinde',  mechSub:  'Er. Archana Pawar',
    elecDiv:  'Er. Deepak Salunke', elecSub:  'Er. Smita Kumbhar',
    contacts: [
      { name: 'Er. Milind Chavan',  desig: 'Executive Engineer',           mobile: '9421209001' },
      { name: 'Er. Swati Patil',    desig: 'Deputy Engineer, Civil',       mobile: '9421209002' },
      { name: 'Er. Vikram Shinde',  desig: 'Deputy Engineer, Mech.',       mobile: '9421209003' },
    ],
    status: 'active',
  },
];

let _demoDams = [..._DEMO_DAMS_INIT];

const _DEMO_OFFICERS = [
  { id: 'D-1', nameMr: 'अभि. सुरेश पाटील',      nameEn: 'Er. Suresh Patil',      email: 'suresh.patil@demo.dgoms',      role: 'superadmin',  dept: 'civil',      district: 'Nashik',     division: 'Nashik Division',    status: 'online' },
  { id: 'D-2', nameMr: 'अभि. राजेश शिंदे',       nameEn: 'Er. Rajesh Shinde',     email: 'rajesh.shinde@demo.dgoms',     role: 'division',    dept: 'mechanical', district: 'Pune',       division: 'Pune Division',      status: 'online' },
  { id: 'D-3', nameMr: 'अभि. कविता माने',         nameEn: 'Er. Kavita Mane',       email: 'kavita.mane@demo.dgoms',       role: 'subdivision', dept: 'civil',      district: 'Pune',       division: 'Pune Sub-Division',  status: 'online' },
  { id: 'D-4', nameMr: 'अभि. विजय जाधव',         nameEn: 'Er. Vijay Jadhav',      email: 'vijay.jadhav@demo.dgoms',      role: 'division',    dept: 'civil',      district: 'Nashik',     division: 'Nashik Division',    status: 'offline'},
];

function _demo(action, d) {
  if (action === 'login') {
    const officer = {
      id: 'D-1', nameMr: 'अभि. सुरेश पाटील', nameEn: 'Er. Suresh Patil',
      email: d.email, mobile: '', role: 'superadmin', dept: 'civil',
      district: 'Nashik', division: 'Nashik Division',
    };
    return { success: true, officer };
  }

  if (action === 'getDams')     return { success: true, dams: _demoDams };
  if (action === 'getOfficers') return { success: true, officers: _DEMO_OFFICERS };
  if (action === 'getCommands') return { success: true, commands: [] };

  if (action === 'addDam' || action === 'updateDam') {
    const id = d.id || ('demo-' + Date.now());
    const dam = { ...d, id };
    const idx = _demoDams.findIndex(x => x.id === id);
    if (idx >= 0) _demoDams[idx] = dam; else _demoDams.push(dam);
    return { success: true, id };
  }

  if (action === 'updateLiveData') {
    const idx = _demoDams.findIndex(x => x.id === d.id);
    if (idx >= 0) Object.assign(_demoDams[idx], { waterLevel: d.waterLevel, storage: d.storage, rainfall: d.rainfall });
    return { success: true };
  }

  if (action === 'issueCommand') {
    setTimeout(() => toast.success('Command logged (demo)'), 50);
    return { success: true, cmdId: 'CMD-DEMO-' + Math.floor(Math.random() * 9000 + 1000) };
  }

  if (action === 'acceptCommand' || action === 'executeCommand') return { success: true };

  if (action === 'sendAlert') {
    setTimeout(() => toast.warning('Emergency alert sent (demo)'), 50);
    return { success: true };
  }

  return { success: false, error: 'Unknown action: ' + action };
}

// ── Demo mode: activate via ?demo in URL ──────────────────────────────
const _isDemoMode = new URLSearchParams(window.location.search).has('demo');

// ── Data transformers ─────────────────────────────────────────────────
function toDam(row) {
  return {
    id:          row.id,
    nameEn:      row.name_en,
    nameMr:      row.name_mr,
    riverEn:     row.river_en,
    riverMr:     row.river_mr,
    district:    row.district,
    division:    row.division,
    frl:         row.frl,
    mwl:         row.mwl,
    gates:       row.gates,
    gtypeEn:     row.gate_type_en,
    gtypeMr:     row.gate_type_mr,
    capacity:    row.capacity,
    catchment:   row.catchment,
    waterLevel:  row.water_level,
    storage:     row.storage,
    rainfall:    row.rainfall,
    avgRainfall: row.avg_rainfall,
    civilDiv:    row.civil_div,
    civilSub:    row.civil_sub,
    mechDiv:     row.mech_div,
    mechSub:     row.mech_sub,
    elecDiv:     row.elec_div,
    elecSub:     row.elec_sub,
    contacts:    (row.dam_contacts ?? [])
                   .sort((a, b) => a.sort_order - b.sort_order)
                   .map(c => ({ name: c.name, desig: c.desig, mobile: c.mobile })),
    status:      row.status,
  };
}

function fromDam(d) {
  return {
    name_en:      d.nameEn,
    name_mr:      d.nameMr,
    river_en:     d.riverEn,
    river_mr:     d.riverMr,
    district:     d.district,
    division:     d.division,
    frl:          d.frl        ? parseFloat(d.frl)        : null,
    mwl:          d.mwl        ? parseFloat(d.mwl)        : null,
    gates:        d.gates      ? parseInt(d.gates)        : 0,
    gate_type_en: d.gtypeEn,
    gate_type_mr: d.gtypeMr,
    capacity:     d.capacity   ? parseFloat(d.capacity)   : null,
    catchment:    d.catchment  || null,
    water_level:  d.waterLevel ? parseFloat(d.waterLevel) : null,
    storage:      d.storage    ? parseFloat(d.storage)    : null,
    rainfall:     d.rainfall   ? parseFloat(d.rainfall)   : null,
    avg_rainfall: d.avgRainfall? parseFloat(d.avgRainfall): null,
    civil_div:    d.civilDiv   || null,
    civil_sub:    d.civilSub   || null,
    mech_div:     d.mechDiv    || null,
    mech_sub:     d.mechSub    || null,
    elec_div:     d.elecDiv    || null,
    elec_sub:     d.elecSub    || null,
    status:       d.status     || 'active',
  };
}

function toOfficer(row) {
  return {
    id:       row.id,
    nameEn:   row.name_en,
    nameMr:   row.name_mr,
    email:    row.email,
    mobile:   row.mobile,
    role:     row.role,
    dept:     row.dept,
    district: row.district,
    division: row.division,
    status:   row.status,
  };
}

// ── Named API exports ──────────────────────────────────────────────────
export const api = {

  // ── Auth ────────────────────────────────────────────────────────────
  async login(email, password) {
    if (_isDemoMode) return _demo('login', { email, password });
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) return { success: false, error: 'Invalid email or password | चुकीचा ईमेल किंवा पासवर्ड' };

    const { data: officer, error: offErr } = await supabase
      .from('officers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('status', 'active')
      .single();

    if (offErr || !officer) {
      await supabase.auth.signOut();
      return { success: false, error: 'Not registered. Contact your administrator. | नोंदणी नाही. प्रशासकाशी संपर्क करा.' };
    }

    return { success: true, officer: toOfficer(officer) };
  },

  async resetPassword(email) {
    if (_isDemoMode) return { success: true };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  // ── Dams ────────────────────────────────────────────────────────────
  async getDams() {
    if (_isDemoMode) return _demo('getDams', {});
    const { data, error } = await supabase
      .from('dams')
      .select('*, dam_contacts(*)')
      .order('name_en');
    if (error) return { success: false, error: error.message, dams: [] };
    return { success: true, dams: data.map(toDam) };
  },

  async addDam(d) {
    if (_isDemoMode) return _demo('addDam', d);
    const { data: inserted, error } = await supabase
      .from('dams').insert(fromDam(d)).select().single();
    if (error) return { success: false, error: error.message };

    const contacts = (d.contacts ?? []).filter(c => c.name);
    if (contacts.length > 0) {
      await supabase.from('dam_contacts').insert(
        contacts.map((c, i) => ({ dam_id: inserted.id, name: c.name, desig: c.desig || null, mobile: c.mobile || null, sort_order: i }))
      );
    }
    return { success: true, id: inserted.id };
  },

  async updateDam(d) {
    if (_isDemoMode) return _demo('updateDam', d);
    const { error } = await supabase.from('dams').update(fromDam(d)).eq('id', d.id);
    if (error) return { success: false, error: error.message };

    await supabase.from('dam_contacts').delete().eq('dam_id', d.id);
    const contacts = (d.contacts ?? []).filter(c => c.name);
    if (contacts.length > 0) {
      await supabase.from('dam_contacts').insert(
        contacts.map((c, i) => ({ dam_id: d.id, name: c.name, desig: c.desig || null, mobile: c.mobile || null, sort_order: i }))
      );
    }
    return { success: true, id: d.id };
  },

  async updateLiveData(d) {
    if (_isDemoMode) return _demo('updateLiveData', d);
    const { error } = await supabase.from('dams').update({
      water_level: d.waterLevel ? parseFloat(d.waterLevel) : null,
      storage:     d.storage    ? parseFloat(d.storage)    : null,
      rainfall:    d.rainfall   ? parseFloat(d.rainfall)   : null,
    }).eq('id', d.id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  // ── Officers ─────────────────────────────────────────────────────────
  async getOfficers() {
    if (_isDemoMode) return _demo('getOfficers', {});
    const { data, error } = await supabase
      .from('officers').select('*').eq('status', 'active').order('name_en');
    if (error) return { success: false, error: error.message, officers: [] };
    return { success: true, officers: data.map(toOfficer) };
  },

  async addOfficer(d) {
    if (_isDemoMode) return { success: true };
    const { error } = await supabase.from('officers').insert({
      name_en:  d.nameEn,
      name_mr:  d.nameMr,
      email:    d.email.toLowerCase().trim(),
      mobile:   d.mobile || null,
      role:     d.role,
      dept:     d.dept,
      district: d.district || null,
      division: d.division || null,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async updateOfficer(d) {
    if (_isDemoMode) return { success: true };
    const { error } = await supabase.from('officers').update({
      name_en:  d.nameEn,
      name_mr:  d.nameMr,
      mobile:   d.mobile || null,
      role:     d.role,
      dept:     d.dept,
      district: d.district || null,
      division: d.division || null,
      status:   d.status || 'active',
    }).eq('id', d.id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  // ── Commands ─────────────────────────────────────────────────────────
  async getCommands() {
    if (_isDemoMode) return _demo('getCommands', {});
    const { data, error } = await supabase
      .from('commands').select('*').order('issued_at', { ascending: false });
    if (error) return { success: false, error: error.message, commands: [] };
    return { success: true, commands: data };
  },

  async issueCommand(d) {
    if (_isDemoMode) return _demo('issueCommand', d);
    const { data, error } = await supabase.from('commands').insert({
      dam_id:    d.damId    || null,
      type:      d.type,
      details:   d.details  || null,
      issued_by: d.issuedBy || null,
    }).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, cmdId: data.id };
  },

  async acceptCommand(d) {
    if (_isDemoMode) return _demo('acceptCommand', d);
    const { error } = await supabase.from('commands').update({
      status: 'accepted', accepted_by: d.officerId, accepted_at: new Date().toISOString(),
    }).eq('id', d.cmdId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async executeCommand(d) {
    if (_isDemoMode) return _demo('executeCommand', d);
    const { error } = await supabase.from('commands').update({
      status: 'executed', executed_by: d.officerId, executed_at: new Date().toISOString(),
    }).eq('id', d.cmdId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async sendAlert(d) {
    if (_isDemoMode) return _demo('sendAlert', d);
    const { error } = await supabase.from('alerts').insert({
      dam_id:    d.damId    || null,
      issued_by: d.issuedBy || null,
      message:   d.message,
      type:      d.type     || 'emergency',
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },
};
