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

const INPUT_CLS = 'w-full border-[1.5px] border-border rounded-md px-4 py-3 text-[14px] font-sans text-tx bg-surface outline-none focus:border-navy-800 focus:shadow-[0_0_0_3px_rgba(29,49,96,.08)] transition-all';

function LoginEmblem() {
  return (
    <div className="w-20 h-20 rounded-full bg-navy-950 border-2 border-gold-600/70 flex items-center justify-center mx-auto mb-5"
      style={{ boxShadow: '0 0 0 5px rgba(192,144,32,.12), 0 8px 24px rgba(0,0,0,.4)' }}>
      <svg width="48" height="48" viewBox="0 0 54 54">
        <circle cx="27" cy="27" r="26" fill="#0B1A35" stroke="#C09020" strokeWidth="1.5" />
        <rect x="22" y="13" width="10" height="13" rx="2" fill="#C09020" />
        <rect x="18" y="26" width="18" height="4" fill="#C09020" />
        <path d="M10 33 Q18 29 27 33 Q36 37 44 31" stroke="#60A5FA" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

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
        <span className="dv block text-[12px] mt-1">नोंदणीकृत मोबाइलवर OTP</span>
      </InfoBox>
      <Field label={t('mobileLabel', lang)} labelMr="मोबाइल क्रमांक">
        <input
          className={INPUT_CLS}
          type="tel" inputMode="numeric" maxLength={10} placeholder="98765 43210"
          value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && sendOTP()}
        />
      </Field>
      {err && <ErrMsg>{err}</ErrMsg>}
      <Button variant="primary" loading={busy} onClick={sendOTP} className="w-full justify-center">
        📱 {t('sendOtp', lang)} <span className="dv text-[12px] opacity-80">OTP पाठवा</span>
      </Button>

      <div className="mt-5 rounded-lg border border-border-2 overflow-hidden">
        <div className="bg-surface-2 px-4 py-2.5 border-b border-border-2 flex items-center gap-2">
          <span className="text-[10.5px] font-bold uppercase tracking-[.8px] text-muted">⚙️ Demo Mode</span>
          <span className="text-[10.5px] text-muted/60">— No backend connected</span>
        </div>
        <div className="px-4 py-3 space-y-1.5">
          <div className="flex justify-between text-[12.5px]">
            <span className="text-muted">Any 10-digit mobile</span>
            <span className="font-mono font-semibold text-navy-950">→ OTP in alert</span>
          </div>
          <div className="flex justify-between text-[12.5px] text-muted">
            <span>Set BACKEND_URL for</span><span>real SMS delivery</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <InfoBox type="success" icon="📱">
        {t('otpSent', lang)} Sent to ×××-×××-{mobile.slice(-4)}.
        <span className="dv block text-[12px] mt-1">OTP पाठवला. १० मिनिटे वैध.</span>
      </InfoBox>
      <label className="block text-[13px] font-semibold text-navy-950 mb-3 tracking-[.1px]">
        {t('otpLabel', lang)} <span className="dv text-[12px] font-normal text-muted">· ६-अंकी OTP</span>
      </label>
      <OtpInput id="login-otp" value={otp} onChange={setOtp} />
      {err && <ErrMsg>{err}</ErrMsg>}
      <Button variant="gold" loading={busy} onClick={verifyOTP} className="w-full justify-center mb-3">
        ✓ {t('verifyLogin', lang)} <span className="dv text-[12px] opacity-85">पडताळणी करा</span>
      </Button>
      <div className="flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={() => { setStep(1); setOtp([]); setErr(''); }}>← Back</Button>
        <span className="text-[13px] text-muted">{t('resendIn', lang)} <span className="font-mono font-bold text-navy-950">{cd}</span>s</span>
      </div>
    </div>
  );
}

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

  if (step === 2) return (
    <div>
      <InfoBox type="success" icon="📱">
        OTP sent to ×××-×××-{form.mobile.slice(-4)}. Verify to complete.
        <span className="dv block text-[12px] mt-1">OTP पाठवला. पडताळणी करा.</span>
      </InfoBox>
      <label className="block text-[13px] font-semibold text-navy-950 mb-3 tracking-[.1px]">6-digit OTP</label>
      <OtpInput id="reg-otp" value={otp} onChange={setOtp} />
      {err && <ErrMsg>{err}</ErrMsg>}
      <Button variant="gold" loading={busy} onClick={verifyOTP} className="w-full justify-center mb-3">
        ✓ {t('completeReg', lang)} <span className="dv text-[12px] opacity-85">नोंदणी पूर्ण करा</span>
      </Button>
      <div className="flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={() => { setStep(1); setOtp([]); setErr(''); }}>← Back</Button>
        <span className="text-[13px] text-muted">{t('resendIn', lang)} <span className="font-mono font-bold text-navy-950">{cd}</span>s</span>
      </div>
    </div>
  );

  return (
    <div>
      <InfoBox type="info" icon="🏛️">
        New officer registration — OTP verification required
        <span className="dv block text-[12px] mt-1">नवीन अधिकारी नोंदणी — OTP पडताळणी आवश्यक</span>
      </InfoBox>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t('nameEn', lang)} labelMr="नाव (इंग्रजी)">
          <input className={INPUT_CLS} placeholder="Er. Suresh Patil" value={form.nameEn} onChange={set('nameEn')} />
        </Field>
        <Field label={t('nameMr', lang)} labelMr="नाव (मराठी)">
          <input className={`${INPUT_CLS} dv`} placeholder="अभि. सुरेश पाटील" value={form.nameMr} onChange={set('nameMr')} />
        </Field>
      </div>

      <Field label={t('mobileLabel', lang)} labelMr="मोबाइल क्रमांक">
        <input className={INPUT_CLS} type="tel" inputMode="numeric" maxLength={10} placeholder="98765 43210"
          value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '') }))} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t('role', lang)} labelMr="भूमिका">
          <select className={INPUT_CLS} value={form.role} onChange={set('role')}>
            {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.en}</option>)}
          </select>
        </Field>
        <Field label={t('district', lang)} labelMr="जिल्हा">
          <select className={INPUT_CLS} value={form.district} onChange={set('district')}>
            {DISTRICTS.map(d => <option key={d} value={d}>{d} / {DISTRICT_MR[d]}</option>)}
          </select>
        </Field>
      </div>

      <Field label={t('division', lang)} labelMr="विभाग / कार्यालय">
        <input className={INPUT_CLS} placeholder="e.g. Solapur Div., HQ Nashik" value={form.division} onChange={set('division')} />
      </Field>

      {err && <ErrMsg>{err}</ErrMsg>}
      <Button variant="primary" loading={busy} onClick={sendOTP} className="w-full justify-center">
        📱 {t('sendOtpVerify', lang)} <span className="dv text-[12px] opacity-80">OTP पाठवा</span>
      </Button>
    </div>
  );
}

function Field({ label, labelMr, children }) {
  return (
    <div className="mb-5">
      <label className="block text-[13px] font-semibold text-navy-950 mb-2 tracking-[.1px]">
        {label}
        {labelMr && <span className="dv text-[12px] text-muted font-normal block mt-px">{labelMr}</span>}
      </label>
      {children}
    </div>
  );
}

function ErrMsg({ children }) {
  return (
    <div className="bg-rd-50 border border-[#FCA5A5] rounded-md px-4 py-3 mb-4 text-[13px] text-rd-800 flex items-center gap-2">
      ⚠️ <span>{children}</span>
    </div>
  );
}

export default function Login() {
  const navigate  = useNavigate();
  const { login, loggedIn } = useAuthStore();
  const { lang }  = useUIStore();
  const [tab, setTab] = useState('login');

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
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(160deg, #E4EBF5 0%, #EEF2F9 50%, #E8EDF7 100%)' }}>

      <div className="bg-surface w-full max-w-120 rounded-2xl overflow-hidden"
        style={{ boxShadow: 'var(--shadow-login)' }}>

        {/* Top banner */}
        <div className="relative px-8 py-10 text-center overflow-hidden"
          style={{ background: 'linear-gradient(170deg, #081629 0%, #142244 55%, #1A3060 100%)' }}>

          {/* Diagonal texture */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,.025) 0px, rgba(255,255,255,.025) 1px, transparent 1px, transparent 10px)' }} />

          {/* Gold bottom accent */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent 0%, #C09020 25%, #E8B84B 50%, #C09020 75%, transparent 100%)' }} />

          <LoginEmblem />

          <div className="text-[20px] font-bold text-white font-serif tracking-[.3px] leading-tight">
            {t('loginTitle', lang)}
          </div>
          <div className="text-[10px] text-gold-400/75 tracking-[1.8px] uppercase font-medium mt-2">
            DGOMS · Maharashtra Water Resources
          </div>
          <div className="dv text-[12.5px] text-white/50 mt-1.5">{t('loginSub', lang)}</div>

          {/* Tabs */}
          <div className="flex mt-6 rounded-lg p-1 gap-0.5" style={{ background: 'rgba(0,0,0,.3)' }}>
            <TabBtn active={tab === 'login'}    onClick={() => setTab('login')}>
              🔑 {tab === 'login' ? t('login', lang) : 'Login'}<span className="dv text-[11px] block opacity-80 mt-0.5">प्रवेश</span>
            </TabBtn>
            <TabBtn active={tab === 'register'} onClick={() => setTab('register')}>
              📋 {tab === 'register' ? t('registerTitle', lang) : 'Register'}<span className="dv text-[11px] block opacity-80 mt-0.5">नोंदणी</span>
            </TabBtn>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {tab === 'login'
            ? <LoginFlow lang={lang} onSuccess={handleLoginSuccess} />
            : <RegisterFlow lang={lang} />
          }
        </div>

        {/* Security footer */}
        <div className="px-6 py-3 border-t border-border-2 bg-surface-2 text-center">
          <span className="text-[10.5px] text-muted/60 tracking-[.5px]">
            🔒 SECURED · Government of Maharashtra · Encrypted Session
          </span>
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 border-none px-2 py-3 text-[13px] font-semibold cursor-pointer font-sans transition-all text-center leading-[1.3] rounded-md
        ${active
          ? 'bg-white/15 text-white'
          : 'bg-transparent text-white/45 hover:bg-white/8 hover:text-white/75'}`}
    >
      {children}
    </button>
  );
}
