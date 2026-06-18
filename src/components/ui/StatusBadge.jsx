const STATUS_BADGE = {
  pending:  'bg-[#FEF3C7] text-[#7A4800] border-[#FDE68A]',
  accepted: 'bg-[#EBF0FF] text-[#1E3FA8] border-[#BFDBFE]',
  executed: 'bg-[#D1FAE5] text-[#0F5132] border-[#86EFAC]',
};
const STATUS_LABEL = {
  pending:  { en: 'Pending',  mr: 'प्रलंबित' },
  accepted: { en: 'Accepted', mr: 'स्वीकृत' },
  executed: { en: 'Executed', mr: 'अंमलात' },
};

export default function StatusBadge({ status }) {
  const cls = STATUS_BADGE[status] || STATUS_BADGE.pending;
  const lbl = STATUS_LABEL[status] || { en: status, mr: status };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${cls}`}>
      {lbl.en}
    </span>
  );
}
