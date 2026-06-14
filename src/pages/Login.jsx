import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useUIStore }  from '../store/uiStore.js';
import { t }          from '../lib/i18n.js';
import { api }        from '../api/index.js';
import { ROLE_LABELS, DISTRICTS, DISTRICT_MR } from '../lib/constants.js';
import Button    from '../components/ui/Button.jsx';
import OtpInput  from '../components/ui/OtpInput.jsx';
import InfoBox   from '../components/ui/InfoBox.jsx';

// ── Small emblem for login card ────────────────────────────────────────
function LoginEmblem() {
  return (
    <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-gold-600/50 flex items-center justify-center mx-auto mb-3">
      <svg width="36" height="36" viewBox="0 0 54 54">
        <circle cx="27" cy="27" r="26" fill="#0B1A35" stroke="#C09020" strokeWidth="1.5" />
        <rect x="22" y="13" width="10" height="13" rx="2" fill="#C09020" />
        <rect x="18" y="26" width="18" height="4" fill="#C09020" />
        <path d="M10 33 Q18 29 27 33 Q36 37 44 31" stroke="#60A5FA" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ── Countdown hook ──────────────────────────────────────────────────────
function useCountdown(initial = 60) {
  const [sec, setSec] = useState(0);
  const timer = useRef(null);
  function start() {
    setSec(initial);
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setSec(s => { if (s <= 1) { clearInterval(timer.current); return 0; } return s - 1; });
    }, 1000);
  }
  useEffect(() => () => clearInterval(timer.current), []);
  return [sec, start];
}

// ── Login flow ──────────────────────────────────────────────────────────
function LoginFlow({ lang, onSuccess }) {
  const [step, setStep]     = useState(1);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp]       = useState([]);
  const [err, setErr]       = useState('');
  const [busy, setBusy]     = useState(false);
  const [cd, startCd]       = useCountdown(60);

  async function sendOTP() {
    const mob = mobile.replace(/\D/g, '');
    setErr('');
    if (mob.length !== 10) { setErr('Valid 10-digit mobile required | वैध मोबाइल क्रमांक हवा'); return; }
    setBusy(true);
    const res = await api.sendOTP(mob);
    setBusy(false);
    if (!res.success) { setErr(res.error || 'Failed. Try again.'); return; }
    setStep(2);
    startCd();
  }

  async function verifyOTP() {
    const otpStr = otp.join('');
    setErr('');
    if (otpStr.length < 6) { setErr('Enter all 6 digits | ६ अंक टाका'); return; }
    setBusy(true);
    const res = await api.verifyOTP(mobile.replace(/\D/g, ''), otpStr);
    setBusy(false);
    if (!res.success) { setErr(res.error || 'Invalid OTP | चुकीचा OTP'); return; }
    onSuccess(res.officer);
  }

  if (step === 1) return (
    <div>
      <InfoBox type="info" icon="📱">
        {t('otpInfo', lang)}
        <span className="dv block text-[11.5px] mt-[3px]">नोंदणीकृत मोबाइलवर OTP</span>
      </InfoBox>
      <div className="mb-[13px]">
        <label className="block text-[12.5px] font-semibold text-navy-950 mb-[5px]">
          {t('mobileLabel', lang)}
          <span className="dv text-[11px] text-muted font-normal block mt-[2px]">मोबाइल क्रमांक</span>
        </label>
        <input
          className="w-full border-[1.5px] border-border rounded-[5px] px-3 py-[9px] text-[13px] font-sans text-tx bg-surface outline-none focus:border-navy-800 focus:shadow-[0_0_0_3px_rgba(29,49,96,.1)] transition-all"
          type="tel" inputMode="numeric" maxLength={10} placeholder="98765 43210"
          value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && sendOTP()}
        />
      </div>
      {err && <ErrMsg>{err}</ErrMsg>}
      <Button variant="primary" loading={busy} onClick={sendOTP} className="w-full justify-center py-[11px]">
        📱 {t('sendOtp', lang)} <span className="dv text-[11px] opacity-80">OTP पाठवा</span>
      </Button>

      {/* Demo hint */}
      <div className="bg-surface-2 border border-border-2 rounded-[5px] px-[13px] py-[10px] mt-[14px]">
        <div className="text-[11px] font-bold text-xs uppercase tracking-[.6px] mb-[7px]">⚙️ Demo Mode (no backend)</div>
        <div className="flex justify-between text-[12px] text-muted py-[2px]"><span>Any 10-digit mobile</span><span className="font-mono font-medium text-navy-950">→ OTP in alert</span></div>
        <div className="flex justify-between text-[12px] text-muted py-[2px]"><span>Set BACKEND_URL for</span><span>real SMS</span></div>
      </div>
    </div>
  );

  return (
    <div>
      <InfoBox type="success" icon="📱">
        {t('otpSent', lang)} Sent to ×××-×××-{mobile.slice(-4)}.
        <span className="dv block text-[11.5px] mt-[3px]">OTP पाठवला. १० मिनिटे वैध.</span>
      </InfoBox>
      <label className="block text-[12.5px] font-semibold text-navy-950 mb-[10px]">
        {t('otpLabel', lang)} <span className="dv text-[11px] font-normal text-muted">· ६-अंकी OTP</span>
      </label>
      <OtpInput id="login-otp" value={otp} onChange={setOtp} />
      {err && <ErrMsg>{err}</ErrMsg>}
      <Button variant="gold" loading={busy} onClick={verifyOTP} className="w-full justify-center py-[11px] mb-[10px]">
        ✓ {t('verifyLogin', lang)} <span className="dv text-[11px] opacity-85">पडताळणी करा</span>
      </Button>
      <div className="flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={() => { setStep(1); setOtp([]); setErr(''); }}>← Back</Button>
        <span className="text-[12px] text-muted">{t('resendIn', lang)} <span className="font-mono font-bold text-navy-950">{cd}</span>s</span>
      </div>
    </div>
  );
}

// ── Register flow ───────────────────────────────────────────────────────
function RegisterFlow({ lang }) {
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState({ nameEn: '', nameMr: '', mobile: '', role: 'division', district: 'Pune', division: '' });
  const [otp, setOtp]     = useState([]);
  const [err, setErr]     = useState('');
  const [busy, setBusy]   = useState(false);
  const [cd, startCd]     = useCountdown(60);

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function sendOTP() {
    const mob = form.mobile.replace(/\D/g, '');
    setErr('');
    if (!form.nameEn) { setErr('Name (English) required'); return; }
    if (!form.nameMr) { setErr('Name (Marathi) required'); return; }
    if (mob.length !== 10) { setErr('Valid 10-digit mobile required'); return; }
    if (!form.division) { setErr('Division/Office required'); return; }
    setBusy(true);
    const res = await api.register({ ...form, mobile: mob });
    setBusy(false);
    if (!res.success) { setErr(res.error || 'Registration failed'); return; }
    setStep(2);
    startCd();
  }

  async function verifyOTP() {
    const otpStr = otp.join('');
    setErr('');
    if (otpStr.length < 6) { setErr('Enter all 6 digits'); return; }
    setBusy(true);
    const res = await api.verifyRegOTP(form.mobile.replace(/\D/g, ''), otpStr);
    setBusy(false);
    if (!res.success) { setErr(res.error || 'Invalid OTP'); return; }
    alert(lang === 'mr'
      ? `✅ नोंदणी यशस्वी!\n${form.nameMr}\n${ROLE_LABELS[form.role]?.mr}\n\nआता Login करा.`
      : `✅ Registration Successful!\n${form.nameEn}\n${ROLE_LABELS[form.role]?.en}\n\nPlease Login now.`);
    setStep(1); setOtp([]); setErr('');
    setForm({ nameEn: '', nameMr: '', mobile: '', role: 'division', district: 'Pune', division: '' });
  }

  const fc = 'w-full border-[1.5px] border-border rounded-[5px] px-3 py-[9px] text-[13px] font-sans text-tx bg-surface outline-none focus:border-navy-800 focus:shadow-[0_0_0_3px_rgba(29,49,96,.1)] transition-all';

  if (step === 2) return (
    <div>
      <InfoBox type="success" icon="📱">
        OTP sent to ×××-×××-{form.mobile.slice(-4)}. Verify to complete.
        <span className="dv block text-[11.5px] mt-[3px]">OTP पाठवला. पडताळणी करा.</span>
      </InfoBox>
      <label className="block text-[12.5px] font-semibold text-navy-950 mb-[10px]">6-digit OTP</label>
      <OtpInput id="reg-otp" value={otp} onChange={setOtp} />
      {err && <ErrMsg>{err}</ErrMsg>}
      <Button variant="gold" loading={busy} onClick={verifyOTP} className="w-full justify-center py-[11px] mb-[10px]">
        ✓ {t('completeReg', lang)} <span className="dv text-[11px] opacity-85">नोंदणी पूर्ण करा</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={() => { setStep(1); setOtp([]); setErr(''); }}>← Back</Button>
    </div>
  );

  return (
    <div>
      <InfoBox type="info" icon="🏛️">
        New officer registration — OTP verification required
        <span className="dv block text-[11.5px] mt-[3px]">नवीन अधिकारी नोंदणी — OTP पडताळणी आवश्यक</span>
      </InfoBox>

      <div className="grid grid-cols-2 gap-[10px]">
        <Field label={t('nameEn', lang)} labelMr="नाव (इंग्रजी)">
          <input className={fc} placeholder="Er. Suresh Patil" value={form.nameEn} onChange={set('nameEn')} />
        </Field>
        <Field label={t('nameMr', lang)} labelMr="नाव (मराठी)">
          <input className={`${fc} dv`} placeholder="अभि. सुरेश पाटील" value={form.nameMr} onChange={set('nameMr')} />
        </Field>
      </div>

      <Field label={t('mobileLabel', lang)} labelMr="मोबाइल क्रमांक">
        <input className={fc} type="tel" inputMode="numeric" maxLength={10} placeholder="98765 43210"
          value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '') }))} />
      </Field>

      <div className="grid grid-cols-2 gap-[10px]">
        <Field label={t('role', lang)} labelMr="भूमिका">
          <select className={fc} value={form.role} onChange={set('role')}>
            {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.en}</option>)}
          </select>
        </Field>
        <Field label={t('district', lang)} labelMr="जिल्हा">
          <select className={fc} value={form.district} onChange={set('district')}>
            {DISTRICTS.map(d => <option key={d} value={d}>{d} / {DISTRICT_MR[d]}</option>)}
          </select>
        </Field>
      </div>

      <Field label={t('division', lang)} labelMr="विभाग / कार्यालय">
        <input className={fc} placeholder="e.g. Solapur Div., HQ Nashik" value={form.division} onChange={set('division')} />
      </Field>

      {err && <ErrMsg>{err}</ErrMsg>}
      <Button variant="primary" loading={busy} onClick={sendOTP} className="w-full justify-center py-[11px]">
        📱 {t('sendOtpVerify', lang)} <span className="dv text-[11px] opacity-80">OTP पाठवा</span>
      </Button>
    </div>
  );
}

// ── Small helpers ───────────────────────────────────────────────────────
function Field({ label, labelMr, children }) {
  return (
    <div className="mb-[13px]">
      <label className="block text-[12.5px] font-semibold text-navy-950 mb-[5px] tracking-[.1px]">
        {label}
        {labelMr && <span className="dv text-[11px] text-muted font-normal block mt-[2px]">{labelMr}</span>}
      </label>
      {children}
    </div>
  );
}

function ErrMsg({ children }) {
  return (
    <div className="bg-rd-50 border border-[#FCA5A5] rounded-[5px] px-3 py-[9px] mb-3 text-[12.5px] text-rd-800 flex items-center gap-[7px]">
      ⚠️ <span>{children}</span>
    </div>
  );
}

// ── Main Login page ─────────────────────────────────────────────────────
export default function Login() {
  const navigate  = useNavigate();
  const { login, loggedIn } = useAuthStore();
  const { lang }  = useUIStore();
  const [tab, setTab] = useState('login');

  // Already logged in → redirect
  if (loggedIn) { navigate('/dash'); return null; }

  function handleLoginSuccess(officer) {
    login(officer);
    const rl = ROLE_LABELS[officer.role] ?? { en: officer.role };
    alert(lang === 'mr'
      ? `✅ लॉगिन यशस्वी!\n${officer.nameMr}\n${rl.mr}\n${officer.district || ''}`
      : `✅ Login Successful!\n${officer.nameEn}\n${rl.en}\n${officer.district || ''}`);
    navigate('/dash');
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6 bg-gradient-to-br from-bg to-[#E8EDF8]">
      <div className="bg-surface border border-border rounded-xl shadow-lg w-full max-w-[420px] overflow-hidden">

        {/* Top banner */}
        <div className="bg-gradient-to-br from-navy-950 to-navy-800 px-6 py-6 text-center relative">
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />
          <LoginEmblem />
          <div className="text-[17px] font-bold text-white font-serif">{t('loginTitle', lang)}</div>
          <div className="dv text-[12px] text-white/60 mt-1">{t('loginSub', lang)}</div>

          {/* Tabs */}
          <div className="flex mt-4 rounded-[5px] overflow-hidden border border-white/18">
            <TabBtn active={tab === 'login'}    onClick={() => setTab('login')}>
              🔑 {tab === 'login' ? t('login', lang) : 'Login'}<span className="dv text-[10px] block opacity-80 mt-[1px]">प्रवेश</span>
            </TabBtn>
            <TabBtn active={tab === 'register'} onClick={() => setTab('register')}>
              📋 {tab === 'register' ? t('registerTitle', lang) : 'Register'}<span className="dv text-[10px] block opacity-80 mt-[1px]">नोंदणी</span>
            </TabBtn>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {tab === 'login'
            ? <LoginFlow lang={lang} onSuccess={handleLoginSuccess} />
            : <RegisterFlow lang={lang} />
          }
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 border-none px-2 py-[10px] text-[12.5px] font-semibold cursor-pointer font-sans transition-all text-center leading-[1.3]
        ${active ? 'bg-white/15 text-white shadow-[inset_0_-2px_0_#E8B84B]' : 'bg-transparent text-white/55 hover:bg-white/7 hover:text-white/85'}`}
    >
      {children}
    </button>
  );
}
