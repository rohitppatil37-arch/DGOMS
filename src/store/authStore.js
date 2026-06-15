import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PERMS } from '../lib/constants.js';
import { supabase } from '../lib/supabase.js';

const INITIAL = {
  loggedIn: false,
  role: null, dept: '', name: '', nameEn: '',
  email: '', mobile: '', id: '', district: '', division: '',
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...INITIAL,

      login(officer) {
        set({
          loggedIn: true,
          role:     officer.role,
          dept:     officer.dept     || '',
          name:     officer.nameMr,
          nameEn:   officer.nameEn,
          email:    officer.email    || '',
          mobile:   officer.mobile   || '',
          id:       officer.id,
          district: officer.district || '',
          division: officer.division || '',
        });
      },

      async logout() {
        await supabase.auth.signOut();
        set(INITIAL);
      },

      can: (action) => {
        const role = get().role;
        return !!PERMS[role]?.[action];
      },

      initials() {
        return get().nameEn.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      },
    }),
    { name: 'dgoms-auth' }
  )
);
