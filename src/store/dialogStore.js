import { create } from 'zustand';

let _resolve = null;

export const useDialogStore = create((set) => ({
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'default',

  openDialog: (config) => new Promise((resolve) => {
    _resolve = resolve;
    set({ open: true, confirmLabel: 'Confirm', cancelLabel: 'Cancel', variant: 'default', ...config });
  }),

  _confirm: () => {
    set({ open: false });
    _resolve?.(true);
    _resolve = null;
  },

  _cancel: () => {
    set({ open: false });
    _resolve?.(false);
    _resolve = null;
  },
}));
