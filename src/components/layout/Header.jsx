import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useUIStore }  from '../../store/uiStore.js';
import { useDialogStore } from '../../store/dialogStore.js';
import { t }          from '../../lib/i18n.js';

function Emblem() {
  return (
    <svg viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg" className="w-11 h-11">
      <circle cx="27" cy="27" r="26" fill="#0B1A35" stroke="#C09020" strokeWidth="1.5" />
      <circle cx="27" cy="27" r="20" fill="none" stroke="rgba(192,144,32,.35)" strokeWidth="1" />
      <rect x="22" y="13" width="10" height="13" rx="2" fill="#C09020" />
      <rect x="18" y="26" width="18" height="4" fill="#C09020" />
      <rect x="10" y="30" width="34" height="12" fill="#142244" opacity=".9" />
      <path d="M10 33 Q18 29 27 33 Q36 37 44 31" stroke="#60A5FA" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <animate attributeName="d" dur="4s" repeatCount="indefinite"
          values="M10 33 Q18 29 27 33 Q36 37 44 31;M10 35 Q18 31 27 35 Q36 39 44 33;M10 33 Q18 29 27 33 Q36 37 44 31" />
      </path>
      <circle cx="27" cy="8" r="2.5" fill="#E8B84B" />
      <line x1="27" y1="5" x2="27" y2="2" stroke="#E8B84B" strokeWidth="1.5" />
    </svg>
  );
}

export default function Header() {
  const navigate  = useNavigate();
  const { loggedIn, nameEn, name, logout, initials } = useAuthStore();
  const { lang, setLang } = useUIStore();
  const now = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const { openDialog } = useDialogStore();

  async function handleLogout() {
    const confirmed = await openDialog({
      title: lang === 'mr' ? 'लॉगआउट' : 'Logout',
      message: lang === 'mr' ? 'लॉगआउट करायचे आहे का?' : 'Are you sure you want to logout?',
      confirmLabel: lang === 'mr' ? 'लॉगआउट करा' : 'Logout',
      cancelLabel: lang === 'mr' ? 'रद्द करा' : 'Cancel',
      variant: 'danger',
    });
    if (confirmed) { logout(); navigate('/'); }
  }

  return (
    <header className="bg-navy-950 sticky top-0 z-50" style={{ boxShadow: '0 2px 24px rgba(0,0,0,.32)' }}>
      {/* Gold accent stripe */}
      <div className="hdr-stripe" />

      {/* Gov identification bar */}
      <div className="px-6 py-1 flex justify-between items-center border-b border-white/6"
        style={{ background: 'rgba(20,34,68,.7)' }}>
        <span className="text-[10.5px] text-white/35 tracking-[.8px] font-sans">
          Government of Maharashtra &nbsp;·&nbsp; महाराष्ट्र शासन &nbsp;·&nbsp; जलसंपदा विभाग
        </span>
        <span className="text-[10.5px] text-white/30 font-mono">{now}</span>
      </div>

      {/* Main brand bar */}
      <div className="flex items-center px-6 py-2 gap-5">

        {/* Emblem */}
        <div className="shrink-0">
          <Emblem />
        </div>

        {/* Vertical separator */}
        <div className="w-px h-9 bg-white/[.09] shrink-0 hidden sm:block" />

        {/* Title block */}
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold text-white font-serif leading-tight tracking-[.15px] truncate">
            Maharashtra Water Resources — Dam Gate Operation Management System
          </div>
          <div className="flex items-center gap-3 mt-[5px]">
            <div className="dv text-[12px] text-gold-400/55 leading-none">
              महाराष्ट्र जलसंपदा विभाग — जलद्वार संचालन व्यवस्थापन प्रणाली
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="w-[6px] h-[6px] rounded-full bg-[#4ADE80] animate-pulse-dot shrink-0" />
              <span className="text-[9.5px] text-white/35 tracking-[1px] uppercase font-medium">DGOMS v8 · Live</span>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Language toggle */}
          <div className="flex bg-white/[.06] rounded-lg border border-white/[.09] p-[3px] gap-[2px]">
            {['en', 'mr'].map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3.5 py-[6px] rounded-md border-none cursor-pointer transition-all text-[11.5px] font-semibold tracking-[.3px] leading-none
                  ${lang === l
                    ? 'bg-gold-600 text-navy-950'
                    : 'bg-transparent text-white/40 hover:text-white/75 hover:bg-white/5'}`}
              >
                {l === 'en' ? 'EN' : <span className="dv">मराठी</span>}
              </button>
            ))}
          </div>

          {/* User area */}
          {loggedIn ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 bg-white/[.07] border border-white/[.12] rounded-full pl-[3px] pr-3.5 py-[3px]">
                <div className="w-[28px] h-[28px] rounded-full bg-gold-600 flex items-center justify-center text-[12px] font-bold text-navy-950 shrink-0">
                  {initials()}
                </div>
                <span className="text-[12.5px] text-white/90 font-medium max-w-[108px] truncate hidden sm:inline leading-none">
                  {lang === 'mr' ? name : nameEn}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-linear-to-br from-[#C0392B] to-[#E74C3C] text-white border-none px-4 py-[7px] rounded-lg text-[12px] font-bold cursor-pointer transition-all hover:brightness-110 active:scale-95"
                style={{ boxShadow: '0 2px 8px rgba(192,57,43,.4)' }}
              >
                {t('logout', lang)}
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bg-linear-to-br from-gold-600 to-gold-400 text-navy-950 border-none px-5 py-[7px] rounded-lg text-[12.5px] font-bold cursor-pointer transition-all hover:brightness-108 active:scale-95"
              style={{ boxShadow: '0 2px 10px rgba(192,144,32,.45)' }}
            >
              {t('login', lang)}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
