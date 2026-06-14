import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useUIStore }  from '../../store/uiStore.js';
import { t }          from '../../lib/i18n.js';

// Emblem SVG — same as original, extracted as component
function Emblem() {
  return (
    <svg viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg" className="w-[54px] h-[54px]">
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

  function handleLogout() {
    if (confirm(lang === 'mr' ? 'लॉगआउट करायचे आहे का?' : 'Logout?')) {
      logout();
      navigate('/');
    }
  }

  return (
    <header className="bg-navy-950 sticky top-0 z-50 shadow-[0_2px_16px_rgba(0,0,0,.25)]">
      {/* Gold stripe */}
      <div className="hdr-stripe" />

      {/* Gov bar */}
      <div className="bg-navy-900 px-4 py-[3px] flex justify-between items-center">
        <span className="text-[10.5px] text-white/45 tracking-[.6px] font-sans">
          Government of Maharashtra | महाराष्ट्र शासन — जलसंपदा विभाग
        </span>
        <span className="text-[10.5px] text-white/40 font-sans">{now}</span>
      </div>

      {/* Main bar */}
      <div className="flex items-center px-4 py-[9px] gap-[14px]">
        {/* Emblem */}
        <div className="w-[54px] h-[54px] shrink-0 hidden sm:block">
          <Emblem />
        </div>

        {/* Titles */}
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-bold text-white tracking-[.2px] truncate">
            Maharashtra Water Resources — Dam Gate Operation Management System
          </div>
          <div className="dv text-[12.5px] text-white/70 mt-1">
            महाराष्ट्र जलसंपदा विभाग — जलद्वार संचालन व्यवस्थापन प्रणाली
          </div>
          <div className="text-[10px] text-gold-400 mt-1 tracking-[.8px] uppercase font-medium">
            DGOMS v8 · OTP Login · Google Sheets Backend
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Lang toggle */}
          <button
            onClick={() => setLang('en')}
            className={`border rounded-[3px] px-[9px] py-[5px] text-xs cursor-pointer transition-all
              ${lang === 'en'
                ? 'bg-gold-600 border-gold-600 text-navy-950 font-bold'
                : 'border-white/20 text-white/65 hover:bg-white/12 hover:text-white'}`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('mr')}
            className={`border rounded-[3px] px-[9px] py-[5px] text-xs cursor-pointer transition-all
              ${lang === 'mr'
                ? 'bg-gold-600 border-gold-600 text-navy-950 font-bold'
                : 'border-white/20 text-white/65 hover:bg-white/12 hover:text-white'}`}
          >
            <span className="dv">मराठी</span>
          </button>

          {/* User area */}
          {loggedIn ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-[7px] bg-white/10 border border-white/18 rounded-full px-3 py-1">
                <div className="w-[26px] h-[26px] rounded-full bg-gold-600 flex items-center justify-center text-[12px] font-bold text-navy-950">
                  {initials()}
                </div>
                <span className="text-[12px] text-white font-medium max-w-[110px] truncate hidden sm:inline">
                  {lang === 'mr' ? name : nameEn}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-br from-[#C0392B] to-[#E74C3C] text-white border-none px-4 py-[7px] rounded-[5px] text-[12.5px] font-bold cursor-pointer shadow-[0_2px_6px_rgba(192,57,43,.35)] hover:brightness-110 transition-all"
              >
                {t('logout', lang)}
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-br from-gold-600 to-gold-400 text-navy-950 border-none px-4 py-[7px] rounded-[5px] text-[12.5px] font-bold cursor-pointer shadow-[0_2px_6px_rgba(192,144,32,.35)] hover:brightness-108 transition-all"
            >
              {t('login', lang)}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
