export function Card({ className = '', children }) {
  return (
    <div className={`bg-surface border border-border rounded-lg shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function CardHeader({ label, labelMr, actions }) {
  return (
    <div className="text-[11px] font-bold text-xs uppercase tracking-[.8px] mb-3 flex items-center gap-[6px]">
      <span className="text-xs">{label}</span>
      {labelMr && <span className="dv text-[10px] normal-case tracking-normal font-normal text-muted">{labelMr}</span>}
      {actions && <div className="ml-auto">{actions}</div>}
    </div>
  );
}

export function PageHeader({ title, titleMr, subtitle, children }) {
  return (
    <div className="bg-surface border-b border-border px-[18px] py-[14px] flex items-start justify-between gap-[10px] flex-wrap">
      <div>
        <h3 className="text-[17px] font-bold text-navy-950 font-serif tracking-[.1px]">{title}</h3>
        {(subtitle || titleMr) && (
          <div className="dv text-[12px] text-muted mt-1">
            {titleMr && <span>{titleMr}</span>}
            {subtitle && <span className={titleMr ? ' · ' + subtitle : subtitle}>{titleMr ? '' : subtitle}</span>}
          </div>
        )}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}
