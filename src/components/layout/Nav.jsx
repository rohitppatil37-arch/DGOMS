import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useUIStore }  from '../../store/uiStore.js';
import { t }          from '../../lib/i18n.js';

const NAV_ITEMS = [
  { to: '/',       icon: '🏠', key: 'home',      mrKey: 'homeMr',      locked: false },
  { to: '/pub',    icon: '🏛️', key: 'damInfo',   mrKey: 'damInfoMr',   locked: false },
  { to: '/dash',   icon: '📊', key: 'dashboard', mrKey: 'dashboardMr', locked: true  },
  { to: '/cmd',    icon: '📋', key: 'commands',  mrKey: 'commandsMr',  locked: true  },
  { to: '/exec',   icon: '⚙️', key: 'execution', mrKey: 'executionMr', locked: true  },
  { to: '/log',    icon: '📖', key: 'logbook',   mrKey: 'logbookMr',   locked: true  },
  { to: '/notif',  icon: '🔔', key: 'alerts',    mrKey: 'alertsMr',    locked: true  },
  { to: '/admin',  icon: '⚙️', key: 'admin',     mrKey: 'adminMr',     locked: true, adminOnly: true },
];

export default function Nav() {
  const navigate  = useNavigate();
  const { loggedIn, role } = useAuthStore();
  const { lang }  = useUIStore();

  function handleLockedClick(item) {
    if (!loggedIn) {
      if (confirm(lang === 'mr'
        ? '🔒 हे पान फक्त लॉगिन केलेल्या अधिकाऱ्यांसाठी आहे.\n\nLogin करायचे आहे का?'
        : '🔒 This page requires login.\n\nGo to Login?')) {
        navigate('/login');
      }
    } else if (item.adminOnly && role !== 'superadmin') {
      alert(lang === 'mr' ? '⛔ फक्त Super Admin ला Admin Panel उपलब्ध आहे.' : '⛔ Admin Panel is Super Admin only.');
    }
  }

  return (
    <nav className="bg-navy-900 flex overflow-x-auto scrollbar-none border-b border-white/7">
      {NAV_ITEMS.map((item) => {
        const isLocked = item.locked && (!loggedIn || (item.adminOnly && role !== 'superadmin'));
        const label    = t(item.key, lang);
        const mrLabel  = t(item.mrKey, lang === 'en' ? 'en' : 'mr');

        if (isLocked) {
          return (
            <button
              key={item.to}
              onClick={() => handleLockedClick(item)}
              className="relative bg-none border-none text-white/40 px-[13px] h-[44px] text-[12px] cursor-not-allowed whitespace-nowrap flex items-center gap-[6px] font-sans border-b-2 border-transparent"
            >
              <span className="text-[14px] opacity-80">{item.icon}</span>
              <span>{label}</span>
              <span className="dv text-[10px] opacity-65 leading-none">{mrLabel}</span>
              <span className="absolute top-[5px] right-1 text-[8px]">🔒</span>
            </button>
          );
        }

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `bg-none border-none px-[13px] h-[44px] text-[12px] cursor-pointer whitespace-nowrap flex items-center gap-[6px] font-sans transition-all border-b-2 no-underline
              ${isActive
                ? 'text-white border-gold-600 font-semibold'
                : 'text-white/55 border-transparent hover:text-white/85 hover:bg-white/5'}`
            }
          >
            <span className="text-[14px] opacity-80">{item.icon}</span>
            <span>{label}</span>
            <span className="dv text-[10px] opacity-65 leading-none">{mrLabel}</span>
          </NavLink>
        );
      })}

      {/* Login button — right-aligned, hidden after login */}
      {!loggedIn && (
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `ml-auto bg-gradient-to-br from-gold-600 to-gold-400 text-navy-950 font-bold border-none px-[13px] h-[44px] text-[12px] cursor-pointer whitespace-nowrap flex items-center gap-[6px] no-underline
            ${isActive ? 'brightness-110' : 'hover:brightness-105'}`
          }
        >
          <span className="text-[14px]">🔑</span>
          <span>{t('login', lang)}</span>
          <span className="dv text-[10px] opacity-80 leading-none">{t('loginMr', lang === 'en' ? 'en' : 'mr')}</span>
        </NavLink>
      )}
    </nav>
  );
}
