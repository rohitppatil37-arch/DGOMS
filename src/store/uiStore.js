import { create } from 'zustand';

export const useUIStore = create((set) => ({
  lang:       'en',
  currentDam: null,
  currentDist: null,

  setLang:       (lang) => set({ lang }),
  setCurrentDam: (id)   => set({ currentDam: id }),
  setCurrentDist:(dk)   => set({ currentDist: dk }),
}));
