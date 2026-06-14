import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

import { useAuthStore } from './store/authStore.js';
import { useUIStore }   from './store/uiStore.js';
import { api }          from './api/index.js';

import Header      from './components/layout/Header.jsx';
import Nav         from './components/layout/Nav.jsx';
import Ticker      from './components/layout/Ticker.jsx';

import Home        from './pages/Home.jsx';
import Login       from './pages/Login.jsx';
import Placeholder from './pages/Placeholder.jsx';

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:                   30_000,
      refetchInterval:             30_000,
      refetchIntervalInBackground: false,
      retry:                       1,
    },
  },
});

// ── Auth guard ──────────────────────────────────────────────────────────
function RequireAuth({ children, adminOnly = false }) {
  const { loggedIn, role } = useAuthStore();
  if (!loggedIn)                        return <Navigate to="/login" replace />;
  if (adminOnly && role !== 'superadmin') return <Navigate to="/" replace />;
  return children;
}

// ── Root layout (header + ticker always visible) ────────────────────────
function AppLayout() {
  const { currentDam } = useUIStore();
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  const { data: damsData } = useQuery({
    queryKey: ['dams'],
    queryFn:  () => api.getDams(),
    select:   res => res.dams ?? [],
  });

  // Build lookup keyed by dam id
  const damLookup = {};
  (damsData ?? []).forEach(d => {
    damLookup[d.id] = {
      gates: parseInt(d.gates) || 0,
      frl:   d.frl,
      mwl:   d.mwl,
      live:  { wl: d.waterLevel, st: d.storage, rn: d.rainfall, avg: d.avgRainfall },
      en: { name: d.nameEn, river: d.riverEn, dist: d.district, cap: d.capacity + ' MCM', gtype: d.gtypeEn, catch: d.catchment, cDiv: d.civilDiv, cSub: d.civilSub, mDiv: d.mechDiv, mSub: d.mechSub },
      mr: { name: d.nameMr, river: d.riverMr, dist: d.district, cap: d.capacity + ' दलघमी', gtype: d.gtypeMr || d.gtypeEn, catch: d.catchment, cDiv: d.civilDiv, cSub: d.civilSub, mDiv: d.mechDiv, mSub: d.mechSub },
      offs: (d.contacts ?? []).filter(c => c.name).map(c => ({ n: c.name, en: c.desig, mr: c.desig, mob: c.mobile })),
      _raw: d,
    };
  });

  const activeDam = currentDam ? damLookup[currentDam] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {!isLogin && <Nav />}
      {!isLogin && <Ticker damData={activeDam} />}
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/"      element={<Home damLookup={damLookup} dams={damsData ?? []} />} />
          <Route path="/pub"   element={<Placeholder title="Dam Info" />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dash"  element={<RequireAuth><Placeholder title="Dashboard" /></RequireAuth>} />
          <Route path="/cmd"   element={<RequireAuth><Placeholder title="Commands" /></RequireAuth>} />
          <Route path="/exec"  element={<RequireAuth><Placeholder title="Execution" /></RequireAuth>} />
          <Route path="/log"   element={<RequireAuth><Placeholder title="Logbook" /></RequireAuth>} />
          <Route path="/notif" element={<RequireAuth><Placeholder title="Alerts" /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth adminOnly><Placeholder title="Admin" /></RequireAuth>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
