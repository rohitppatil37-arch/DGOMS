import { useEffect } from 'react';

export default function Modal({ open, onClose, title, titleMr, children, footer }) {
  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(11,26,53,.55)] z-[300] flex items-start justify-center p-4 overflow-y-auto backdrop-blur-[3px]"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="bg-surface rounded-xl shadow-[0_16px_48px_rgba(0,0,0,.28)] w-full max-w-[680px] overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-navy-950 to-navy-800 px-5 py-4 flex items-center justify-between border-b-[3px] border-gold-600">
          <div>
            <h3 className="text-[16px] font-bold text-white font-serif">{title}</h3>
            {titleMr && <div className="dv text-[11px] text-white/60 mt-[2px]">{titleMr}</div>}
          </div>
          <button
            onClick={onClose}
            className="bg-white/15 border border-white/25 text-white w-[30px] h-[30px] rounded-full text-[16px] cursor-pointer flex items-center justify-center hover:bg-white/28 transition-all"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="bg-surface-2 border-t border-border px-5 py-[14px] flex items-center justify-between gap-[10px] flex-wrap">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
