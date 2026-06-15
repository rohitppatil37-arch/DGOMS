import { useEffect } from 'react';
import { useDialogStore } from '../../store/dialogStore.js';

export default function Dialog() {
  const { open, title, message, confirmLabel, cancelLabel, variant, _confirm, _cancel } = useDialogStore();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') _cancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, _cancel]);

  if (!open) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: 'rgba(11,26,53,.55)', backdropFilter: 'blur(4px)' }}
      onClick={_cancel}
    >
      <div
        className="bg-surface w-full max-w-sm rounded-2xl overflow-hidden animate-fade-up"
        style={{ boxShadow: 'var(--shadow-login)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-[3px] ${isDanger ? 'bg-[#E74C3C]' : 'bg-gold-600'}`} />

        <div className="px-6 py-5">
          {title && (
            <div className="text-[16px] font-bold text-navy-950 font-serif mb-2">{title}</div>
          )}
          <div className="text-[14px] text-muted leading-relaxed">{message}</div>
        </div>

        <div className="px-6 pb-5 flex gap-3 justify-end">
          <button
            onClick={_confirm}
            className={`px-4 py-2 text-[13px] font-semibold rounded-lg border-none cursor-pointer transition-all font-sans
              ${isDanger
                ? 'bg-[#E74C3C] hover:bg-[#C0392B] text-white'
                : 'bg-navy-950 hover:bg-navy-900 text-white'}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={_cancel}
            className="px-4 py-2 text-[13px] font-semibold text-muted bg-surface-2 hover:bg-border-2 border border-border rounded-lg transition-all cursor-pointer font-sans"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
