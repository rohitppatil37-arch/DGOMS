import { toast } from 'sonner';
import { BACKEND_URL } from '../lib/constants.js';

// ── Demo data ──────────────────────────────────────────────────────────
let _demoOTP = '';
let _demoRegData = {};
let _demoDams = [];

function _demo(action, d) {
  if (action === 'sendOTP' || action === 'loginOTP') {
    if (!d.mobile || d.mobile.length !== 10)
      return { success: false, error: 'Valid 10-digit mobile required | वैध मोबाइल क्रमांक हवा' };
    _demoOTP = String(Math.floor(100000 + Math.random() * 900000));
    setTimeout(() => toast.info(`Demo OTP: ${_demoOTP}`, { description: 'Set BACKEND_URL for real SMS via Fast2SMS', duration: Infinity }), 50);
    return { success: true, message: 'OTP sent (demo mode)' };
  }

  if (action === 'verifyOTP') {
    if (d.otp !== _demoOTP) return { success: false, error: 'Incorrect OTP | चुकीचा OTP' };
    const demoOfficers = {
      '9876543210': { id: 'D-1', nameMr: 'अभि. सुरेश पाटील', nameEn: 'Er. Suresh Patil', mobile: '9876543210', role: 'superadmin', district: 'Demo', division: 'HQ' },
      '9876543211': { id: 'D-2', nameMr: 'अभि. राजेश कुमार', nameEn: 'Er. Rajesh Kumar', mobile: '9876543211', role: 'division', district: 'Demo', division: 'Demo Div.' },
      '9876543212': { id: 'D-3', nameMr: 'अभि. मीना शिंदे', nameEn: 'Er. Meena Shinde', mobile: '9876543212', role: 'subdivision', district: 'Demo', division: 'Pandharpur Sub.' },
      '9876543213': { id: 'D-4', nameMr: 'अभि. विजय जाधव', nameEn: 'Er. Vijay Jadhav', mobile: '9876543213', role: 'field', district: 'Demo', division: 'Barshi Field' },
    };
    const officer = demoOfficers[d.mobile] || { id: 'D-X', nameMr: 'अभि. डेमो वापरकर्ता', nameEn: 'Er. Demo User', mobile: d.mobile, role: 'field', district: 'Pune', division: 'Demo Div.' };
    return { success: true, officer };
  }

  if (action === 'register') {
    if (!d.nameEn || !d.nameMr || !d.mobile || d.mobile.length !== 10 || !d.division)
      return { success: false, error: 'All fields required | सर्व माहिती आवश्यक' };
    _demoOTP = String(Math.floor(100000 + Math.random() * 900000));
    _demoRegData = d;
    setTimeout(() => toast.info(`Demo Registration OTP: ${_demoOTP}`, { description: 'Set BACKEND_URL for real SMS', duration: Infinity }), 50);
    return { success: true, message: 'OTP sent for registration' };
  }

  if (action === 'verifyRegOTP') {
    if (d.otp !== _demoOTP) return { success: false, error: 'Incorrect OTP | चुकीचा OTP' };
    return { success: true, message: 'Registration successful!' };
  }

  if (action === 'issueCommand') {
    setTimeout(() => toast.success('Command logged (demo)', { description: 'Would SMS all registered officers. Set BACKEND_URL to enable real SMS.' }), 50);
    return { success: true, cmdId: 'CMD-DEMO-' + Math.floor(Math.random() * 9000 + 1000) };
  }

  if (action === 'acceptCommand') return { success: true };
  if (action === 'executeCommand') return { success: true };

  if (action === 'sendAlert') {
    setTimeout(() => toast.warning('Emergency alert sent (demo)', { description: 'Would SMS ALL officers. Set BACKEND_URL to enable real SMS.' }), 50);
    return { success: true, count: 'all' };
  }

  if (action === 'getOfficers') {
    return {
      success: true,
      officers: [
        { id: 'D-1', nameMr: 'अभि. सुरेश पाटील', nameEn: 'Er. Suresh Patil', role: 'Super Admin', district: 'Demo', status: 'online' },
        { id: 'D-2', nameMr: 'अभि. राजेश कुमार', nameEn: 'Er. Rajesh Kumar', role: 'Division', district: 'Demo', status: 'online' },
        { id: 'D-3', nameMr: 'अभि. मीना शिंदे', nameEn: 'Er. Meena Shinde', role: 'Sub-Div.', district: 'Demo', status: 'offline' },
        { id: 'D-4', nameMr: 'अभि. विजय जाधव', nameEn: 'Er. Vijay Jadhav', role: 'Field', district: 'Demo', status: 'online' },
      ],
    };
  }

  if (action === 'getDams') return { success: true, dams: _demoDams };

  if (action === 'addDam' || action === 'updateDam') {
    const id = d.id || ('dam-' + Date.now());
    const dam = { ...d, id };
    const idx = _demoDams.findIndex(x => x.id === dam.id);
    if (idx >= 0) _demoDams[idx] = dam; else _demoDams.push(dam);
    return { success: true, id };
  }

  if (action === 'updateLiveData') {
    const idx = _demoDams.findIndex(x => x.id === d.id);
    if (idx >= 0) { _demoDams[idx].waterLevel = d.waterLevel; _demoDams[idx].storage = d.storage; _demoDams[idx].rainfall = d.rainfall; }
    return { success: true };
  }

  if (action === 'getCommands') return { success: true, commands: [] };

  return { success: false, error: 'Unknown action: ' + action };
}

// ── Core request function ──────────────────────────────────────────────
async function request(action, data = {}, method = 'POST') {
  if (!BACKEND_URL) return _demo(action, data);
  try {
    if (method === 'GET') {
      const qs = new URLSearchParams({ action, ...data }).toString();
      const r = await fetch(BACKEND_URL + '?' + qs);
      return await r.json();
    }
    const r = await fetch(BACKEND_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...data }),
    });
    return await r.json();
  } catch {
    // CORS GET fallback
    try {
      const qs = new URLSearchParams({ action, data: JSON.stringify(data) }).toString();
      const r2 = await fetch(BACKEND_URL + '?' + qs);
      return await r2.json();
    } catch (e2) {
      return { success: false, error: e2.message };
    }
  }
}

// ── Named API exports ──────────────────────────────────────────────────
export const api = {
  // Auth
  sendOTP:       (mobile)  => request('sendOTP',      { mobile, purpose: 'login' }),
  verifyOTP:     (mobile, otp) => request('verifyOTP', { mobile, otp }),
  register:      (data)    => request('register',      data),
  verifyRegOTP:  (mobile, otp) => request('verifyRegOTP', { mobile, otp }),

  // Commands
  issueCommand:   (data)   => request('issueCommand',   data),
  acceptCommand:  (data)   => request('acceptCommand',  data),
  executeCommand: (data)   => request('executeCommand', data),
  sendAlert:      (data)   => request('sendAlert',      data),

  // Data (GET)
  getOfficers: ()          => request('getOfficers', {}, 'GET'),
  getCommands: ()          => request('getCommands', {}, 'GET'),
  getDams:     ()          => request('getDams',     {}, 'GET'),

  // Dam management
  addDam:        (data)    => request('addDam',        data),
  updateDam:     (data)    => request('updateDam',     data),
  updateLiveData: (data)   => request('updateLiveData', data),
};
