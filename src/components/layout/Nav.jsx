import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore.js';
import { useUIStore }  from '../../store/uiStore.js';
import { useDialogStore } from '../../store/dialogStore.js';
import { canSeeNav }  from '../../lib/access.js';
import { t }          from '../../lib/i18n.js';

function Icon({ d, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

const LOCK = ['M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z', 'M17 11V7a5 5 0 00-10 0v4'];

const NAV_ITEMS = [
  {
    to: '/', key: 'home',
    icon: ['M3 12L12 3L21 12', 'M5 12v9h4v-5h6v5h4v-9'],
  },
  {
    to: '/pub', key: 'damInfo',
    icon: ['M3 21h18', 'M5 21V8l7-5 7 5v13', 'M9 21v-5h6v5', 'M9 10h2M13 10h2'],
  },
  {
    to: '/dash', key: 'dashboard',
    icon: ['M3 3v18h18', 'M7 16v-4', 'M11 16V8', 'M15 16v-6', 'M19 16V4'],
  },
  {
    to: '/cmd', key: 'commands',
    icon: [
      'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2',
      'M9 5c0-.552.448-1 1-1h4c.552 0 1 .448 1 1v1c0 .552-.448 1-1 1h-4c-.552 0-1-.448-1-1V5z',
      'M9 12h6', 'M9 16h4',
    ],
  },
  {
    to: '/exec', key: 'execution',
    icon: [
      'M12 15a3 3 0 100-6 3 3 0 000 6z',
      'M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21',
      'M5.636 5.636l1.06 1.06M17.304 17.304l1.06 1.06',
      'M5.636 18.364l1.06-1.06M17.304 6.696l1.06-1.06',
    ],
  },
  {
    to: '/log', key: 'logbook',
    icon: ['M4 19.5A2.5 2.5 0 016.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z'],
  },
  {
    to: '/notif', key: 'alerts',
    icon: ['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 01-3.46 0'],
  },
  {
    to: '/admin', key: 'admin',
    icon: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  },
];

export default function Nav() {
  const navigate  = useNavigate();
  const { loggedIn, role, dept } = useAuthStore();
  const { lang }  = useUIStore();
  const { openDialog } = useDialogStore();

  async function handleLoginRequired() {
    const confirmed = await openDialog({
      title:        lang === 'mr' ? 'लॉगिन आवश्यक' : 'Login Required',
      message:      lang === 'mr'
        ? 'हे पान फक्त लॉगिन केलेल्या अधिकाऱ्यांसाठी आहे. Login करायचे आहे का?'
        : 'This page requires login. Go to Login?',
      confirmLabel: lang === 'mr' ? 'Login करा' : 'Go to Login',
      cancelLabel:  lang === 'mr' ? 'रद्द करा'  : 'Cancel',
    });
    if (confirmed) navigate('/login');
  }

  return (
    <nav className="bg-navy-900 flex overflow-x-auto scrollbar-none border-b border-white/[.07]">
      {NAV_ITEMS.map((item) => {
        const label     = t(item.key, lang);
        const visible   = canSeeNav(item.key, { loggedIn, role, dept });
        const isPublic  = item.key === 'home' || item.key === 'damInfo';

        // Logged in but role doesn't permit → hide entirely
        if (loggedIn && !visible) return null;

        // Not logged in and not a public item → show as locked
        if (!loggedIn && !isPublic) {
          return (
            <button
              key={item.to}
              onClick={handleLoginRequired}
              title={lang === 'mr' ? 'लॉगिन आवश्यक' : 'Login required'}
              className="relative border-none text-white/28 px-5 h-13 text-[13px] cursor-not-allowed whitespace-nowrap inline-flex items-center gap-2 font-sans font-medium border-b-2 border-transparent transition-colors hover:text-white/40 hover:bg-white/2 bg-transparent"
            >
              <Icon d={item.icon} size={15} />
              <span>{label}</span>
              <span className="absolute top-1.75 right-1.5 opacity-50">
                <Icon d={LOCK} size={8} />
              </span>
            </button>
          );
        }

        // Public item or role-permitted item → normal NavLink
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `border-none px-5 h-13 text-[13px] cursor-pointer whitespace-nowrap inline-flex items-center gap-2 font-sans font-medium transition-all border-b-2 no-underline
              ${isActive
                ? 'text-white border-gold-600 bg-white/5'
                : 'text-white/48 border-transparent hover:text-white/82 hover:bg-white/4 hover:border-white/15'}`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-gold-400' : ''}>
                  <Icon d={item.icon} size={15} />
                </span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
