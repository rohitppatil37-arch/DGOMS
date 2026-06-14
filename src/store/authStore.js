import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PERMS } from '../lib/constants.js';

const INITIAL = { loggedIn: false, role: null, name: '', nameEn: '', mobile: '', id: '', district: '', division: '' };

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...INITIAL,

      login(officer) {
        set({
          loggedIn: true,
          role:     officer.role,
          name:     officer.nameMr,
          nameEn:   officer.nameEn,
          mobile:   officer.mobile,
          id:       officer.id,
          district: officer.district || '',
          division: officer.division || '',
        });
      },

      logout() {
        set(INITIAL);
      },

      // Permission helpers
      can: (action) => {
        const role = get().role;
        return !!PERMS[role]?.[action];
      },

      initials() {
        return get().nameEn.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      },
    }),
    { name: 'dgoms-auth' }   // persisted to localStorage
  )
);
