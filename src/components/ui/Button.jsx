const VARIANTS = {
  primary: 'bg-gradient-to-br from-navy-950 to-navy-800 text-white shadow-[0_2px_6px_rgba(11,26,53,.25)] hover:shadow-[0_4px_12px_rgba(11,26,53,.35)] hover:brightness-110',
  success: 'bg-gradient-to-br from-[#0F5132] to-[#166534] text-white shadow-[0_2px_6px_rgba(15,81,50,.25)] hover:shadow-[0_4px_12px_rgba(15,81,50,.4)]',
  danger:  'bg-gradient-to-br from-rd-800 to-[#B91C1C] text-white shadow-[0_2px_6px_rgba(122,28,28,.25)] hover:brightness-110',
  gold:    'bg-gradient-to-br from-gold-600 to-gold-400 text-navy-950 font-bold shadow-[0_2px_6px_rgba(192,144,32,.3)] hover:shadow-[0_4px_10px_rgba(192,144,32,.45)]',
  ghost:   'bg-transparent border-[1.5px] border-border text-tx hover:border-navy-800 hover:bg-surface-2',
};

const SIZES = {
  default: 'px-5 py-3 text-sm rounded-md',
  sm:      'px-4 py-2 text-xs rounded-md',
  xs:      'px-3 py-1.5 text-xs rounded',
};

export default function Button({
  variant = 'primary',
  size = 'default',
  className = '',
  disabled = false,
  loading = false,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-[6px] border-none font-sans font-semibold cursor-pointer transition-all
        whitespace-nowrap tracking-[.2px] select-none
        active:scale-[.97]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${className}
      `}
      {...props}
    >
      {loading && <span className="animate-spin-r text-[12px]">⏳</span>}
      {children}
    </button>
  );
}
