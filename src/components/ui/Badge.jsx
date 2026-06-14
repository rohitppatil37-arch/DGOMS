const BADGE_MAP = {
  pending:   'bg-am-50 text-am-800 before:bg-am-800',
  accepted:  'bg-bl-50 text-bl-800 before:bg-bl-800',
  executed:  'bg-gr-50 text-gr-700 before:bg-gr-700',
  emergency: 'bg-rd-50 text-rd-800 before:bg-rd-800',
  online:    'bg-gr-50 text-gr-700 before:bg-gr-700',
  active:    'bg-gr-50 text-gr-700 before:bg-gr-700',
  offline:   'bg-[#F1F5F9] text-muted before:bg-xs',
  inactive:  'bg-[#F1F5F9] text-muted before:bg-xs',
};

const STATUS_LABELS = {
  en: { pending: 'Pending', accepted: 'Accepted', executed: 'Executed', emergency: 'Emergency', online: 'Active', active: 'Active', offline: 'Inactive', inactive: 'Inactive' },
  mr: { pending: 'प्रलंबित', accepted: 'स्वीकृत', executed: 'अंमलात', emergency: 'आणीबाणी', online: 'सक्रिय', active: 'सक्रिय', offline: 'निष्क्रिय', inactive: 'निष्क्रिय' },
};

export default function Badge({ status, lang = 'en', children }) {
  const cls = BADGE_MAP[status] ?? BADGE_MAP.pending;
  const label = children ?? STATUS_LABELS[lang]?.[status] ?? status;
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-[9px] py-[3px] rounded-full text-[11px] font-semibold tracking-[.2px]
        before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:shrink-0
        ${cls}
      `}
    >
      {label}
    </span>
  );
}
