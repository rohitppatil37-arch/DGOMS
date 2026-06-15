import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore.js';
import { useUIStore }  from '../store/uiStore.js';
import { t }          from '../lib/i18n.js';
import { api }        from '../api/index.js';
import { ROLE_LABELS, DISTRICTS, DISTRICT_MR } from '../lib/constants.js';
import Button    from '../components/ui/Button.jsx';
import OtpInput  from '../components/ui/OtpInput.jsx';
import InfoBox   from '../components/ui/InfoBox.jsx';

const INPUT_CLS = 'w-full border-[1.5px] border-border rounded-lg px-4 py-3 text-[14px] font-sans text-tx bg-surface outline-none focus:border-navy-800 focus:shadow-[0_0_0_3px_rgba(29,49,96,.08)] transition-all';

function LoginEmblem() {
  return (
    <div className="w-15 h-15 rounded-full bg-navy-950 border-2 border-gold-600/60 flex items-center justify-center mx-auto mb-4"
      style={{ boxShadow: '0 0 0 5px rgba(192,144,32,.1), 0 8px 24px rgba(0,0,0,.4)' }}>
      <svg width="36" height="36" viewBox="0 0 54 54">
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
      <Button variant="gold" loading={busy} onClick={verifyOTP} className="w-full justify-center mb-4">
        ✓ {t('verifyLogin', lang)} <span className="dv text-[12px] opacity-85">पडताळणी करा</span>
      </Button>
      <div className="flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={() => { setStep(1); setOtp([]); setErr(''); }}>← Back</Button>
        {cd > 0
          ? <span className="text-[13px] text-muted">{t('resendIn', lang)} <span className="font-mono font-bold text-navy-950">{cd}</span>s</span>
          : <Button variant="ghost" size="sm" loading={busy} onClick={async () => { setOtp([]); await sendOTP(); }}>↺ Resend OTP</Button>
        }
      </div>
    </div>
  );
}

function RegisterFlow({ lang, onSuccess }) {
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
    toast.success(lang === 'mr' ? 'नोंदणी यशस्वी!' : 'Registration Successful!', {
      description: lang === 'mr'
        ? `${form.nameMr} · ${ROLE_LABELS[form.role]?.mr} · आता Login करा.`
        : `${form.nameEn} · ${ROLE_LABELS[form.role]?.en} · Please Login now.`,
    });
    setStep(1); setOtp([]); setErr('');
    setForm({ nameEn: '', nameMr: '', mobile: '', role: 'division', district: 'Pune', division: '' });
    onSuccess?.();
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
      <Button variant="gold" loading={busy} onClick={verifyOTP} className="w-full justify-center mb-4">
        ✓ {t('completeReg', lang)} <span className="dv text-[12px] opacity-85">नोंदणी पूर्ण करा</span>
      </Button>
      <div className="flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={() => { setStep(1); setOtp([]); setErr(''); }}>← Back</Button>
        {cd > 0
          ? <span className="text-[13px] text-muted">{t('resendIn', lang)} <span className="font-mono font-bold text-navy-950">{cd}</span>s</span>
          : <Button variant="ghost" size="sm" loading={busy} onClick={async () => { setOtp([]); await sendOTP(); }}>↺ Resend OTP</Button>
        }
      </div>
    </div>
  );

  return (
    <div onKeyDown={e => e.key === 'Enter' && !busy && sendOTP()}>
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
    <div className="bg-rd-50 border border-[#FCA5A5] rounded-lg px-4 py-3 mb-4 text-[13px] text-rd-800 flex items-center gap-2.5">
      ⚠️ <span>{children}</span>
    </div>
  );
}

function DevPanel({ onSuccess }) {
  const groups = [
    {
      label: 'Super Admin',
      entries: [{ role: 'superadmin', dept: 'civil', label: 'Super Admin' }],
    },
    {
      label: 'Civil',
      entries: [
        { role: 'division',    dept: 'civil', label: 'Division' },
        { role: 'subdivision', dept: 'civil', label: 'Sub-Division' },
        { role: 'field',       dept: 'civil', label: 'Field' },
      ],
    },
    {
      label: 'Mechanical',
      entries: [
        { role: 'division',    dept: 'mechanical', label: 'Division' },
        { role: 'subdivision', dept: 'mechanical', label: 'Sub-Division' },
      ],
    },
    {
      label: 'Electrical',
      entries: [
        { role: 'division',    dept: 'electrical', label: 'Division' },
        { role: 'subdivision', dept: 'electrical', label: 'Sub-Division' },
      ],
    },
  ];

  function loginAs(e) {
    onSuccess({
      id: `dev-${e.role}-${e.dept}`, role: e.role, dept: e.dept,
      nameEn: `Dev ${e.dept.charAt(0).toUpperCase() + e.dept.slice(1)} ${e.label}`,
      nameMr: `देव ${e.label}`,
      mobile: '0000000000', district: 'Pune', division: 'Dev HQ',
    });
  }

  return (
    <div className="mt-4 w-full max-w-120 rounded-xl border border-amber-300/60 overflow-hidden">
      <div className="px-4 py-2 bg-amber-50 border-b border-amber-300/60 flex items-center gap-2">
        <span className="text-[10.5px] font-bold uppercase tracking-[.8px] text-amber-700">⚙ Dev Mode</span>
        <span className="text-[10.5px] text-amber-600/60">· bypasses OTP · dev builds only</span>
      </div>
      <div className="px-4 py-3 bg-white/70 flex flex-col gap-2">
        {groups.map(g => (
          <div key={g.label} className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-[.6px] text-amber-600/70 w-16 shrink-0">{g.label}</span>
            {g.entries.map(e => (
              <button key={`${e.role}-${e.dept}`} onClick={() => loginAs(e)}
                className="text-[12px] font-semibold bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 rounded-lg px-3 py-1.5 cursor-pointer transition-all font-sans">
                {e.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 border-none px-3 py-3 text-[13px] font-semibold cursor-pointer font-sans transition-all text-center leading-[1.3] rounded-lg
        ${active
          ? 'bg-white/18 text-white shadow-[0_1px_3px_rgba(0,0,0,.2)]'
          : 'bg-transparent text-white/40 hover:bg-white/8 hover:text-white/70'}`}
    >
      {children}
    </button>
  );
}

export default function Login() {
  const navigate  = useNavigate();
  const { login, loggedIn } = useAuthStore();
  const { lang }  = useUIStore();
  const [tab, setTab] = useState('login');

  if (loggedIn) return <Navigate to="/dash" replace />;

  function handleLoginSuccess(officer) {
    login(officer);
    const rl = ROLE_LABELS[officer.role] ?? { en: officer.role };
    toast.success(lang === 'mr' ? 'लॉगिन यशस्वी!' : 'Login Successful!', {
      description: lang === 'mr'
        ? `${officer.nameMr} · ${rl.mr}${officer.district ? ' · ' + officer.district : ''}`
        : `${officer.nameEn} · ${rl.en}${officer.district ? ' · ' + officer.district : ''}`,
    });
    navigate('/dash');
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-6"
      style={{ background: 'linear-gradient(155deg, #E2EAF5 0%, #ECF1FA 50%, #E6EDF7 100%)' }}>

      <div className="bg-surface w-full max-w-120 rounded-2xl overflow-hidden animate-fade-up"
        style={{ boxShadow: 'var(--shadow-login)' }}>

        {/* Card header / banner */}
        <div className="relative px-9 py-7 text-center overflow-hidden"
          style={{ background: 'linear-gradient(170deg, #081629 0%, #142244 55%, #1A3060 100%)' }}>

          {/* Subtle diagonal texture */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,.02) 0px, rgba(255,255,255,.02) 1px, transparent 1px, transparent 10px)' }} />

          {/* Gold bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent 0%, #C09020 25%, #E8B84B 50%, #C09020 75%, transparent 100%)' }} />

          <LoginEmblem />

          <div className="text-[21px] font-bold text-white font-serif tracking-[.2px] leading-tight">
            {t('loginTitle', lang)}
          </div>
          <div className="text-[10px] text-gold-400/65 tracking-[2px] uppercase font-medium mt-2.5">
            DGOMS · Maharashtra Water Resources
          </div>
          <div className="dv text-[12.5px] text-white/45 mt-2">{t('loginSub', lang)}</div>

          {/* Tabs */}
          <div className="flex mt-7 rounded-xl p-1 gap-1" style={{ background: 'rgba(0,0,0,.28)' }}>
            <TabBtn active={tab === 'login'}    onClick={() => setTab('login')}>
              🔑 {t('login', lang)}
            </TabBtn>
            <TabBtn active={tab === 'register'} onClick={() => setTab('register')}>
              📋 {t('registerTitle', lang)}
            </TabBtn>
          </div>
        </div>

        {/* Form body */}
        <div className="px-9 py-6">
          <div className={tab !== 'login' ? 'hidden' : ''}>
            <LoginFlow lang={lang} onSuccess={handleLoginSuccess} />
          </div>
          <div className={tab !== 'register' ? 'hidden' : ''}>
            <RegisterFlow lang={lang} onSuccess={() => setTab('login')} />
          </div>
        </div>

        {/* Security footer */}
        <div className="px-8 py-3.5 border-t border-border-2 bg-surface-2 text-center">
          <span className="text-[10.5px] text-muted/50 tracking-[.6px]">
            🔒 SECURED · Government of Maharashtra · Encrypted Session
          </span>
        </div>
      </div>

      {/* Back to home */}
      <button onClick={() => navigate('/')}
        className="mt-5 text-[12.5px] text-navy-800/40 hover:text-navy-800/75 transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none font-sans">
        ← Back to Home
      </button>

      {/* Dev quick-login — import.meta.env.DEV is false in production builds, so this is tree-shaken out */}
      {import.meta.env.DEV && <DevPanel onSuccess={handleLoginSuccess} />}
    </div>
  );
}
