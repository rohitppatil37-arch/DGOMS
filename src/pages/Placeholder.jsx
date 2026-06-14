// Temporary placeholder for pages not yet built
export default function Placeholder({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-muted">
      <div className="text-5xl">🚧</div>
      <div className="text-[15px] font-semibold">{title} — Coming soon</div>
      <div className="dv text-[13px]">हे पृष्ठ लवकरच येईल</div>
    </div>
  );
}
