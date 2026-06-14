const VARIANTS = {
  info:    'bg-bl-50 border-[#BFDBFE] [&_.text]:text-[#1E40AF]',
  warn:    'bg-am-50 border-[#FDE68A] [&_.text]:text-am-800',
  success: 'bg-gr-50 border-[#86EFAC] [&_.text]:text-gr-700',
  danger:  'bg-rd-50 border-[#FCA5A5] [&_.text]:text-rd-800',
};

export default function InfoBox({ type = 'info', icon, children, className = '' }) {
  const icons = { info: 'ℹ️', warn: '⚠️', success: '✅', danger: '🚨' };
  return (
    <div className={`border rounded-md p-[14px_18px] mb-5 flex gap-3 items-start ${VARIANTS[type]} ${className}`}>
      <span className="text-base shrink-0 mt-px">{icon ?? icons[type]}</span>
      <div className="text text-[13px] leading-[1.6]">{children}</div>
    </div>
  );
}
