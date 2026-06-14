const VARIANTS = {
  info:    'bg-bl-50 border-[#BFDBFE] [&_.text]:text-[#1E40AF]',
  warn:    'bg-am-50 border-[#FDE68A] [&_.text]:text-am-800',
  success: 'bg-gr-50 border-[#86EFAC] [&_.text]:text-gr-700',
  danger:  'bg-rd-50 border-[#FCA5A5] [&_.text]:text-rd-800',
};

export default function InfoBox({ type = 'info', icon, children, className = '' }) {
  const icons = { info: 'ℹ️', warn: '⚠️', success: '✅', danger: '🚨' };
  return (
    <div className={`border rounded-[5px] p-[10px_13px] mb-[13px] flex gap-[9px] items-start ${VARIANTS[type]} ${className}`}>
      <span className="text-[15px] shrink-0 mt-[1px]">{icon ?? icons[type]}</span>
      <div className="text text-[12.5px] leading-[1.55]">{children}</div>
    </div>
  );
}
