import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore.js';
import { useUIStore }  from '../store/uiStore.js';
import { t }          from '../lib/i18n.js';
import { api }        from '../api/index.js';
import { ROLE_LABELS } from '../lib/constants.js';
import Button    from '../components/ui/Button.jsx';
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

function LoginFlow({ lang, onSuccess }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [err,      setErr]      = useState('');
  const [busy,     setBusy]     = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const emailVal = email.trim().toLowerCase();
  const mr = lang === 'mr';

  async function handleLogin() {
    setErr('');
    if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setErr(mr ? 'वैध ईमेल आवश्यक' : 'Valid email required');
      return;
    }
    if (!password) {
      setErr(mr ? 'पासवर्ड आवश्यक' : 'Password is required');
      return;
    }
    setBusy(true);
    const res = await api.login(emailVal, password);
    setBusy(false);
    if (!res.success) { setErr(res.error || (mr ? 'लॉगिन अयशस्वी. पुन्हा प्रयत्न करा.' : 'Login failed. Try again.')); return; }
    onSuccess(res.officer);
  }

  async function handleReset() {
    setErr('');
    if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setErr(mr ? 'आधी ईमेल टाका' : 'Enter your email address first');
      return;
    }
    setBusy(true);
    const res = await api.resetPassword(emailVal);
    setBusy(false);
    if (!res.success) { setErr(res.error || 'Reset failed.'); return; }
    setResetSent(true);
  }

  if (resetSent) return (
    <div>
      <InfoBox type="success" icon="✉️">
        {mr ? 'पासवर्ड रिसेट लिंक पाठवली:' : 'Password reset link sent to'}{' '}
        <strong>{emailVal}</strong>
        <span className="dv block text-[12px] mt-1">ईमेल तपासा व लिंकवर क्लिक करा.</span>
      </InfoBox>
      <Button variant="ghost" size="sm" onClick={() => setResetSent(false)} className="mt-2">
        ← {mr ? 'परत' : 'Back to Login'}
      </Button>
    </div>
  );

  return (
    <div>
      <Field label="Email Address" labelMr="ईमेल पत्ता">
        <input
          className={INPUT_CLS}
          type="email" inputMode="email" placeholder="officer@water.maharashtra.gov.in"
          value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          autoComplete="email"
        />
      </Field>
      <Field label="Password" labelMr="पासवर्ड">
        <div className="relative">
          <input
            className={INPUT_CLS + ' pr-11'}
            type={showPwd ? 'text' : 'password'}
            placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            autoComplete="current-password"
          />
          <button type="button" tabIndex={-1}
            onClick={() => setShowPwd(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-tx transition-colors bg-transparent border-none cursor-pointer p-1">
            {showPwd ? '🙈' : '👁'}
          </button>
        </div>
      </Field>
      {err && <ErrMsg>{err}</ErrMsg>}
      <Button variant="primary" loading={busy} onClick={handleLogin} className="w-full justify-center">
        🔑 {mr ? 'लॉगिन करा' : 'Login'} <span className="dv text-[12px] opacity-80">लॉगिन करा</span>
      </Button>
      <div className="mt-3 text-center">
        <button type="button" onClick={handleReset} disabled={busy}
          className="text-[12.5px] text-navy-800/50 hover:text-navy-800/80 transition-colors bg-transparent border-none cursor-pointer font-sans">
          {mr ? 'पासवर्ड विसरलात?' : 'Forgot password?'}
        </button>
      </div>
    </div>
  );
}

function RegisterInfo({ lang }) {
  const mr = lang === 'mr';
  return (
    <div className="py-2">
      <InfoBox type="info" icon="🏛️">
        {mr ? 'अधिकारी नोंदणी प्रणाली व्यवस्थापकाद्वारे केली जाते.' : 'Officer accounts are created by your system administrator.'}
        <span className="dv block text-[12px] mt-1">
          {mr ? 'स्व-नोंदणी उपलब्ध नाही.' : 'Self-registration is not available.'}
        </span>
      </InfoBox>
      <div className="mt-5 rounded-xl border border-border-2 bg-surface-2 px-5 py-4 space-y-2.5">
        <p className="text-[13px] font-semibold text-navy-950">
          {mr ? 'प्रवेश कसा मिळवाल?' : 'How to get access?'}
        </p>
        <ol className="text-[12.5px] text-muted space-y-1.5 pl-4 list-decimal">
          <li>{mr ? 'आपल्या विभागीय सुपर प्रशासकाशी संपर्क साधा.' : 'Contact your divisional Super Admin.'}</li>
          <li>{mr ? 'ते तुमचे ईमेल व भूमिका नोंदवतील.' : 'They will register your email and role.'}</li>
          <li>{mr ? 'नोंदणीनंतर Login टॅबवर ईमेल OTP वापरा.' : 'Once registered, use the Login tab with your email OTP.'}</li>
        </ol>
      </div>
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
      email: `dev.${e.role}.${e.dept}@demo.dgoms`, mobile: '',
      district: 'Pune', division: 'Dev HQ',
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
            <RegisterInfo lang={lang} />
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
